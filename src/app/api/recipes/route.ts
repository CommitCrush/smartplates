/**
 * Recipes API Route - CRUD Operations
 * 
 * Handles recipe listing, filtering, and creation operations
 * Integrated with Spoonacular API for external recipe data
 */

import { NextRequest, NextResponse } from 'next/server';
import { Recipe, CreateRecipeInput } from '@/types/recipe';
import { createRecipe } from '@/models/Recipe';
import { getCachedOrFreshRecipes, searchCachedRecipes } from '@/services/recipeCacheService';

// Mock recipe data for Phase 1
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
    category: 'dinner',
    difficulty: 'medium',
    prepTime: 15,
    cookTime: 15,
    totalTime: 30,
    servings: 4,
    rating: 4.8,
    ratingsCount: 125,
    likesCount: 89,
    authorName: 'Chef Mario',
    authorId: 'user_1',
    ingredients: [
      { id: '1', name: 'Spaghetti', amount: 400, unit: 'g' },
      { id: '2', name: 'Pancetta', amount: 150, unit: 'g' },
      { id: '3', name: 'Eggs', amount: 3, unit: 'pcs' },
      { id: '4', name: 'Parmesan cheese', amount: 100, unit: 'g' }
    ],
    instructions: [
      { id: '1', stepNumber: 1, instruction: 'Cook spaghetti according to package instructions' },
      { id: '2', stepNumber: 2, instruction: 'Fry pancetta until crispy' },
      { id: '3', stepNumber: 3, instruction: 'Mix eggs and parmesan in a bowl' },
      { id: '4', stepNumber: 4, instruction: 'Combine all ingredients while pasta is hot' }
    ],
    dietaryRestrictions: [],
    cuisine: 'Italian',
    tags: ['pasta', 'traditional', 'quick'],
    nutrition: {
      calories: 520,
      protein: 25,
      carbohydrates: 60,
      fat: 18,
      fiber: 3
    },
    isPublished: true,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Vegetarian Buddha Bowl',
    description: 'Healthy bowl with quinoa, roasted vegetables, and tahini dressing',
    category: 'lunch',
    difficulty: 'easy',
    prepTime: 20,
    cookTime: 25,
    totalTime: 45,
    servings: 2,
    rating: 4.6,
    ratingsCount: 73,
    likesCount: 56,
    authorName: 'Green Chef',
    authorId: 'user_2',
    ingredients: [
      { id: '1', name: 'Quinoa', amount: 1, unit: 'cup' },
      { id: '2', name: 'Sweet potato', amount: 1, unit: 'large' },
      { id: '3', name: 'Broccoli', amount: 200, unit: 'g' },
      { id: '4', name: 'Chickpeas', amount: 1, unit: 'can' },
      { id: '5', name: 'Tahini', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      { id: '1', stepNumber: 1, instruction: 'Cook quinoa according to package instructions' },
      { id: '2', stepNumber: 2, instruction: 'Roast sweet potato and broccoli at 400°F for 25 minutes' },
      { id: '3', stepNumber: 3, instruction: 'Heat chickpeas in a pan with spices' },
      { id: '4', stepNumber: 4, instruction: 'Assemble bowl and drizzle with tahini dressing' }
    ],
    dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free'],
    cuisine: 'Mediterranean',
    tags: ['healthy', 'bowl', 'plant-based'],
    nutrition: {
      calories: 420,
      protein: 18,
      carbohydrates: 65,
      fat: 12,
      fiber: 12
    },
    isPublished: true,
    createdAt: '2025-09-02T14:30:00Z',
    updatedAt: '2025-09-02T14:30:00Z'
  },
  {
    id: '3',
    title: 'Chocolate Chip Cookies',
    description: 'Soft and chewy chocolate chip cookies that are perfect for any occasion',
    category: 'dessert',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 12,
    totalTime: 27,
    servings: 24,
    rating: 4.9,
    ratingsCount: 203,
    likesCount: 156,
    authorName: 'Sweet Baker',
    authorId: 'user_3',
    ingredients: [
      { id: '1', name: 'All-purpose flour', amount: 2.25, unit: 'cups' },
      { id: '2', name: 'Butter', amount: 1, unit: 'cup' },
      { id: '3', name: 'Brown sugar', amount: 0.75, unit: 'cup' },
      { id: '4', name: 'White sugar', amount: 0.75, unit: 'cup' },
      { id: '5', name: 'Eggs', amount: 2, unit: 'large' },
      { id: '6', name: 'Chocolate chips', amount: 2, unit: 'cups' }
    ],
    instructions: [
      { id: '1', stepNumber: 1, instruction: 'Preheat oven to 375°F (190°C)' },
      { id: '2', stepNumber: 2, instruction: 'Cream butter and sugars until light and fluffy' },
      { id: '3', stepNumber: 3, instruction: 'Beat in eggs one at a time, then vanilla' },
      { id: '4', stepNumber: 4, instruction: 'Gradually blend in flour' },
      { id: '5', stepNumber: 5, instruction: 'Stir in chocolate chips' },
      { id: '6', stepNumber: 6, instruction: 'Drop onto ungreased cookie sheets and bake 9-11 minutes' }
    ],
    dietaryRestrictions: ['vegetarian'],
    cuisine: 'American',
    tags: ['cookies', 'dessert', 'baking', 'chocolate'],
    nutrition: {
      calories: 140,
      protein: 2,
      carbohydrates: 20,
      fat: 6,
      fiber: 1
    },
    isPublished: true,
    createdAt: '2025-09-03T09:15:00Z',
    updatedAt: '2025-09-03T09:15:00Z'
  },
  {
    id: '4',
    title: 'Summer Salad',
    description: 'Fresh and light summer salad with seasonal vegetables',
    category: 'lunch',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 0,
    totalTime: 15,
    servings: 2,
    rating: 4.4,
    ratingsCount: 67,
    likesCount: 45,
    authorName: 'Garden Fresh',
    authorId: 'user_4',
    ingredients: [
      { id: '1', name: 'Mixed greens', amount: 4, unit: 'cups' },
      { id: '2', name: 'Cherry tomatoes', amount: 200, unit: 'g' },
      { id: '3', name: 'Cucumber', amount: 1, unit: 'large' },
      { id: '4', name: 'Red onion', amount: 0.5, unit: 'small' },
      { id: '5', name: 'Olive oil', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      { id: '1', stepNumber: 1, instruction: 'Wash and dry all vegetables' },
      { id: '2', stepNumber: 2, instruction: 'Cut tomatoes in half and slice cucumber' },
      { id: '3', stepNumber: 3, instruction: 'Thinly slice red onion' },
      { id: '4', stepNumber: 4, instruction: 'Combine all ingredients and dress with olive oil' }
    ],
    dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free'],
    cuisine: 'Mediterranean',
    tags: ['salad', 'fresh', 'healthy', 'no-cook'],
    nutrition: {
      calories: 95,
      protein: 3,
      carbohydrates: 8,
      fat: 7,
      fiber: 3
    },
    isPublished: true,
    createdAt: '2025-09-03T12:20:00Z',
    updatedAt: '2025-09-03T12:20:00Z'
  },
  {
    id: '5',
    title: 'Pancakes',
    description: 'Fluffy buttermilk pancakes perfect for weekend breakfast',
    category: 'breakfast',
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    servings: 4,
    rating: 4.8,
    ratingsCount: 142,
    likesCount: 87,
    authorName: 'Breakfast Chef',
    authorId: 'user_5',
    ingredients: [
      { id: '1', name: 'All-purpose flour', amount: 2, unit: 'cups' },
      { id: '2', name: 'Buttermilk', amount: 1.75, unit: 'cups' },
      { id: '3', name: 'Eggs', amount: 2, unit: 'large' },
      { id: '4', name: 'Sugar', amount: 2, unit: 'tbsp' },
      { id: '5', name: 'Baking powder', amount: 2, unit: 'tsp' }
    ],
    instructions: [
      { id: '1', stepNumber: 1, instruction: 'Mix dry ingredients in a large bowl' },
      { id: '2', stepNumber: 2, instruction: 'Whisk wet ingredients in separate bowl' },
      { id: '3', stepNumber: 3, instruction: 'Combine wet and dry ingredients until just mixed' },
      { id: '4', stepNumber: 4, instruction: 'Cook on griddle until bubbles form, then flip' }
    ],
    dietaryRestrictions: ['vegetarian'],
    cuisine: 'American',
    tags: ['pancakes', 'breakfast', 'fluffy'],
    nutrition: {
      calories: 220,
      protein: 8,
      carbohydrates: 42,
      fat: 3,
      fiber: 2
    },
    isPublished: true,
    createdAt: '2025-09-03T08:15:00Z',
    updatedAt: '2025-09-03T08:15:00Z'
  },
  {
    id: '6',
    title: 'Chocolate Muffins',
    description: 'Rich and moist chocolate muffins with chocolate chips',
    category: 'dessert',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    servings: 12,
    rating: 4.6,
    ratingsCount: 94,
    likesCount: 73,
    authorName: 'Bakery Master',
    authorId: 'user_6',
    ingredients: [
      { id: '1', name: 'All-purpose flour', amount: 2, unit: 'cups' },
      { id: '2', name: 'Cocoa powder', amount: 0.5, unit: 'cup' },
      { id: '3', name: 'Sugar', amount: 1, unit: 'cup' },
      { id: '4', name: 'Eggs', amount: 2, unit: 'large' },
      { id: '5', name: 'Chocolate chips', amount: 1, unit: 'cup' }
    ],
    instructions: [
      { id: '1', stepNumber: 1, instruction: 'Preheat oven to 375°F and line muffin tin' },
      { id: '2', stepNumber: 2, instruction: 'Mix dry ingredients in large bowl' },
      { id: '3', stepNumber: 3, instruction: 'Whisk wet ingredients separately' },
      { id: '4', stepNumber: 4, instruction: 'Combine ingredients and fold in chocolate chips' },
      { id: '5', stepNumber: 5, instruction: 'Bake for 18-20 minutes until toothpick comes out clean' }
    ],
    dietaryRestrictions: ['vegetarian'],
    cuisine: 'American',
    tags: ['cookies', 'dessert', 'baking'],
    nutrition: {
      calories: 185,
      protein: 2,
      carbohydrates: 28,
      fat: 8,
      fiber: 1
    },
    isPublished: true,
    createdAt: '2025-09-03T16:45:00Z',
    updatedAt: '2025-09-03T16:45:00Z'
  }
];

