'use server';

import { z } from 'zod';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { config } from '@/config/env';

// Initialize Google Cloud Vision client only if credentials are available
let visionClient: ImageAnnotatorClient | null = null;

try {
  if (config.googleCloud.credentialsPath && config.googleCloud.projectId) {
    visionClient = new ImageAnnotatorClient({
      keyFilename: config.googleCloud.credentialsPath,
      projectId: config.googleCloud.projectId,
    });
  }
} catch (error) {
  console.warn('Google Cloud Vision not configured:', error);
}

// Input schema for the analyze fridge flow
export const AnalyzeFridgeInputSchema = z.object({
  imageData: z.string().min(1, 'Image data is required'),
  userPreferences: z.object({
    dietary: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    cuisineStyle: z.string().optional(),
  }).optional(),
});

// Output schema for the analyze fridge flow
export const AnalyzeFridgeOutputSchema = z.object({
  ingredients: z.array(z.object({
    name: z.string(),
    confidence: z.number().min(0).max(1),
    category: z.string(),
    quantity: z.string().optional(),
    freshness: z.enum(['fresh', 'good', 'fair', 'poor']).optional(),
  })),
  suggestions: z.array(z.object({
    recipeName: z.string(),
    description: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    cookingTime: z.string(),
    missingIngredients: z.array(z.string()).optional(),
  })),
  tips: z.array(z.string()).optional(),
  rawDetections: z.array(z.object({
    description: z.string(),
    score: z.number(),
  })).optional(),
});

export type AnalyzeFridgeInput = z.infer<typeof AnalyzeFridgeInputSchema>;
export type AnalyzeFridgeOutput = z.infer<typeof AnalyzeFridgeOutputSchema>;

/**
 * Food categories mapping for ingredient classification
 */
const FOOD_CATEGORIES = {
  vegetables: ['tomato', 'lettuce', 'carrot', 'onion', 'pepper', 'cucumber', 'broccoli', 'spinach', 'potato', 'garlic'],
  fruits: ['apple', 'banana', 'orange', 'lemon', 'lime', 'berry', 'grape', 'avocado'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
  meat: ['chicken', 'beef', 'pork', 'fish', 'turkey', 'salmon'],
  grains: ['bread', 'rice', 'pasta', 'flour', 'oats'],
  condiments: ['sauce', 'oil', 'vinegar', 'ketchup', 'mustard'],
  eggs: ['egg'],
  herbs: ['basil', 'parsley', 'cilantro', 'thyme', 'oregano'],
};

/**
 * Categorizes detected food items
 */
function categorizeFood(foodName: string): string {
  const lowerFood = foodName.toLowerCase();
  
  for (const [category, items] of Object.entries(FOOD_CATEGORIES)) {
    if (items.some(item => lowerFood.includes(item))) {
      return category;
    }
  }
  
  return 'other';
}

/**
 * Estimates freshness based on food type and visual cues
 */
function estimateFreshness(foodName: string): 'fresh' | 'good' | 'fair' | 'poor' {
  // This is a simplified estimation - in production, you'd analyze visual cues
  const category = categorizeFood(foodName);
  
  // Default freshness assumptions
  if (['vegetables', 'fruits'].includes(category)) {
    return 'fresh';
  } else if (['dairy', 'meat'].includes(category)) {
    return 'good';
  }
  
  return 'fresh';
}

/**
 * Generates recipe suggestions based on detected ingredients
 */
function generateRecipeSuggestions(
  ingredients: Array<{ name: string; category: string }>,
  userPreferences?: AnalyzeFridgeInput['userPreferences']
): AnalyzeFridgeOutput['suggestions'] {
  const hasVegetables = ingredients.some(ing => ing.category === 'vegetables');
  const hasDairy = ingredients.some(ing => ing.category === 'dairy');
  const hasMeat = ingredients.some(ing => ing.category === 'meat');
  const hasGrains = ingredients.some(ing => ing.category === 'grains');
  
  const suggestions: AnalyzeFridgeOutput['suggestions'] = [];
  
  if (hasVegetables && hasDairy) {
    suggestions.push({
      recipeName: 'Fresh Garden Salad',
      description: 'Crisp vegetables with cheese and light dressing',
      difficulty: 'easy',
      cookingTime: '10 minutes',
    });
  }
  
  if (hasMeat && hasVegetables) {
    suggestions.push({
      recipeName: 'Stir-Fry',
      description: 'Quick stir-fry with available vegetables and protein',
      difficulty: 'medium',
      cookingTime: '15 minutes',
    });
  }
  
  if (hasGrains && hasVegetables) {
    suggestions.push({
      recipeName: 'Vegetable Rice Bowl',
      description: 'Nutritious bowl with grains and fresh vegetables',
      difficulty: 'easy',
      cookingTime: '20 minutes',
    });
  }
  
  // If no specific combinations, add a general suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      recipeName: 'Creative Kitchen Special',
      description: 'Make something delicious with your available ingredients',
      difficulty: 'medium',
      cookingTime: '20-30 minutes',
    });
  }
  
  // Consider user preferences for additional suggestions
  if (userPreferences?.cuisineStyle === 'italian' && hasVegetables) {
    suggestions.push({
      recipeName: 'Italian Vegetable Medley',
      description: 'Mediterranean-style vegetables with Italian herbs',
      difficulty: 'medium',
      cookingTime: '25 minutes',
    });
  }
  
  return suggestions;
}

