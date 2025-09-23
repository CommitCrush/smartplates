/**
 * Ingredient Database for SmartPlates
 * 
 * Contains common ingredients with standardized names, categories,
 * and unit conversions for better grocery list generation.
 */

export interface IngredientInfo {
  name: string;                       // Standard ingredient name
  aliases: string[];                  // Alternative names/spellings
  category: string;                   // Grocery store category
  commonUnits: string[];             // Common units for this ingredient
  baseUnit: string;                  // Standard unit for conversions
  density?: number;                  // For volume to weight conversions
  estimatedCostPerUnit?: number;     // Cost per base unit (USD)
  isStaple: boolean;                 // Is this a pantry staple item
}

// Grocery store categories for organizing shopping lists
export const GROCERY_CATEGORIES = {
  PRODUCE: 'Produce',
  MEAT: 'Meat & Seafood', 
  DAIRY: 'Dairy & Eggs',
  PANTRY: 'Pantry & Dry Goods',
  FROZEN: 'Frozen',
  BAKERY: 'Bakery',
  BEVERAGES: 'Beverages',
  CONDIMENTS: 'Condiments & Sauces',
  SNACKS: 'Snacks',
  HOUSEHOLD: 'Household Items'
} as const;

// Common ingredients database
export const INGREDIENTS_DB: Record<string, IngredientInfo> = {
  // Produce
  'onion': {
    name: 'onion',
    aliases: ['onions', 'yellow onion', 'white onion'],
    category: GROCERY_CATEGORIES.PRODUCE,
    commonUnits: ['pcs', 'pieces', 'whole', 'cup', 'cups'],
    baseUnit: 'pcs',
    estimatedCostPerUnit: 0.5,
    isStaple: false
  },
  'garlic': {
    name: 'garlic',
    aliases: ['garlic cloves', 'garlic clove', 'fresh garlic'],
    category: GROCERY_CATEGORIES.PRODUCE,
    commonUnits: ['cloves', 'clove', 'tsp', 'tbsp'],
    baseUnit: 'cloves',
    estimatedCostPerUnit: 0.1,
    isStaple: false
  },
  'tomato': {
    name: 'tomato',
    aliases: ['tomatoes', 'fresh tomato', 'fresh tomatoes'],
    category: GROCERY_CATEGORIES.PRODUCE,
    commonUnits: ['pcs', 'pieces', 'lbs', 'kg', 'cups'],
    baseUnit: 'pcs',
    estimatedCostPerUnit: 1.5,
    isStaple: false
  },
  'carrot': {
    name: 'carrot',
    aliases: ['carrots', 'baby carrots'],
    category: GROCERY_CATEGORIES.PRODUCE,
    commonUnits: ['pcs', 'pieces', 'lbs', 'kg', 'cups'],
    baseUnit: 'lbs',
    estimatedCostPerUnit: 1.2,
    isStaple: false
  },
  'potato': {
    name: 'potato',
    aliases: ['potatoes', 'russet potato', 'red potato'],
    category: GROCERY_CATEGORIES.PRODUCE,
    commonUnits: ['pcs', 'pieces', 'lbs', 'kg'],
    baseUnit: 'lbs',
    estimatedCostPerUnit: 1.0,
    isStaple: false
  },

  // Meat & Seafood  
  'chicken breast': {
    name: 'chicken breast',
    aliases: ['chicken breasts', 'boneless chicken breast'],
    category: GROCERY_CATEGORIES.MEAT,
    commonUnits: ['lbs', 'kg', 'pieces', 'pcs'],
    baseUnit: 'lbs',
    estimatedCostPerUnit: 6.99,
    isStaple: false
  },
  'ground beef': {
    name: 'ground beef',
    aliases: ['ground meat', 'minced beef'],
    category: GROCERY_CATEGORIES.MEAT,
    commonUnits: ['lbs', 'kg'],
    baseUnit: 'lbs',
    estimatedCostPerUnit: 5.99,
    isStaple: false
  },

  // Dairy & Eggs
  'eggs': {
    name: 'eggs',
    aliases: ['egg', 'large eggs', 'whole eggs'],
    category: GROCERY_CATEGORIES.DAIRY,
    commonUnits: ['pcs', 'pieces', 'dozen'],
    baseUnit: 'dozen',
    estimatedCostPerUnit: 3.99,
    isStaple: true
  },
  'milk': {
    name: 'milk',
    aliases: ['whole milk', '2% milk', 'skim milk'],
    category: GROCERY_CATEGORIES.DAIRY,
    commonUnits: ['cups', 'ml', 'liters', 'gallon'],
    baseUnit: 'gallon',
    density: 1.03,
    estimatedCostPerUnit: 3.49,
    isStaple: true
  },
  'butter': {
    name: 'butter',
    aliases: ['unsalted butter', 'salted butter'],
    category: GROCERY_CATEGORIES.DAIRY,
    commonUnits: ['tbsp', 'tsp', 'sticks', 'cups'],
    baseUnit: 'sticks',
    estimatedCostPerUnit: 4.99,
    isStaple: true
  },
  'cheese': {
    name: 'cheese',
    aliases: ['cheddar cheese', 'mozzarella cheese', 'parmesan cheese'],
    category: GROCERY_CATEGORIES.DAIRY,
    commonUnits: ['cups', 'oz', 'grams', 'slices'],
    baseUnit: 'oz',
    estimatedCostPerUnit: 0.5,
    isStaple: false
  },

  // Pantry & Dry Goods
  'flour': {
    name: 'all-purpose flour',
    aliases: ['flour', 'white flour', 'plain flour'],
    category: GROCERY_CATEGORIES.PANTRY,
    commonUnits: ['cups', 'lbs', 'kg', 'grams'],
    baseUnit: 'lbs',
    density: 0.52,
    estimatedCostPerUnit: 2.99,
    isStaple: true
  },
  'sugar': {
    name: 'granulated sugar',
    aliases: ['sugar', 'white sugar', 'cane sugar'],
    category: GROCERY_CATEGORIES.PANTRY,
    commonUnits: ['cups', 'lbs', 'kg', 'tsp', 'tbsp'],
    baseUnit: 'lbs',
    density: 0.85,
    estimatedCostPerUnit: 2.49,
    isStaple: true
  },
  'salt': {
    name: 'salt',
    aliases: ['table salt', 'sea salt', 'kosher salt'],
    category: GROCERY_CATEGORIES.PANTRY,
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    baseUnit: 'tsp',
    estimatedCostPerUnit: 0.01,
    isStaple: true
  },
  'pepper': {
    name: 'black pepper',
    aliases: ['pepper', 'ground pepper', 'black pepper'],
    category: GROCERY_CATEGORIES.PANTRY,
    commonUnits: ['tsp', 'tbsp', 'pinch'],
    baseUnit: 'tsp',
    estimatedCostPerUnit: 0.05,
    isStaple: true
  },
  'rice': {
    name: 'rice',
    aliases: ['white rice', 'jasmine rice', 'basmati rice'],
    category: GROCERY_CATEGORIES.PANTRY,
    commonUnits: ['cups', 'lbs', 'kg'],
    baseUnit: 'lbs',
    density: 1.52,
    estimatedCostPerUnit: 2.99,
    isStaple: true
  },
  'pasta': {
    name: 'pasta',
    aliases: ['spaghetti', 'penne', 'fusilli', 'noodles'],
    category: GROCERY_CATEGORIES.PANTRY,
    commonUnits: ['lbs', 'oz', 'cups'],
    baseUnit: 'lbs',
    estimatedCostPerUnit: 1.99,
    isStaple: true
  },

  // Condiments & Sauces
  'olive oil': {
    name: 'olive oil',
    aliases: ['extra virgin olive oil', 'evoo'],
    category: GROCERY_CATEGORIES.CONDIMENTS,
    commonUnits: ['tbsp', 'tsp', 'cups', 'ml'],
    baseUnit: 'ml',
    density: 0.92,
    estimatedCostPerUnit: 0.02,
    isStaple: true
  },
  'soy sauce': {
    name: 'soy sauce',
    aliases: ['low sodium soy sauce'],
    category: GROCERY_CATEGORIES.CONDIMENTS,
    commonUnits: ['tbsp', 'tsp'],
    baseUnit: 'tbsp',
    estimatedCostPerUnit: 0.1,
    isStaple: true
  }
};

