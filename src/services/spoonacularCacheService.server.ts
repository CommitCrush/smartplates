/**
 * Server-Side Spoonacular Cache Implementation
 * 
 * Contains all MongoDB operations and should only be imported server-side
 * to prevent client-side bundling issues
 */

import { 
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
  generateNutritionCacheKey,
  type ISpoonacularRecipeCache,
  type ISpoonacularSearchCache,
  type ISpoonacularIngredientSearchCache,
  type ISpoonacularRandomCache,
  type ISpoonacularNutritionCache,
  type ISpoonacularQuotaTracker
} from '@/models/SpoonacularCache';
import { Recipe } from '@/types/recipe';
import { connectToDatabase } from '@/lib/db';
import { 
  searchSpoonacularRecipes,
  getSpoonacularRecipe,
  searchRecipesByIngredients,
  getPopularSpoonacularRecipes
} from './spoonacularService';

// ========================================
// Configuration
// ========================================

const CACHE_CONFIG = {
  RECIPE_TTL: 7 * 24 * 60 * 60 * 1000,        // 7 days for individual recipes
  SEARCH_TTL: 24 * 60 * 60 * 1000,            // 24 hours for search results
  INGREDIENT_SEARCH_TTL: 2 * 60 * 60 * 1000,  // 2 hours for ingredient searches
  RANDOM_TTL: 6 * 60 * 60 * 1000,             // 6 hours for random recipes
  NUTRITION_TTL: 30 * 24 * 60 * 60 * 1000,    // 30 days for nutrition data
  
  DAILY_QUOTA_LIMIT: 150,                      // Spoonacular free tier limit
  QUOTA_BUFFER: 10,                            // Reserve 10 requests for critical operations
  
  STALE_SERVE_TIME: 3 * 24 * 60 * 60 * 1000   // Serve stale data up to 3 days if quota exceeded
};

// ========================================
// Helper Functions
// ========================================

/**
 * Get today's date string for quota tracking
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if quota allows for new requests
 */
async function checkQuotaAllowance(): Promise<{ allowed: boolean; remaining: number }> {
  await connectToDatabase();
  
  const today = getTodayString();
  let quotaTracker = await SpoonacularQuotaTracker.findOne({ date: today });
  
  if (!quotaTracker) {
    // Create new quota tracker for today
    quotaTracker = new SpoonacularQuotaTracker({
      date: today,
      requestCount: 0,
      quotaLimit: CACHE_CONFIG.DAILY_QUOTA_LIMIT,
      remainingQuota: CACHE_CONFIG.DAILY_QUOTA_LIMIT
    });
    await quotaTracker.save();
  }
  
  const remaining = Math.max(0, quotaTracker.quotaLimit - quotaTracker.requestCount);
  const allowed = remaining > CACHE_CONFIG.QUOTA_BUFFER;
  
  return { allowed, remaining };
}

/**
 * Record API request usage
 */
async function recordApiUsage(endpoint: string): Promise<void> {
  await connectToDatabase();
  
  const today = getTodayString();
  const update = {
    $inc: { 
      requestCount: 1,
      [`endpoints.${endpoint}`]: 1
    },
    $set: { 
      updatedAt: new Date(),
      isQuotaExceeded: false
    },
    $setOnInsert: {
      date: today,
      quotaLimit: CACHE_CONFIG.DAILY_QUOTA_LIMIT,
      createdAt: new Date()
    }
  };
  
  await SpoonacularQuotaTracker.findOneAndUpdate(
    { date: today },
    update,
    { upsert: true, new: true }
  );
}

// ========================================
// Cache Functions
// ========================================

/**
 * Search recipes with new priority logic: API first, then MongoDB cache, then Spoonacular cache service, then preloaded
 */