/**
 * Analyzes fridge contents from an image and provides recipe suggestions
 * 
 * @param input - The image data and user preferences
 * @returns Analysis results with ingredients and recipe suggestions
 */
export async function analyzeFridge(input: AnalyzeFridgeInput): Promise<AnalyzeFridgeOutput> {
  try {
    // Validate input
    const validatedInput = AnalyzeFridgeInputSchema.parse(input);
    
    // Check if Google Cloud Vision is available
    if (!visionClient) {
      throw new Error('Google Cloud Vision not configured');
    }
    
    // Convert base64 image data to buffer
    const imageBuffer = Buffer.from(validatedInput.imageData.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
    
    // Perform object detection using Google Cloud Vision
    if (!visionClient.objectLocalization) {
      throw new Error('Google Cloud Vision objectLocalization method not available');
    }
    
    const [objectResult] = await visionClient.objectLocalization({
      image: { content: imageBuffer },
    });
    
    const objects = objectResult.localizedObjectAnnotations || [];
    
    // Filter for food-related objects and process them
    const detectedIngredients = objects
      .filter(obj => {
        const name = obj.name?.toLowerCase() || '';
        return Object.values(FOOD_CATEGORIES).flat().some(food => 
          name.includes(food) || food.includes(name)
        );
      })
      .map(obj => ({
        name: obj.name || 'Unknown food item',
        confidence: obj.score || 0,
        category: categorizeFood(obj.name || ''),
        quantity: 'detected',
        freshness: estimateFreshness(obj.name || ''),
      }))
      .filter(ing => ing.confidence > 0.5) // Only include confident detections
      .slice(0, 10); // Limit to top 10 detections
    
    // If no food detected, try label detection as fallback
    if (detectedIngredients.length === 0) {
      if (!visionClient.labelDetection) {
        throw new Error('Google Cloud Vision labelDetection method not available');
      }
      
      const [labelResult] = await visionClient.labelDetection({
        image: { content: imageBuffer },
      });
      
      const labels = labelResult.labelAnnotations || [];
      const foodLabels = labels
        .filter(label => {
          const name = label.description?.toLowerCase() || '';
          return Object.values(FOOD_CATEGORIES).flat().some(food => 
            name.includes(food) || food.includes(name)
          );
        })
        .map(label => ({
          name: label.description || 'Unknown food item',
          confidence: label.score || 0,
          category: categorizeFood(label.description || ''),
          quantity: 'visible',
          freshness: estimateFreshness(label.description || ''),
        }))
        .filter(ing => ing.confidence > 0.7)
        .slice(0, 8);
      
      detectedIngredients.push(...foodLabels);
    }
    
    // Generate recipe suggestions based on detected ingredients
    const suggestions = generateRecipeSuggestions(detectedIngredients, validatedInput.userPreferences);
    
    // Generate helpful tips
    const tips = [
      'Store fresh vegetables in the crisper drawer for longer freshness',
      'Check expiration dates regularly to avoid food waste',
      'Use older ingredients first in your cooking',
    ];
    
    // Add dietary-specific tips if preferences provided
    if (validatedInput.userPreferences?.dietary?.includes('vegetarian')) {
      tips.push('Great selection of vegetarian ingredients for healthy meals!');
    }
    
    const response: AnalyzeFridgeOutput = {
      ingredients: detectedIngredients,
      suggestions,
      tips,
      rawDetections: objects.map(obj => ({
        description: obj.name || 'Unknown',
        score: obj.score || 0,
      })),
    };
    
    // Validate output before returning
    return AnalyzeFridgeOutputSchema.parse(response);
    
  } catch (error) {
    console.error('Error analyzing fridge:', error);
    
    // Return a fallback response in case of errors
    return {
      ingredients: [],
      suggestions: [
        {
          recipeName: 'Kitchen Creativity Challenge',
          description: 'Use your culinary skills to create something amazing with available ingredients',
          difficulty: 'medium',
          cookingTime: '30 minutes',
        },
      ],
      tips: [
        'Unable to analyze image automatically. Try uploading a clearer photo.',
        'List your ingredients manually for personalized recipe suggestions.',
      ],
    };
  }
}