// Function to find ingredient info by name or alias
export function findIngredient(searchName: string): IngredientInfo | null {
  const normalized = searchName.toLowerCase().trim();
  
  // Try exact match first
  if (INGREDIENTS_DB[normalized]) {
    return INGREDIENTS_DB[normalized];
  }
  
  // Try alias match
  for (const ingredient of Object.values(INGREDIENTS_DB)) {
    if (ingredient.aliases.some(alias => alias.toLowerCase() === normalized)) {
      return ingredient;
    }
  }
  
  return null;
}

// Function to normalize ingredient names
export function normalizeIngredientName(name: string): string {
  const ingredient = findIngredient(name);
  return ingredient ? ingredient.name : name.toLowerCase().trim();
}

// Function to get ingredient category
export function getIngredientCategory(name: string): string {
  const ingredient = findIngredient(name);
  return ingredient ? ingredient.category : GROCERY_CATEGORIES.PANTRY;
}

// Function to check if ingredient is a staple item
export function isStapleIngredient(name: string): boolean {
  const ingredient = findIngredient(name);
  return ingredient ? ingredient.isStaple : false;
}

// Function to estimate ingredient cost
export function estimateIngredientCost(name: string, quantity: number, unit: string): number {
  const ingredient = findIngredient(name);
  if (!ingredient || !ingredient.estimatedCostPerUnit) {
    return 0;
  }
  
  // For simplicity, assume the unit matches base unit
  // In a real app, you'd need unit conversion logic
  return quantity * ingredient.estimatedCostPerUnit;
}