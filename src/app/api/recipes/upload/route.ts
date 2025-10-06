/**
 * Recipe Upload API Route
 * 
 * Handles recipe uploads with image processing and database storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { Recipe } from '@/types/recipe';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface RecipeUploadData {
  userId: string;
  title: string;
  description: string;
  category: string;
  cuisine?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    id: string;
    stepNumber: number;
    instruction: string;
    time?: number;
    temperature?: number;
  }>;
  dietaryTags: string[];
  customTags: string[];
  isPublic: boolean;
  isOriginal: boolean;
  source?: string;
}

interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const recipeDataString = formData.get('recipeData') as string;
    
    if (!recipeDataString) {
      return NextResponse.json(
        { success: false, message: 'Rezeptdaten fehlen' },
        { status: 400 }
      );
    }

    const recipeData: RecipeUploadData = JSON.parse(recipeDataString);

    // Validate required fields
    if (!recipeData.title?.trim() || !recipeData.description?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Titel und Beschreibung sind erforderlich' },
        { status: 400 }
      );
    }

    if (!recipeData.ingredients?.length || recipeData.ingredients.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Mindestens 2 Zutaten sind erforderlich' },
        { status: 400 }
      );
    }

    if (!recipeData.instructions?.length || recipeData.instructions.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Mindestens 3 Anweisungen sind erforderlich' },
        { status: 400 }
      );
    }

    // Extract and upload images
    const uploadedImages: UploadedImage[] = [];
    const imageFiles: File[] = [];

    // Collect image files from FormData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Upload images to Cloudinary
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      
      try {
        // Convert File to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload to Cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'smartplates/recipes',
              transformation: [
                { width: 800, height: 600, crop: 'limit', quality: 'auto' },
                { fetch_format: 'auto' }
              ],
              public_id: `${recipeData.userId}_${Date.now()}_${i}`,
            },
            (error: any, result: any) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        uploadedImages.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
        });
      } catch (imageError) {
        console.error(`Error uploading image ${i}:`, imageError);
        // Continue with other images, don't fail the entire upload
      }
    }

    // Map to canonical Recipe fields (spoonacular_recipes collection)
    const col = await getCollection<Recipe>('spoonacular_recipes');
    const extendedIngredients = recipeData.ingredients.map((ing, idx) => ({
      id: idx + 1,
      name: ing.name.trim(),
      amount: ing.amount,
      unit: ing.unit,
      notes: ing.notes?.trim() || undefined,
    }));
    const analyzedInstructions = [
      {
        name: 'Steps',
        steps: recipeData.instructions
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((inst) => ({ number: inst.stepNumber, step: inst.instruction.trim() })),
      },
    ];

    const doc: Omit<Recipe, '_id'> = {
      title: recipeData.title.trim(),
      description: recipeData.description.trim(),
      summary: recipeData.description.trim(),
      image: uploadedImages[0]?.url || '/placeholder-recipe.svg',
      sourceUrl: undefined,
      readyInMinutes: Math.max(5, (recipeData.prepTime || 0) + (recipeData.cookTime || 0)),
      servings: recipeData.servings,
      extendedIngredients,
      analyzedInstructions,
      cuisines: recipeData.cuisine ? [recipeData.cuisine] : [],
      dishTypes: recipeData.category ? [recipeData.category] : [],
      diets: recipeData.dietaryTags || [],
      nutrition: undefined,
      rating: 0,
      ratingsCount: 0,
      likesCount: 0,
      authorId: recipeData.userId,
      authorName: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: recipeData.isPublic,
      isPending: false,
      moderationNotes: '',
      isSpoonacular: false,
    };

    // Insert recipe into unified collection
    const result = await col.insertOne(doc as any);

    if (!result.insertedId) {
      // Clean up uploaded images if recipe creation failed
      await Promise.all(uploadedImages.map(async (img) => {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (error) {
          console.error('Error cleaning up image:', error);
        }
      }));

      return NextResponse.json(
        { success: false, message: 'Fehler beim Speichern des Rezepts' },
        { status: 500 }
      );
    }

    // Get the complete recipe with ID
  const completeRecipe = await col.findOne({ _id: result.insertedId });

    return NextResponse.json({
      success: true,
      message: 'Rezept erfolgreich hochgeladen',
      recipe: completeRecipe,
      uploadedImages: uploadedImages.length,
    });

  } catch (error) {
    console.error('Recipe upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unbekannter Fehler beim Hochladen' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Recipe upload endpoint - POST method required' },
    { status: 405 }
  );
}