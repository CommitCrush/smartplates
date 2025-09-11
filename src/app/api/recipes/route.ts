/**
 * Recipes API Route - Mock Data Implementation
 * 
 * Provides mock recipe data for the recipe listing page.
 * In a real implementation, this would query the MongoDB recipes collection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/types/recipe';

// Mock recipe data
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
    cookTime: 10,
    totalTime: 25,
    servings: 24,
    rating: 4.9,
    ratingsCount: 201,
    likesCount: 156,
    authorName: 'Baker Beth',
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
      { id: '2', stepNumber: 2, instruction: 'Cream butter and sugars together' },
      { id: '3', stepNumber: 3, instruction: 'Add eggs and vanilla, mix well' },
      { id: '4', stepNumber: 4, instruction: 'Gradually add flour and chocolate chips' },
      { id: '5', stepNumber: 5, instruction: 'Drop spoonfuls on baking sheet and bake for 9-11 minutes' }
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let filteredRecipes = [...mockRecipes];

    // Filter by search query
    if (query) {
      const searchLower = query.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (category) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.category === category);
    }

    // Filter by difficulty
    if (difficulty) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === difficulty);
    }

    return NextResponse.json({
      success: true,
      data: filteredRecipes,
      total: filteredRecipes.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recipes' 
      },
      { status: 500 }
    );
  }
}