/**
 * GET /api/recipes - Get recipes with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filter-Parameter extrahieren
    // dietaryRestrictions und tags als Array verarbeiten
    const filters = {
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      cuisine: searchParams.get('cuisine') || undefined,
      search: searchParams.get('search') || undefined,
      dietaryRestrictions: searchParams.getAll('dietaryRestrictions').filter(Boolean),
      tags: searchParams.getAll('tags').filter(Boolean),
      maxTime: searchParams.get('maxTime') ? parseInt(searchParams.get('maxTime')!) : undefined,
    };
    console.log('API Query Params:', filters);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    let recipes: Recipe[] = [];
    let total = 0;
    let source = 'mongodb';

    // 1. Suche in MongoDB
    try {
      const { getCollection, COLLECTIONS } = await import('@/lib/db');
      const recipeCollection = await getCollection<Recipe>(COLLECTIONS.RECIPES);
      const mongoQuery: any = {};
      if (filters.search) {
        mongoQuery.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { tags: { $elemMatch: { $regex: filters.search, $options: 'i' } } }
        ];
      }
      if (filters.category) mongoQuery.category = filters.category;
      if (filters.difficulty) mongoQuery.difficulty = filters.difficulty;
      if (filters.cuisine) mongoQuery.cuisine = filters.cuisine;
      if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) mongoQuery.dietaryRestrictions = { $all: filters.dietaryRestrictions };
      if (filters.tags && filters.tags.length > 0) mongoQuery.tags = { $all: filters.tags };
      if (filters.maxTime) mongoQuery.totalTime = { $lte: filters.maxTime };
      console.log('MongoDB Query:', mongoQuery);

      const mongoRecipes = await recipeCollection.find(mongoQuery).skip((page - 1) * limit).limit(limit).toArray();
      recipes = mongoRecipes;
      total = await recipeCollection.countDocuments(mongoQuery);
      source = 'mongodb';
    } catch (dbError) {
      console.warn('⚠️ MongoDB query failed, fallback to cache:', dbError);
    }

    // 2. Fallback: Spoonacular API, falls keine Rezepte gefunden
    if (!recipes || recipes.length === 0) {
      try {
        const { searchSpoonacularRecipes } = await import('@/services/spoonacularService');
        const spoonacularOptions: any = {
          number: limit,
          offset: (page - 1) * limit,
        };
        if (filters.category) spoonacularOptions.type = filters.category;
        if (filters.difficulty) spoonacularOptions.difficulty = filters.difficulty;
        if (filters.cuisine) spoonacularOptions.cuisine = filters.cuisine;
        if (filters.dietaryRestrictions.length > 0) spoonacularOptions.diet = filters.dietaryRestrictions.join(',');
        if (filters.tags.length > 0) spoonacularOptions.tags = filters.tags.join(',');
        if (filters.maxTime) spoonacularOptions.maxReadyTime = filters.maxTime;

        const result = await searchSpoonacularRecipes(filters.search || '', spoonacularOptions);
        recipes = result.recipes || [];
        total = result.totalResults || recipes.length;
        source = 'spoonacular';
      } catch (spError) {
        console.warn('⚠️ Spoonacular API fallback failed:', spError);
      }
    }

    // 3. Fallback: Mock Data falls alles fehlschlägt
    if (!recipes || recipes.length === 0) {
      let filteredRecipes = mockRecipes;
      if (filters.category) filteredRecipes = filteredRecipes.filter(recipe => recipe.category === filters.category);
      if (filters.difficulty) filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === filters.difficulty);
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          (recipe.tags || []).some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      recipes = filteredRecipes.slice((page - 1) * limit, page * limit);
      total = filteredRecipes.length;
      source = 'mock';
    }

    // Response
    return NextResponse.json({
      recipes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: (page * limit) < total,
      hasPrev: page > 1,
      source,
      message: total > 0 ? `Found ${recipes.length} recipes (${source})` : 'No recipes found'
    });

  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recipes - Create new recipe
 */
export async function POST(request: NextRequest) {
  try {
    const recipeData: CreateRecipeInput = await request.json();

    // Basic validation
    if (!recipeData.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!recipeData.description?.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!recipeData.category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!recipeData.difficulty) {
      return NextResponse.json(
        { error: 'Difficulty is required' },
        { status: 400 }
      );
    }

    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    if (!recipeData.instructions || recipeData.instructions.length === 0) {
      return NextResponse.json(
        { error: 'At least one instruction is required' },
        { status: 400 }
      );
    }

    // Create recipe in database
    const newRecipe = await createRecipe(recipeData);

    return NextResponse.json(newRecipe, { status: 201 });

  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