export async function searchRecipesWithCacheInternal(
  query: string,
  options: any = {}
): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  await connectToDatabase();

  const cacheKey = generateSearchCacheKey(query, options);

  // 1. Try Spoonacular API directly, save fetched data in MongoDB database
  // Skip API call for empty queries to prevent infinite loops
  if (query.trim() !== '') {
    const quotaStatus = await checkQuotaAllowance();

    if (quotaStatus.allowed) {
      try {
        console.log(`🌐 API CALL FIRST for search: "${query}"`);
        const apiResult = await searchSpoonacularRecipes(query, options);

        // Record API usage
        await recordApiUsage('complexSearch');

        // Save all fetched data in MongoDB database
        const cacheData = {
          cacheKey,
          query,
          filters: options,
          data: {
            results: apiResult.recipes.map(recipe => ({
              id: parseInt(String(recipe.id || recipe._id || '0').replace('spoonacular-', '')),
              title: recipe.title,
              image: recipe.image,
              readyInMinutes: recipe.totalTime,
              servings: recipe.servings,
              cuisines: [recipe.cuisine],
              summary: recipe.description
            })),
            totalResults: apiResult.totalResults,
            number: options.number || 12,
            offset: options.offset || 0
          },
          expiresAt: new Date(Date.now() + CACHE_CONFIG.SEARCH_TTL)
        };

        await SpoonacularSearchCache.findOneAndUpdate(
          { cacheKey },
          cacheData,
          { upsert: true, new: true }
        );

        console.log(`💾 Saved API results to MongoDB for: "${query}"`);

        return {
          recipes: apiResult.recipes,
          totalResults: apiResult.totalResults,
          fromCache: false
        };

      } catch (error) {
        console.error('API call failed:', error);
        // Continue to next fallback
      }
    } else {
      console.log(`❌ Quota exceeded (${quotaStatus.remaining} remaining), skipping API call for: "${query}"`);
    }
  } else {
    console.log(`⏭️ Skipping API call for empty search query`);
  }

  // 2. Try MongoDB database Spoonacular cache service
  console.log(`🔍 Checking MongoDB cache for: "${query}"`);
  const cachedResult = await SpoonacularSearchCache.findOne({ cacheKey });

  if (cachedResult && cachedResult.expiresAt > new Date()) {
    console.log(`✅ MongoDB Cache HIT for search: "${query}"`);
    // Update access tracking
    await SpoonacularSearchCache.findByIdAndUpdate(cachedResult._id, {
      $inc: { requestCount: 1 },
      $set: { lastAccessed: new Date() }
    });

    return {
      recipes: cachedResult.data.results.map((result: any) => ({
        id: `spoonacular-${result.id}`,
        title: result.title,
        description: result.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'Delicious recipe from Spoonacular',
        image: result.image,
        servings: result.servings || 4,
        totalTime: result.readyInMinutes || 30,
        difficulty: 'medium' as const,
        category: 'dinner',
        cuisine: result.cuisines?.[0] || 'international',
        rating: 4.0,
        ratingsCount: 0,
        authorId: 'spoonacular',
        authorName: 'Spoonacular',
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['spoonacular'],
        ingredients: [],
        instructions: []
      })),
      totalResults: cachedResult.data.totalResults,
      fromCache: true
    };
  }

  // 3. Try Spoonacular cache service (.cache/recipes.json)
  console.log(`🔍 Checking Spoonacular cache service for: "${query}"`);
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const cachePath = path.join(process.cwd(), '.cache', 'recipes.json');

    const cacheData = await fs.readFile(cachePath, 'utf-8');
    const parsedCache = JSON.parse(cacheData);
    const cachedRecipes = parsedCache.recipes || [];

    // Filter cached recipes by query
    const filteredRecipes = cachedRecipes.filter((recipe: any) =>
      recipe.title.toLowerCase().includes(query.toLowerCase()) ||
      recipe.description.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredRecipes.length > 0) {
      console.log(`✅ Spoonacular cache service HIT for: "${query}" (${filteredRecipes.length} recipes)`);

      const recipes: Recipe[] = filteredRecipes.slice(0, options.number || 12).map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        difficulty: recipe.difficulty,
        category: recipe.category,
        cuisine: recipe.cuisine,
        dietaryRestrictions: recipe.dietaryRestrictions || [],
        tags: recipe.tags || [],
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        rating: recipe.rating || 4.0,
        ratingsCount: recipe.ratingsCount || 0,
        likesCount: recipe.likesCount || 0,
        authorId: recipe.authorId || 'spoonacular',
        authorName: recipe.authorName || 'Spoonacular',
        createdAt: recipe.createdAt || new Date().toISOString(),
        updatedAt: recipe.updatedAt || new Date().toISOString(),
        isPublished: recipe.isPublished !== false
      }));

      return {
        recipes,
        totalResults: filteredRecipes.length,
        fromCache: true
      };
    }
  } catch (error) {
    console.log(`Spoonacular cache service not available:`, error instanceof Error ? error.message : String(error));
  }

  // 4. Try MongoDB cache (stale data)
  console.log(`🔍 Checking MongoDB stale cache for: "${query}"`);
  const staleCache = await SpoonacularSearchCache.findOne({ cacheKey });
  if (staleCache) {
    console.log(`🔄 Serving stale MongoDB cache for: "${query}"`);
    return {
      recipes: staleCache.data.results.map((result: any) => ({
        id: `spoonacular-${result.id}`,
        title: result.title,
        description: result.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'Delicious recipe from Spoonacular',
        image: result.image,
        servings: result.servings || 4,
        totalTime: result.readyInMinutes || 30,
        difficulty: 'medium' as const,
        category: 'dinner',
        cuisine: result.cuisines?.[0] || 'international',
        rating: 4.0,
        ratingsCount: 0,
        authorId: 'spoonacular',
        authorName: 'Spoonacular',
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['spoonacular'],
        ingredients: [],
        instructions: []
      })),
      totalResults: staleCache.data.totalResults,
      fromCache: true
    };
  }

  // 5. Only use preloaded as fallback
  console.log(`📚 Using preloaded recipes as final fallback for: "${query}"`);
  const { searchPreloadedRecipes } = await import('./preloadedRecipes');
  const preloadedRecipes = searchPreloadedRecipes(query);

  const recipes: Recipe[] = preloadedRecipes.slice(0, options.number || 12).map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.summary,
    image: recipe.image,
    servings: recipe.servings,
    totalTime: recipe.readyInMinutes,
    difficulty: recipe.difficulty as any,
    category: recipe.category as any,
    cuisine: 'international',
    dietaryRestrictions: [
      ...(recipe.vegan ? ['vegan'] : []),
      ...(recipe.vegetarian ? ['vegetarian'] : []),
      ...(recipe.glutenFree ? ['gluten-free'] : []),
      ...(recipe.dairyFree ? ['dairy-free'] : [])
    ],
    tags: ['preloaded'],
    ingredients: recipe.ingredients.map(ing => ({
      id: `preloaded-ing-${Math.random()}`,
      name: ing,
      amount: 1,
      unit: '',
      notes: ''
    })),
    instructions: recipe.instructions.map((inst, idx) => ({
      id: `preloaded-step-${idx}`,
      stepNumber: idx + 1,
      instruction: inst
    })),
    rating: 4.0,
    ratingsCount: 0,
    likesCount: 0,
    authorId: 'preloaded',
    authorName: 'Smart Plates',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true
  }));

  return {
    recipes,
    totalResults: preloadedRecipes.length,
    fromCache: true
  };
}

