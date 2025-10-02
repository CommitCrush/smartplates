/**
 * MongoDB Schema for Spoonacular API Cache
 * 
 * Comprehensive caching system to store ALL Spoonacular API responses
 * to minimize API calls and preserve quota limits
 */

import mongoose, { Model, Document, Schema, Query } from 'mongoose';

import { SpoonacularFoundRecipe } from '../services/spoonacularEnhancements.server';

// ========================================
// Cache Entry Base Interface
// ========================================

interface BaseCacheEntry {
  cacheKey: string;
  data: unknown;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  requestCount: number;
  lastAccessed: Date;
}

// ========================================
// Recipe Cache Schema
// ========================================

export interface ISpoonacularRecipeCache extends Document, BaseCacheEntry {
  spoonacularId: string;
  data: {
    id: number;
    title: string;
    summary: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    extendedIngredients: Array<{
      id: number;
      name: string;
      amount: number;
      unit: string;
      original: string;
      originalName: string;
      meta: string[];
    }>;
    analyzedInstructions: Array<{
      name: string;
      steps: Array<{
        number: number;
        step: string;
        ingredients: Array<{
          id: number;
          name: string;
          image: string;
        }>;
        equipment: Array<{
          id: number;
          name: string;
          image: string;
        }>;
      }>;
    }>;
    cuisines: string[];
    dishTypes: string[];
    diets: string[];
    occasions: string[];
    nutrition?: {
      nutrients: Array<{
        name: string;
        amount: number;
        unit: string;
        percentOfDailyNeeds: number;
      }>;
      properties: Array<{
        name: string;
        amount: number;
        unit: string;
      }>;
      flavonoids: Array<{
        name: string;
        amount: number;
        unit: string;
      }>;
      ingredients: Array<{
        id: number;
        name: string;
        amount: number;
        unit: string;
        nutrients: Array<{
          name: string;
          amount: number;
          unit: string;
          percentOfDailyNeeds: number;
        }>;
      }>;
      caloricBreakdown: {
        percentProtein: number;
        percentFat: number;
        percentCarbs: number;
      };
      weightPerServing: {
        amount: number;
        unit: string;
      };
    };
    winePairing?: {
      pairedWines: string[];
      pairingText: string;
      productMatches: Array<{
        id: number;
        title: string;
        description: string;
        price: string;
        imageUrl: string;
        averageRating: number;
        ratingCount: number;
        score: number;
      }>;
    };
    sourceUrl: string;
    spoonacularSourceUrl: string;
    aggregateLikes: number;
    healthScore: number;
    spoonacularScore: number;
    pricePerServing: number;
    cheap: boolean;
    creditsText: string;
    license: string;
    sourceName: string;
    dairyFree: boolean;
    glutenFree: boolean;
    ketogenic: boolean;
    lowFodmap: boolean;
    sustainable: boolean;
    vegan: boolean;
    vegetarian: boolean;
    veryHealthy: boolean;
    veryPopular: boolean;
    whole30: boolean;
  };
}

