import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { ingredients, dietaryPreferences = [], cookingTime = 30, count = 4 } = await request.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'No ingredients provided' },
        { status: 400 }
      );
    }

    // Create dietary preferences string
    const dietaryText = dietaryPreferences.length > 0 
      ? ` The recipes should be ${dietaryPreferences.join(' and ')}.`
      : '';

    const prompt = `Generate ${count} creative and delicious recipe suggestions using these ingredients: ${ingredients.join(', ')}.
    
Requirements:
- Each recipe should use at least 3 of the provided ingredients
- Cooking time should be approximately ${cookingTime} minutes or less
- Include ingredients that are commonly available${dietaryText}
- Provide variety in cooking methods and cuisines
- Make the recipes practical for home cooking

For each recipe, provide:
- A catchy and descriptive title
- Brief description (1-2 sentences)
- Estimated cooking time
- Difficulty level (easy/medium/hard)
- List of ingredients with approximate quantities
- Step-by-step cooking instructions (max 6 steps)
- Number of servings

Return the response as a JSON array of recipe objects with this structure:
{
  "title": "Recipe Name",
  "description": "Brief description",
  "cookingTime": 25,
  "difficulty": "easy",
  "servings": 4,
  "ingredients": ["1 cup ingredient 1", "2 tbsp ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "image": "/placeholder-recipe.jpg"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional chef and recipe creator. Generate practical, delicious recipes that home cooks can easily follow. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const recipeText = response.choices[0]?.message?.content;
    
    if (!recipeText) {
      throw new Error('No recipe content generated');
    }

    // Parse the JSON response
    let recipes;
    try {
      recipes = JSON.parse(recipeText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback recipes if AI response can't be parsed
      recipes = generateFallbackRecipes(ingredients);
    }

    // Ensure it's an array
    if (!Array.isArray(recipes)) {
      recipes = [recipes];
    }

    // Add generated IDs and ensure consistent structure
    const processedRecipes = recipes.map((recipe: any, index: number) => ({
      id: `ai-generated-${Date.now()}-${index}`,
      title: recipe.title || 'Generated Recipe',
      description: recipe.description || 'A delicious recipe created just for you!',
      cookingTime: recipe.cookingTime || cookingTime,
      difficulty: recipe.difficulty || 'medium',
      servings: recipe.servings || 4,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : ingredients.slice(0, 5),
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : ['Follow standard cooking methods'],
      image: recipe.image || '/placeholder-recipe.jpg',
      rating: 4.0 + Math.random(), // Random rating 4.0-5.0
      isAIGenerated: true
    }));

    return NextResponse.json(processedRecipes);

  } catch (error) {
    console.error('Recipe generation error:', error);
    
    // Return fallback recipes on error
    const fallbackRecipes = generateFallbackRecipes(['basic ingredients']);
    
    return NextResponse.json(fallbackRecipes);
  }
}

function generateFallbackRecipes(ingredients: string[]) {
  const fallbackRecipes = [
    {
      id: `fallback-${Date.now()}-1`,
      title: `${ingredients[0] || 'Ingredient'} Stir Fry`,
      description: 'A quick and easy stir fry with available ingredients',
      cookingTime: 15,
      difficulty: 'easy',
      servings: 4,
      ingredients: [`1 cup ${ingredients[0] || 'vegetables'}`, '2 tbsp oil', 'Salt and pepper to taste'],
      instructions: [
        'Heat oil in a large pan',
        'Add ingredients and stir fry for 10-15 minutes',
        'Season with salt, pepper, and your favorite spices',
        'Serve hot with rice or noodles'
      ],
      image: '/placeholder-recipe.jpg',
      rating: 4.2,
      isAIGenerated: true
    },
    {
      id: `fallback-${Date.now()}-2`,
      title: `${ingredients[1] || 'Simple'} Soup`,
      description: 'A warming and nutritious soup made with available ingredients',
      cookingTime: 25,
      difficulty: 'easy',
      servings: 4,
      ingredients: [`2 cups ${ingredients[1] || 'vegetables'}`, '4 cups broth', '1 onion, diced'],
      instructions: [
        'Sauté onion until translucent',
        'Add ingredients and broth',
        'Simmer for 20 minutes',
        'Season to taste and serve hot'
      ],
      image: '/placeholder-recipe.jpg',
      rating: 4.5,
      isAIGenerated: true
    }
  ];

  return fallbackRecipes;
}