/**
 * Get recipe with new priority logic: API first, then MongoDB cache, then Spoonacular cache service, then preloaded
 */
export async function getRecipeWithCacheInternal(recipeId: string): Promise<{ recipe: Recipe | null; fromCache: boolean }> {
  await connectToDatabase();

  const numericId = parseInt(recipeId.replace('spoonacular-', ''));
  const cacheKey = generateRecipeCacheKey(numericId);

  // 1. Try Spoonacular API directly, save fetched data in MongoDB database
  const quotaStatus = await checkQuotaAllowance();

  if (quotaStatus.allowed) {
    try {
      console.log(`🌐 API CALL FIRST for recipe: ${recipeId}`);
      const apiRecipe = await getSpoonacularRecipe(recipeId);

      if (!apiRecipe) {
        // Continue to next fallback
      } else {
        await recordApiUsage('recipeInformation');

        // Save all fetched data in MongoDB database
        const cacheData = {
          cacheKey,
          spoonacularId: numericId,
          data: {
            id: numericId,
            title: apiRecipe.title,
            summary: apiRecipe.description,
            image: apiRecipe.image,
            readyInMinutes: apiRecipe.totalTime,
            servings: apiRecipe.servings,
            extendedIngredients: Array.isArray(apiRecipe.ingredients)
              ? apiRecipe.ingredients.map((ing: any) => ({
                  id: parseInt(String(ing.id || '0').replace('spoonacular-ingredient-', '')),
                  name: ing.name || '',
                  amount: ing.amount || 1,
                  unit: ing.unit || '',
                  original: `${ing.amount || 1} ${ing.unit || ''} ${ing.name || ''}`,
                  originalName: ing.name || '',
                  meta: []
                }))
              : [],
            analyzedInstructions: [{
              name: '',
              steps: Array.isArray(apiRecipe.instructions)
                ? apiRecipe.instructions.map((inst: any) => ({
                    number: inst.stepNumber || 1,
                    step: inst.instruction || inst,
                    ingredients: [],
                    equipment: []
                  }))
                : []
            }],
            cuisines: [apiRecipe.cuisine],
            dishTypes: [apiRecipe.category],
            diets: apiRecipe.dietaryRestrictions,
            aggregateLikes: apiRecipe.likesCount
          },
          expiresAt: new Date(Date.now() + CACHE_CONFIG.RECIPE_TTL)
        };

        await SpoonacularRecipeCache.findOneAndUpdate(
          { cacheKey },
          cacheData,
          { upsert: true, new: true }
        );

        console.log(`💾 Saved API recipe to MongoDB: ${recipeId}`);

        return { recipe: apiRecipe, fromCache: false };
      }
    } catch (error) {
      console.error('Recipe API call failed:', error);
      // Continue to next fallback
    }
  } else {
    console.log(`❌ Quota exceeded (${quotaStatus.remaining} remaining), skipping API call for recipe: ${recipeId}`);
  }

  // 2. Try MongoDB database Spoonacular cache service
  console.log(`🔍 Checking MongoDB cache for recipe: ${recipeId}`);
  const cachedRecipe = await SpoonacularRecipeCache.findOne({ cacheKey });

  if (cachedRecipe && cachedRecipe.expiresAt > new Date()) {
    console.log(`✅ MongoDB Cache HIT for recipe: ${recipeId}`);
    await SpoonacularRecipeCache.findByIdAndUpdate(cachedRecipe._id, {
      $inc: { requestCount: 1 },
      $set: { lastAccessed: new Date() }
    });

    // Convert cached data to Recipe format
    const recipe: Recipe = {
      id: recipeId,
      title: cachedRecipe.data.title,
      description: cachedRecipe.data.summary?.replace(/<[^>]*>/g, '').substring(0, 300) + '...' || '',
      image: cachedRecipe.data.image,
      servings: cachedRecipe.data.servings,
      prepTime: Math.floor(cachedRecipe.data.readyInMinutes * 0.3),
      cookTime: Math.floor(cachedRecipe.data.readyInMinutes * 0.7),
      totalTime: cachedRecipe.data.readyInMinutes,
      difficulty: 'medium',
      category: cachedRecipe.data.dishTypes?.includes('breakfast') ? 'breakfast' :
                cachedRecipe.data.dishTypes?.includes('lunch') ? 'lunch' :
                cachedRecipe.data.dishTypes?.includes('dessert') ? 'dessert' :
                cachedRecipe.data.dishTypes?.includes('snack') ? 'snack' : 'dinner',
      cuisine: cachedRecipe.data.cuisines?.[0] || 'international',
      dietaryRestrictions: cachedRecipe.data.diets || [],
      tags: [...(cachedRecipe.data.cuisines || []), ...(cachedRecipe.data.diets || []), 'spoonacular'],
      ingredients: cachedRecipe.data.extendedIngredients?.map((ing: any, index: number) => ({
        id: `spoonacular-ingredient-${index}`,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        notes: ''
      })) || [],
      instructions: cachedRecipe.data.analyzedInstructions?.[0]?.steps?.map((step: any) => ({
        id: `spoonacular-step-${step.number}`,
        stepNumber: step.number,
        instruction: step.step
      })) || [],
      rating: 4.0,
      ratingsCount: 0,
      likesCount: cachedRecipe.data.aggregateLikes || 0,
      authorId: 'spoonacular',
      authorName: 'Spoonacular',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true
    };

    return { recipe, fromCache: true };
  }

  // 3. Try Spoonacular cache service (.cache/recipes.json)
  console.log(`🔍 Checking Spoonacular cache service for recipe: ${recipeId}`);
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const cachePath = path.join(process.cwd(), '.cache', 'recipes.json');

    const cacheData = await fs.readFile(cachePath, 'utf-8');
    const parsedCache = JSON.parse(cacheData);
    const cachedRecipes = parsedCache.recipes || [];

    // Find recipe by ID
    const cachedRecipeData = cachedRecipes.find((recipe: any) => recipe.id === recipeId || recipe.id === `spoonacular-${numericId}`);

    if (cachedRecipeData) {
      console.log(`✅ Spoonacular cache service HIT for recipe: ${recipeId}`);

      const recipe: Recipe = {
        id: cachedRecipeData.id,
        title: cachedRecipeData.title,
        description: cachedRecipeData.description,
        image: cachedRecipeData.image,
        servings: cachedRecipeData.servings,
        prepTime: cachedRecipeData.prepTime,
        cookTime: cachedRecipeData.cookTime,
        totalTime: cachedRecipeData.totalTime,
        difficulty: cachedRecipeData.difficulty,
        category: cachedRecipeData.category,
        cuisine: cachedRecipeData.cuisine,
        dietaryRestrictions: cachedRecipeData.dietaryRestrictions || [],
        tags: cachedRecipeData.tags || [],
        ingredients: cachedRecipeData.ingredients || [],
        instructions: cachedRecipeData.instructions || [],
        rating: cachedRecipeData.rating || 4.0,
        ratingsCount: cachedRecipeData.ratingsCount || 0,
        likesCount: cachedRecipeData.likesCount || 0,
        authorId: cachedRecipeData.authorId || 'spoonacular',
        authorName: cachedRecipeData.authorName || 'Spoonacular',
        createdAt: cachedRecipeData.createdAt || new Date().toISOString(),
        updatedAt: cachedRecipeData.updatedAt || new Date().toISOString(),
        isPublished: cachedRecipeData.isPublished !== false
      };

      return { recipe, fromCache: true };
    }
  } catch (error) {
    console.log(`Spoonacular cache service not available for recipe:`, error instanceof Error ? error.message : String(error));
  }

  // 4. Try MongoDB cache (stale data)
  console.log(`🔍 Checking MongoDB stale cache for recipe: ${recipeId}`);
  const staleCache = await SpoonacularRecipeCache.findOne({ cacheKey });
  if (staleCache) {
    console.log(`🔄 Serving stale MongoDB cache for recipe: ${recipeId}`);

    const recipe: Recipe = {
      id: recipeId,
      title: staleCache.data.title,
      description: staleCache.data.summary?.replace(/<[^>]*>/g, '').substring(0, 300) + '...' || '',
      image: staleCache.data.image,
      servings: staleCache.data.servings,
      prepTime: Math.floor(staleCache.data.readyInMinutes * 0.3),
      cookTime: Math.floor(staleCache.data.readyInMinutes * 0.7),
      totalTime: staleCache.data.readyInMinutes,
      difficulty: 'medium',
      category: staleCache.data.dishTypes?.includes('breakfast') ? 'breakfast' :
                staleCache.data.dishTypes?.includes('lunch') ? 'lunch' :
                staleCache.data.dishTypes?.includes('dessert') ? 'dessert' :
                staleCache.data.dishTypes?.includes('snack') ? 'snack' : 'dinner',
      cuisine: staleCache.data.cuisines?.[0] || 'international',
      dietaryRestrictions: staleCache.data.diets || [],
      tags: [...(staleCache.data.cuisines || []), ...(staleCache.data.diets || []), 'spoonacular'],
      ingredients: staleCache.data.extendedIngredients?.map((ing: any, index: number) => ({
        id: `spoonacular-ingredient-${index}`,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        notes: ''
      })) || [],
      instructions: staleCache.data.analyzedInstructions?.[0]?.steps?.map((step: any) => ({
        id: `spoonacular-step-${step.number}`,
        stepNumber: step.number,
        instruction: step.step
      })) || [],
      rating: 4.0,
      ratingsCount: 0,
      likesCount: staleCache.data.aggregateLikes || 0,
      authorId: 'spoonacular',
      authorName: 'Spoonacular',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true
    };

    return { recipe, fromCache: true };
  }

  // 5. Only use preloaded as fallback
  console.log(`📚 Using preloaded recipes as final fallback for recipe: ${recipeId}`);
  const { PRELOADED_RECIPES } = await import('./preloadedRecipes');

  // Try to find a matching preloaded recipe by title similarity or just return the first one
  const preloadedRecipe = PRELOADED_RECIPES.find(recipe =>
    recipe.title.toLowerCase().includes(recipeId.replace('spoonacular-', '').toLowerCase())
  ) || PRELOADED_RECIPES[0];

  if (preloadedRecipe) {
    const recipe: Recipe = {
      id: preloadedRecipe.id,
      title: preloadedRecipe.title,
      description: preloadedRecipe.summary,
      image: preloadedRecipe.image,
      servings: preloadedRecipe.servings,
      totalTime: preloadedRecipe.readyInMinutes,
      difficulty: preloadedRecipe.difficulty as any,
      category: preloadedRecipe.category as any,
      cuisine: 'international',
      dietaryRestrictions: [
        ...(preloadedRecipe.vegan ? ['vegan'] : []),
        ...(preloadedRecipe.vegetarian ? ['vegetarian'] : []),
        ...(preloadedRecipe.glutenFree ? ['gluten-free'] : []),
        ...(preloadedRecipe.dairyFree ? ['dairy-free'] : [])
      ],
      tags: ['preloaded'],
      ingredients: preloadedRecipe.ingredients.map(ing => ({
        id: `preloaded-ing-${Math.random()}`,
        name: ing,
        amount: 1,
        unit: '',
        notes: ''
      })),
      instructions: preloadedRecipe.instructions.map((inst, idx) => ({
        id: `preloaded-step-${idx}`,
        stepNumber: idx + 1,
        instruction: inst
      })),
      rating: 4.0,
      ratingsCount: 0,
      likesCount: 0,
      authorId: 'preloaded',
      authorName: 'Smart Plates',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true
    };

    return { recipe, fromCache: true };
  }

  return { recipe: null, fromCache: false };
}

