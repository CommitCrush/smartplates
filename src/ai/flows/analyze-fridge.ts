// --- Refactored OpenAI Vision-only implementation ---
import { OpenAI } from 'openai';
import { z } from 'zod';

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
  ingredients: z.array(
    z.object({
      name: z.string(),
      confidence: z.number().min(0).max(1),
      category: z.string(),
      quantity: z.string().optional(),
      freshness: z.enum(['fresh', 'good', 'fair', 'poor']).optional(),
    })
  ),
  suggestions: z.array(
    z.object({
      recipeName: z.string(),
      description: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      cookingTime: z.string(),
      missingIngredients: z.array(z.string()).optional(),
    })
  ),
  tips: z.array(z.string()).optional(),
  rawDetections: z.array(
    z.object({
      description: z.string(),
      score: z.number(),
    })
  ).optional(),
});

export type AnalyzeFridgeInput = z.infer<typeof AnalyzeFridgeInputSchema>;
export type AnalyzeFridgeOutput = z.infer<typeof AnalyzeFridgeOutputSchema>;

// Dummy helpers (ersetze sie mit deinen echten Funktionen)
function categorizeFood(name: string) { return 'general'; }
function estimateFreshness(name: string) { return 'good'; }
function generateRecipeSuggestions(ingredients: any[], prefs?: any) {
  return [
    {
      recipeName: 'Kitchen Creativity Challenge',
      description: 'Use your ingredients to create a meal!',
      difficulty: 'medium',
      cookingTime: '30 minutes',
    },
  ];
}

export async function analyzeFridge(input: AnalyzeFridgeInput): Promise<AnalyzeFridgeOutput> {
  try {
    const validatedInput = AnalyzeFridgeInputSchema.parse(input);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const UPLOAD_LIMIT = 10;
    let uploadCount = 0;

    // Helper to extract ingredients from image using OpenAI Vision
    async function extractIngredientsFromImage(imageData: string): Promise<{ingredients: string[], raw: string}> {
      if (uploadCount >= UPLOAD_LIMIT) {
        throw new Error(`Upload limit reached. You can only analyze ${UPLOAD_LIMIT} images per session.`);
      }
      uploadCount++;

      // Improved prompt with example output
  const prompt = `Liste alle sichtbaren Zutaten im Bild als ein JSON-Array von Strings auf. Antworte ausschließlich mit dem JSON-Array. Wenn keine Zutaten erkennbar sind, antworte mit einem leeren Array: [].`;
      const models = ['gpt-4o', 'gpt-4-vision-preview', 'gpt-5-mini'];
      let response = null;
      let lastError = null;
      for (const model of models) {
        try {
          response = await openai.chat.completions.create({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: imageData } }
                ]
              }
            ],
            max_tokens: 2000,
          });
          // Debug: log the full OpenAI API response before parsing
          console.log('OpenAI Vision API FULL RESPONSE:', JSON.stringify(response, null, 2));
          // Wenn erfolgreich, abbrechen
          break;
        } catch (err) {
          lastError = err;
          // Versuche nächstes Modell
        }
      }
      if (!response) {
        throw lastError || new Error('No available OpenAI Vision model responded.');
      }

      // Debug: log the content to be parsed
      const rawContent = response.choices[0]?.message?.content || '';
      console.log('OpenAI Vision rawContent to parse:', rawContent);
      let ingredients: string[] = [];

      // Try JSON parse, fallback to robust text extraction
      try {
        const parsed = JSON.parse(rawContent);
        if (Array.isArray(parsed)) {
          ingredients = parsed.filter(i => typeof i === 'string' && i.length > 1);
        }
      } catch {
        // Try to extract array from text block
        const match = rawContent.match(/\[(.*?)\]/s);
        if (match) {
          ingredients = match[1]
            .split(/,|\n|\r|\*/)
            .map((l: string) => l.replace(/"/g, '').trim())
            .filter((l: string) => l && /^[a-zA-ZäöüÄÖÜß ,.\-]+$/.test(l));
        } else {
          ingredients = rawContent
            .split(/\r?\n|,|\*/)
            .map((l: string) => l.trim())
            .filter((l: string) => l && /^[a-zA-ZäöüÄÖÜß ,.\-]+$/.test(l));
        }
      }

      return { ingredients, raw: rawContent };
    }

    // Try OpenAI Vision first
    let ingredients: any[] = [];
    let rawDetections: any[] = [];
    try {
      const { ingredients: extracted, raw } = await extractIngredientsFromImage(validatedInput.imageData);
      rawDetections.push({ description: raw, score: 1 });
      ingredients = extracted.map((name: string) => ({
        name,
        confidence: 1,
        category: categorizeFood(name),
        quantity: 'detected',
        freshness: estimateFreshness(name),
      }));
    } catch (err: any) {
      return {
        ingredients: [],
        suggestions: [],
        tips: [
          err?.message || 'Image analysis failed.',
          'Try uploading a clearer photo or list your ingredients manually.'
        ],
        rawDetections,
      };
    }

    const suggestions = generateRecipeSuggestions(ingredients, validatedInput.userPreferences);

    return {
      ingredients,
      suggestions: suggestions.map(s => ({
        ...s,
        // Ensure correct type for difficulty
        difficulty: s.difficulty as 'easy' | 'medium' | 'hard',
      })),
      tips: ingredients.length === 0 ? [
        'No ingredients could be detected. Try uploading a clearer photo or enter ingredients manually.'
      ] : [],
      rawDetections,
    };

  } catch (error) {
    console.error('Error analyzing fridge:', error);
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