const spoonacularRecipeCacheSchema = new Schema<ISpoonacularRecipeCache>({
  cacheKey: { type: String, required: true, unique: true, index: true },
  spoonacularId: { type: String, required: true, unique: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days default
  requestCount: { type: Number, default: 1 },
  lastAccessed: { type: Date, default: Date.now }
});

// ========================================
// Search Results Cache Schema
// ========================================

export interface ISpoonacularSearchCache extends Document, BaseCacheEntry {
  query: string;
  filters: {
    cuisine?: string;
    diet?: string;
    type?: string;
    maxReadyTime?: number;
    intolerances?: string;
    includeIngredients?: string;
    excludeIngredients?: string;
    equipment?: string;
    number?: number;
    offset?: number;
  };
  data: {
    results: Array<{
      id: number;
      title: string;
      image: string;
      readyInMinutes: number;
      servings: number;
      sourceUrl: string;
      spoonacularSourceUrl: string;
      aggregateLikes: number;
      healthScore: number;
      spoonacularScore: number;
      pricePerServing: number;
      analyzedInstructions: unknown[];
      cheap: boolean;
      creditsText: string;
      cuisines: string[];
      dairyFree: boolean;
      diets: string[];
      gaps: string;
      glutenFree: boolean;
      instructions: string;
      ketogenic: boolean;
      license: string;
      lowFodmap: boolean;
      occasions: string[];
      sustainable: boolean;
      vegan: boolean;
      vegetarian: boolean;
      veryHealthy: boolean;
      veryPopular: boolean;
      whole30: boolean;
      weightWatcherSmartPoints: number;
    }>;
    totalResults: number;
    number: number;
    offset: number;
  };
}

const spoonacularSearchCacheSchema = new Schema<ISpoonacularSearchCache>({
  cacheKey: { type: String, required: true, unique: true, index: true },
  query: { type: String, required: true, index: true },
  filters: { type: Schema.Types.Mixed, default: {} },
  data: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours for search results
  requestCount: { type: Number, default: 1 },
  lastAccessed: { type: Date, default: Date.now }
});

// ========================================
// Ingredient Search Cache Schema
// ========================================

export interface ISpoonacularIngredientSearchCache extends Document, BaseCacheEntry {
  ingredients: string[];
  data: SpoonacularFoundRecipe[];
}

const spoonacularIngredientSearchCacheSchema = new Schema<ISpoonacularIngredientSearchCache>({
  cacheKey: { type: String, required: true, unique: true, index: true },
  ingredients: { type: [String], required: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) }, // 2 hours for ingredient searches
  requestCount: { type: Number, default: 1 },
  lastAccessed: { type: Date, default: Date.now }
});

// ========================================
// Random Recipes Cache Schema
// ========================================

export interface ISpoonacularRandomCache extends Document, BaseCacheEntry {
  tags: string[];
  number: number;
  data: {
    recipes: ISpoonacularRecipeCache['data'][]; // Full recipe objects from random endpoint
  };
}

const spoonacularRandomCacheSchema = new Schema<ISpoonacularRandomCache>({
  cacheKey: { type: String, required: true, unique: true, index: true },
  tags: { type: [String], default: [], index: true },
  number: { type: Number, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 6 * 60 * 60 * 1000) }, // 6 hours for random recipes
  requestCount: { type: Number, default: 1 },
  lastAccessed: { type: Date, default: Date.now }
});

// ========================================
// Nutrition Data Cache Schema
// ========================================

export interface ISpoonacularNutritionCache extends Document, BaseCacheEntry {
  recipeId: number;
  data: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
      percentOfDailyNeeds: number;
    }>;
    properties: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
    flavonoids: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
    ingredients: Array<{
      id: number;
      name: string;
      amount: number;
      unit: string;
      nutrients: Array<{
        name: string;
        amount: number;
        unit: string;
        percentOfDailyNeeds: number;
      }>;
    }>;
    caloricBreakdown: {
      percentProtein: number;
      percentFat: number;
      percentCarbs: number;
    };
    weightPerServing: {
      amount: number;
      unit: string;
    };
  };
}