/**
 * Search recipes by ingredients with new priority logic: API first, then MongoDB cache, then Spoonacular cache service, then preloaded
 */
export async function searchRecipesByIngredientsWithCacheInternal(
  ingredients: string[],
  options: any = {}
): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
  await connectToDatabase();

  const cacheKey = generateIngredientSearchCacheKey(ingredients);

  // 1. Try Spoonacular API directly, save fetched data in MongoDB database
  const quotaStatus = await checkQuotaAllowance();

  if (quotaStatus.allowed) {
    try {
      console.log(`🌐 API CALL FIRST for ingredient search: ${ingredients.join(', ')}`);
      const apiResult = await searchRecipesByIngredients(ingredients);
      const apiRecipes = apiResult.recipes;

      await recordApiUsage('findByIngredients');

      // Save all fetched data in MongoDB database
      const cacheData = {
        cacheKey,
        ingredients,
        data: apiRecipes.map((recipe: any) => ({
          id: parseInt(String(recipe.id || recipe._id || '0').replace('spoonacular-', '')),
          title: recipe.title,
          image: recipe.image,
          usedIngredientCount: 2,
          missedIngredientCount: 1,
          likes: recipe.likesCount || 0,
          summary: recipe.description
        })),
        expiresAt: new Date(Date.now() + CACHE_CONFIG.INGREDIENT_SEARCH_TTL)
      };

      await SpoonacularIngredientSearchCache.findOneAndUpdate(
        { cacheKey },
        cacheData,
        { upsert: true, new: true }
      );

      console.log(`💾 Saved API ingredient search to MongoDB: ${ingredients.join(', ')}`);

      return { recipes: apiRecipes, fromCache: false };

    } catch (error) {
      console.error('Ingredient search API call failed:', error);
      // Continue to next fallback
    }
  } else {
    console.log(`❌ Quota exceeded (${quotaStatus.remaining} remaining), skipping API call for ingredient search: ${ingredients.join(', ')}`);
  }

  // 2. Try MongoDB database Spoonacular cache service
  console.log(`🔍 Checking MongoDB cache for ingredient search: ${ingredients.join(', ')}`);
  const cachedResult = await SpoonacularIngredientSearchCache.findOne({ cacheKey });

  if (cachedResult && cachedResult.expiresAt > new Date()) {
    console.log(`✅ MongoDB Cache HIT for ingredient search: ${ingredients.join(', ')}`);
    await SpoonacularIngredientSearchCache.findByIdAndUpdate(cachedResult._id, {
      $inc: { requestCount: 1 },
      $set: { lastAccessed: new Date() }
    });

    // Convert cached results to Recipe format (simplified)
    const recipes: Recipe[] = cachedResult.data.slice(0, 6).map((item: any) => ({
      id: `spoonacular-${item.id}`,
      title: item.title,
      description: item.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'Recipe found by ingredients',
      image: item.image,
      servings: 4,
      totalTime: 30,
      difficulty: 'medium' as const,
      category: 'dinner',
      cuisine: 'international',
      rating: 4.0,
      ratingsCount: 0,
      authorId: 'spoonacular',
      authorName: 'Spoonacular',
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['spoonacular'],
      ingredients: [],
      instructions: []
    }));

    return { recipes, fromCache: true };
  }

  // 3. Try Spoonacular cache service (.cache/recipes.json) - filter by ingredients
  console.log(`🔍 Checking Spoonacular cache service for ingredient search: ${ingredients.join(', ')}`);
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const cachePath = path.join(process.cwd(), '.cache', 'recipes.json');

    const cacheData = await fs.readFile(cachePath, 'utf-8');
    const parsedCache = JSON.parse(cacheData);
    const cachedRecipes = parsedCache.recipes || [];

    // Filter recipes that contain the searched ingredients
    const filteredRecipes = cachedRecipes.filter((recipe: any) =>
      ingredients.some(ing =>
        recipe.ingredients?.some((recipeIng: any) =>
          recipeIng.name?.toLowerCase().includes(ing.toLowerCase())
        )
      )
    );

    if (filteredRecipes.length > 0) {
      console.log(`✅ Spoonacular cache service HIT for ingredient search: ${ingredients.join(', ')} (${filteredRecipes.length} recipes)`);

      const recipes: Recipe[] = filteredRecipes.slice(0, 6).map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        difficulty: recipe.difficulty,
        category: recipe.category,
        cuisine: recipe.cuisine,
        dietaryRestrictions: recipe.dietaryRestrictions || [],
        tags: recipe.tags || [],
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        rating: recipe.rating || 4.0,
        ratingsCount: recipe.ratingsCount || 0,
        likesCount: recipe.likesCount || 0,
        authorId: recipe.authorId || 'spoonacular',
        authorName: recipe.authorName || 'Spoonacular',
        createdAt: recipe.createdAt || new Date().toISOString(),
        updatedAt: recipe.updatedAt || new Date().toISOString(),
        isPublished: recipe.isPublished !== false
      }));

      return { recipes, fromCache: true };
    }
  } catch (error) {
    console.log(`Spoonacular cache service not available for ingredient search:`, error instanceof Error ? error.message : String(error));
  }

  // 4. Try MongoDB cache (stale data)
  console.log(`🔍 Checking MongoDB stale cache for ingredient search: ${ingredients.join(', ')}`);
  const staleCache = await SpoonacularIngredientSearchCache.findOne({ cacheKey });
  if (staleCache) {
    console.log(`🔄 Serving stale MongoDB cache for ingredient search: ${ingredients.join(', ')}`);

    const recipes: Recipe[] = staleCache.data.slice(0, 6).map((item: any) => ({
      id: `spoonacular-${item.id}`,
      title: item.title,
      description: item.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'Recipe found by ingredients',
      image: item.image,
      servings: 4,
      totalTime: 30,
      difficulty: 'medium' as const,
      category: 'dinner',
      cuisine: 'international',
      rating: 4.0,
      ratingsCount: 0,
      authorId: 'spoonacular',
      authorName: 'Spoonacular',
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['spoonacular'],
      ingredients: [],
      instructions: []
    }));

    return { recipes, fromCache: true };
  }

  // 5. Only use preloaded as fallback
  console.log(`📚 Using preloaded recipes as final fallback for ingredient search: ${ingredients.join(', ')}`);
  const { PRELOADED_RECIPES } = await import('./preloadedRecipes');

  // Filter preloaded recipes that contain the searched ingredients
  const filteredPreloaded = PRELOADED_RECIPES.filter(recipe =>
    ingredients.some(ing =>
      recipe.ingredients.some(recipeIng =>
        recipeIng.toLowerCase().includes(ing.toLowerCase())
      )
    )
  );

  const recipes: Recipe[] = filteredPreloaded.slice(0, 6).map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.summary,
    image: recipe.image,
    servings: recipe.servings,
    totalTime: recipe.readyInMinutes,
    difficulty: recipe.difficulty as any,
    category: recipe.category as any,
    cuisine: 'international',
    dietaryRestrictions: [
      ...(recipe.vegan ? ['vegan'] : []),
      ...(recipe.vegetarian ? ['vegetarian'] : []),
      ...(recipe.glutenFree ? ['gluten-free'] : []),
      ...(recipe.dairyFree ? ['dairy-free'] : [])
    ],
    tags: ['preloaded'],
    ingredients: recipe.ingredients.map(ing => ({
      id: `preloaded-ing-${Math.random()}`,
      name: ing,
      amount: 1,
      unit: '',
      notes: ''
    })),
    instructions: recipe.instructions.map((inst, idx) => ({
      id: `preloaded-step-${idx}`,
      stepNumber: idx + 1,
      instruction: inst
    })),
    rating: 4.0,
    ratingsCount: 0,
    likesCount: 0,
    authorId: 'preloaded',
    authorName: 'Smart Plates',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true
  }));

  return { recipes, fromCache: true };
}

/**
 * Get popular recipes with new priority logic: API first, then MongoDB cache, then Spoonacular cache service, then preloaded
 */
export async function getPopularRecipesWithCacheInternal(
  options: any = {}
): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
  await connectToDatabase();

  const tags = options.tags || [];
  const number = options.number || 10;
  const cacheKey = generateRandomCacheKey(tags, number);

  // 1. Try Spoonacular API directly, save fetched data in MongoDB database
  const quotaStatus = await checkQuotaAllowance();

  if (quotaStatus.allowed) {
    try {
      console.log(`🌐 API CALL FIRST for popular recipes`);
      const apiResult = await getPopularSpoonacularRecipes();
      const apiRecipes = apiResult.recipes;

      await recordApiUsage('random');

      // Save all fetched data in MongoDB database
      const cacheData = {
        cacheKey,
        tags,
        number,
        data: { recipes: apiRecipes },
        expiresAt: new Date(Date.now() + CACHE_CONFIG.RANDOM_TTL)
      };

      await SpoonacularRandomCache.findOneAndUpdate(
        { cacheKey },
        cacheData,
        { upsert: true, new: true }
      );

      console.log(`💾 Saved API popular recipes to MongoDB`);

      return { recipes: apiRecipes, fromCache: false };

    } catch (error) {
      console.error('Popular recipes API call failed:', error);
      // Continue to next fallback
    }
  } else {
    console.log(`❌ Quota exceeded (${quotaStatus.remaining} remaining), skipping API call for popular recipes`);
  }

  // 2. Try MongoDB database Spoonacular cache service
  console.log(`🔍 Checking MongoDB cache for popular recipes`);
  const cachedResult = await SpoonacularRandomCache.findOne({ cacheKey });

  if (cachedResult && cachedResult.expiresAt > new Date()) {
    console.log(`✅ MongoDB Cache HIT for popular recipes`);
    await SpoonacularRandomCache.findByIdAndUpdate(cachedResult._id, {
      $inc: { requestCount: 1 },
      $set: { lastAccessed: new Date() }
    });

    return { recipes: cachedResult.data.recipes, fromCache: true };
  }

  // 3. Try Spoonacular cache service (.cache/recipes.json) - get popular recipes
  console.log(`🔍 Checking Spoonacular cache service for popular recipes`);
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const cachePath = path.join(process.cwd(), '.cache', 'recipes.json');

    const cacheData = await fs.readFile(cachePath, 'utf-8');
    const parsedCache = JSON.parse(cacheData);
    const cachedRecipes = parsedCache.recipes || [];

    // Sort by rating and likes to get "popular" recipes
    const popularRecipes = cachedRecipes
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0) || (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, number);

    if (popularRecipes.length > 0) {
      console.log(`✅ Spoonacular cache service HIT for popular recipes (${popularRecipes.length} recipes)`);

      const recipes: Recipe[] = popularRecipes.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        difficulty: recipe.difficulty,
        category: recipe.category,
        cuisine: recipe.cuisine,
        dietaryRestrictions: recipe.dietaryRestrictions || [],
        tags: recipe.tags || [],
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        rating: recipe.rating || 4.0,
        ratingsCount: recipe.ratingsCount || 0,
        likesCount: recipe.likesCount || 0,
        authorId: recipe.authorId || 'spoonacular',
        authorName: recipe.authorName || 'Spoonacular',
        createdAt: recipe.createdAt || new Date().toISOString(),
        updatedAt: recipe.updatedAt || new Date().toISOString(),
        isPublished: recipe.isPublished !== false
      }));

      return { recipes, fromCache: true };
    }
  } catch (error) {
    console.log(`Spoonacular cache service not available for popular recipes:`, error instanceof Error ? error.message : String(error));
  }

  // 4. Try MongoDB cache (stale data)
  console.log(`🔍 Checking MongoDB stale cache for popular recipes`);
  const staleCache = await SpoonacularRandomCache.findOne({ cacheKey });
  if (staleCache) {
    console.log(`🔄 Serving stale MongoDB cache for popular recipes`);
    return { recipes: staleCache.data.recipes, fromCache: true };
  }

  // 5. Only use preloaded as fallback
  console.log(`📚 Using preloaded recipes as final fallback for popular recipes`);
  const { PRELOADED_RECIPES } = await import('./preloadedRecipes');

  // Sort preloaded recipes by some criteria to simulate "popular"
  const popularPreloaded = PRELOADED_RECIPES
    .sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0))
    .slice(0, number);

  const recipes: Recipe[] = popularPreloaded.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.summary,
    image: recipe.image,
    servings: recipe.servings,
    totalTime: recipe.readyInMinutes,
    difficulty: recipe.difficulty as any,
    category: recipe.category as any,
    cuisine: 'international',
    dietaryRestrictions: [
      ...(recipe.vegan ? ['vegan'] : []),
      ...(recipe.vegetarian ? ['vegetarian'] : []),
      ...(recipe.glutenFree ? ['gluten-free'] : []),
      ...(recipe.dairyFree ? ['dairy-free'] : [])
    ],
    tags: ['preloaded'],
    ingredients: recipe.ingredients.map(ing => ({
      id: `preloaded-ing-${Math.random()}`,
      name: ing,
      amount: 1,
      unit: '',
      notes: ''
    })),
    instructions: recipe.instructions.map((inst, idx) => ({
      id: `preloaded-step-${idx}`,
      stepNumber: idx + 1,
      instruction: inst
    })),
    rating: 4.0,
    ratingsCount: 0,
    likesCount: 0,
    authorId: 'preloaded',
    authorName: 'Smart Plates',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true
  }));

  return { recipes, fromCache: true };
}