const spoonacularNutritionCacheSchema = new Schema<ISpoonacularNutritionCache>({
  cacheKey: { type: String, required: true, unique: true, index: true },
  recipeId: { type: Number, required: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days for nutrition data
  requestCount: { type: Number, default: 1 },
  lastAccessed: { type: Date, default: Date.now }
});

// ========================================
// API Quota Tracking Schema
// ========================================

export interface ISpoonacularQuotaTracker extends Document {
  date: string; // YYYY-MM-DD format
  requestCount: number;
  quotaLimit: number;
  remainingQuota: number;
  endpoints: {
    complexSearch: number;
    recipeInformation: number;
    findByIngredients: number;
    random: number;
    nutrition: number;
    analyze: number;
  };
  resetTime: Date;
  isQuotaExceeded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const spoonacularQuotaTrackerSchema = new Schema<ISpoonacularQuotaTracker>({
  date: { type: String, required: true, unique: true, index: true },
  requestCount: { type: Number, default: 0 },
  quotaLimit: { type: Number, default: 150 }, // Default daily limit
  remainingQuota: { type: Number, default: 150 },
  endpoints: {
    complexSearch: { type: Number, default: 0 },
    recipeInformation: { type: Number, default: 0 },
    findByIngredients: { type: Number, default: 0 },
    random: { type: Number, default: 0 },
    nutrition: { type: Number, default: 0 },
    analyze: { type: Number, default: 0 }
  },
  resetTime: { type: Date, default: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }},
  isQuotaExceeded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ========================================
// Pre-save Middleware
// ========================================
type MongooseNextFunction = (err?: Error) => void;

// Update timestamps on save for all cache schemas
spoonacularRecipeCacheSchema.pre<ISpoonacularRecipeCache>('save', function(this: ISpoonacularRecipeCache, next: MongooseNextFunction) {
  this.updatedAt = new Date();
  next();
});

spoonacularRecipeCacheSchema.pre<Query<ISpoonacularRecipeCache, ISpoonacularRecipeCache>>('findOneAndUpdate', function(this: Query<ISpoonacularRecipeCache, ISpoonacularRecipeCache>, next: MongooseNextFunction) {
  this.set({ updatedAt: new Date() });
  next();
});

spoonacularSearchCacheSchema.pre<ISpoonacularSearchCache>('save', function(this: ISpoonacularSearchCache, next: MongooseNextFunction) {
  this.updatedAt = new Date();
  next();
});

spoonacularSearchCacheSchema.pre<Query<ISpoonacularSearchCache, ISpoonacularSearchCache>>('findOneAndUpdate', function(this: Query<ISpoonacularSearchCache, ISpoonacularSearchCache>, next: MongooseNextFunction) {
  this.set({ updatedAt: new Date() });
  next();
});

spoonacularIngredientSearchCacheSchema.pre<ISpoonacularIngredientSearchCache>('save', function(this: ISpoonacularIngredientSearchCache, next: MongooseNextFunction) {
  this.updatedAt = new Date();
  next();
});

spoonacularIngredientSearchCacheSchema.pre<Query<ISpoonacularIngredientSearchCache, ISpoonacularIngredientSearchCache>>('findOneAndUpdate', function(this: Query<ISpoonacularIngredientSearchCache, ISpoonacularIngredientSearchCache>, next: MongooseNextFunction) {
  this.set({ updatedAt: new Date() });
  next();
});

spoonacularRandomCacheSchema.pre<ISpoonacularRandomCache>('save', function(this: ISpoonacularRandomCache, next: MongooseNextFunction) {
  this.updatedAt = new Date();
  next();
});

spoonacularRandomCacheSchema.pre<Query<ISpoonacularRandomCache, ISpoonacularRandomCache>>('findOneAndUpdate', function(this: Query<ISpoonacularRandomCache, ISpoonacularRandomCache>, next: MongooseNextFunction) {
  this.set({ updatedAt: new Date() });
  next();
});

spoonacularNutritionCacheSchema.pre<ISpoonacularNutritionCache>('save', function(this: ISpoonacularNutritionCache, next: MongooseNextFunction) {
  this.updatedAt = new Date();
  next();
});

spoonacularNutritionCacheSchema.pre<Query<ISpoonacularNutritionCache, ISpoonacularNutritionCache>>('findOneAndUpdate', function(this: Query<ISpoonacularNutritionCache, ISpoonacularNutritionCache>, next: MongooseNextFunction) {
  this.set({ updatedAt: new Date() });
  next();
});

spoonacularQuotaTrackerSchema.pre<ISpoonacularQuotaTracker>('save', function(this: ISpoonacularQuotaTracker, next: MongooseNextFunction) {
  this.updatedAt = new Date();
  next();
});

spoonacularQuotaTrackerSchema.pre<Query<ISpoonacularQuotaTracker, ISpoonacularQuotaTracker>>('findOneAndUpdate', function(this: Query<ISpoonacularQuotaTracker, ISpoonacularQuotaTracker>, next: MongooseNextFunction) {
  this.set({ updatedAt: new Date() });
  next();
});

// ========================================
// Indexes for Performance
// ========================================

// Compound indices for complex queries
spoonacularSearchCacheSchema.index({ query: 1, filters: 1 });
spoonacularIngredientSearchCacheSchema.index({ ingredients: 1 });
spoonacularRandomCacheSchema.index({ tags: 1, number: 1 });

// TTL index for automatic cleanup of expired entries
spoonacularRecipeCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
spoonacularSearchCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
spoonacularIngredientSearchCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
spoonacularRandomCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
spoonacularNutritionCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ========================================
// Model Creation
// ========================================

export const SpoonacularRecipeCache: Model<ISpoonacularRecipeCache> = 
  mongoose.models.SpoonacularRecipeCache || 
  mongoose.model<ISpoonacularRecipeCache>('SpoonacularRecipeCache', spoonacularRecipeCacheSchema);

export const SpoonacularSearchCache: Model<ISpoonacularSearchCache> = 
  mongoose.models.SpoonacularSearchCache || 
  mongoose.model<ISpoonacularSearchCache>('SpoonacularSearchCache', spoonacularSearchCacheSchema);

export const SpoonacularIngredientSearchCache: Model<ISpoonacularIngredientSearchCache> = 
  mongoose.models.SpoonacularIngredientSearchCache || 
  mongoose.model<ISpoonacularIngredientSearchCache>('SpoonacularIngredientSearchCache', spoonacularIngredientSearchCacheSchema);

export const SpoonacularRandomCache: Model<ISpoonacularRandomCache> = 
  mongoose.models.SpoonacularRandomCache || 
  mongoose.model<ISpoonacularRandomCache>('SpoonacularRandomCache', spoonacularRandomCacheSchema);

export const SpoonacularNutritionCache: Model<ISpoonacularNutritionCache> = 
  mongoose.models.SpoonacularNutritionCache || 
  mongoose.model<ISpoonacularNutritionCache>('SpoonacularNutritionCache', spoonacularNutritionCacheSchema);

export const SpoonacularQuotaTracker: Model<ISpoonacularQuotaTracker> = 
  mongoose.models.SpoonacularQuotaTracker || 
  mongoose.model<ISpoonacularQuotaTracker>('SpoonacularQuotaTracker', spoonacularQuotaTrackerSchema);

// ========================================
// Helper Functions
// ========================================

/**
 * Generate cache key for search requests
 */
export function generateSearchCacheKey(query: string, filters: Record<string, unknown> = {}): string {
  const filterStr = Object.keys(filters)
    .sort()
    .map(key => `${key}=${filters[key]}`)
    .join('&');
  return `search:${query}:${filterStr}`;
}

/**
 * Generate cache key for ingredient search
 */
export function generateIngredientSearchCacheKey(ingredients: string[]): string {
  return `ingredients:${ingredients.sort().join(',')}`;
}

/**
 * Generate cache key for random recipes
 */
export function generateRandomCacheKey(tags: string[] = [], number: number = 10): string {
  return `random:${tags.sort().join(',')}:${number}`;
}

/**
 * Generate cache key for recipe details
 */
export function generateRecipeCacheKey(recipeId: number): string {
  return `recipe:${recipeId}`;
}

/**
 * Generate cache key for nutrition data
 */
export function generateNutritionCacheKey(recipeId: number): string {
  return `nutrition:${recipeId}`;
}

const spoonacularCacheExports = {
  SpoonacularRecipeCache,
  SpoonacularSearchCache,
  SpoonacularIngredientSearchCache,
  SpoonacularRandomCache,
  SpoonacularNutritionCache,
  SpoonacularQuotaTracker,
  generateSearchCacheKey,
  generateIngredientSearchCacheKey,
  generateRandomCacheKey,
  generateRecipeCacheKey,
  generateNutritionCacheKey
};

export default spoonacularCacheExports;