/**
 * Get cache statistics
 */
export async function getCacheStatsInternal(): Promise<any> {
  await connectToDatabase();
  
  const [
    recipeCount,
    searchCount,
    ingredientSearchCount,
    randomCount,
    quotaTracker
  ] = await Promise.all([
    SpoonacularRecipeCache.countDocuments(),
    SpoonacularSearchCache.countDocuments(),
    SpoonacularIngredientSearchCache.countDocuments(),
    SpoonacularRandomCache.countDocuments(),
    SpoonacularQuotaTracker.findOne({ date: getTodayString() })
  ]);
  
  return {
    totalCachedRecipes: recipeCount,
    totalSearches: searchCount,
    totalIngredientSearches: ingredientSearchCount,
    totalRandomRequests: randomCount,
    todayQuotaUsage: quotaTracker?.requestCount || 0,
    quotaLimit: quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT,
    remainingQuota: Math.max(0, (quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - (quotaTracker?.requestCount || 0))
  };
}

/**
 * Get quota status
 */
export async function getQuotaStatusInternal(): Promise<any> {
  await connectToDatabase();
  
  const quotaTracker = await SpoonacularQuotaTracker.findOne({ date: getTodayString() });
  
  return {
    date: getTodayString(),
    used: quotaTracker?.requestCount || 0,
    limit: quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT,
    remaining: Math.max(0, (quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - (quotaTracker?.requestCount || 0)),
    canMakeRequests: Math.max(0, (quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - (quotaTracker?.requestCount || 0)) > CACHE_CONFIG.QUOTA_BUFFER,
    endpoints: quotaTracker?.endpoints || {}
  };
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCacheInternal(): Promise<void> {
  await connectToDatabase();
  
  const now = new Date();
  
  await Promise.all([
    SpoonacularRecipeCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularSearchCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularIngredientSearchCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularRandomCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularNutritionCache.deleteMany({ expiresAt: { $lt: now } })
  ]);
  
  console.log('🧹 Cleared expired cache entries');
}

/**
 * Import cached recipes from JSON file to MongoDB
 */
export async function importCachedRecipesToDB(): Promise<{ imported: number; skipped: number; errors: number }> {
  await connectToDatabase();
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  try {
    // Read the cached recipes JSON file
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const jsonPath = path.join(process.cwd(), 'public', 'cached-recipes.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const parsedData = JSON.parse(jsonData);
    const cachedRecipes = parsedData.recipes || parsedData; // Handle both {recipes: [...]} and [...] formats
    
    console.log(`📥 Found ${cachedRecipes.length} recipes in cached file`);
    
    for (const recipe of cachedRecipes) {
      try {
        // Create cache entry directly (skip duplicate check for performance)
        const cacheEntry = new SpoonacularRecipeCache({
          spoonacularId: recipe.id,
          cacheKey: `recipe:${recipe.id}`,
          data: recipe,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + CACHE_CONFIG.RECIPE_TTL)
        });
        
        try {
          await cacheEntry.save();
        } catch (saveError: any) {
          if (saveError.code === 11000) {
            // Duplicate key error (recipe already exists)
            console.log(`⏩ Recipe ${recipe.id} (${recipe.title}) already cached, skipping`);
            skipped++;
            continue;
          } else {
            throw saveError;
          }
        }
        
        console.log(`✅ Imported recipe ${recipe.id} (${recipe.title})`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Error importing recipe ${recipe.id}:`, error);
        errors++;
      }
    }
    
    // Note: No quota tracking needed for importing cached data
    
    console.log(`📊 Import Summary - Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);
    
  } catch (error) {
    console.error('❌ Error reading cached recipes file:', error);
    throw error;
  }
  
  return { imported, skipped, errors };
}

// Export internal functions for service integration
export { searchRecipesWithCacheInternal as searchRecipesInternal };
export { getRecipeWithCacheInternal as getRecipeInternal };
export { searchRecipesByIngredientsWithCacheInternal as searchRecipesByIngredientsInternal };
export { getPopularRecipesWithCacheInternal as getPopularRecipesInternal };