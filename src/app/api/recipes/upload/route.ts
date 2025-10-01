/**
 * Recipe Upload API Route
 * 
 * Handles recipe uploads with image processing and database storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoDBService, ObjectId } from '@/lib/db';
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

    // Connect to MongoDB
    const mongodb = MongoDBService.getInstance();
    await mongodb.connect();
    const db = await mongodb.getDatabase();

    // Create recipe document
    const recipe: Partial<Recipe> = {
      title: recipeData.title.trim(),
      description: recipeData.description.trim(),
      category: recipeData.category,
      cuisine: recipeData.cuisine || '',
      difficulty: recipeData.difficulty,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      totalTime: recipeData.prepTime + recipeData.cookTime,
      servings: recipeData.servings,
      
      // Process ingredients - remove temporary IDs
      ingredients: recipeData.ingredients.map(ing => ({
        name: ing.name.trim(),
        amount: ing.amount,
        unit: ing.unit,
        notes: ing.notes?.trim() || undefined,
      })),
      
      // Process instructions - remove temporary IDs and ensure proper numbering
      instructions: recipeData.instructions
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((inst, index) => ({
          stepNumber: index + 1,
          instruction: inst.instruction.trim(),
          time: (inst.time && inst.time > 0) ? inst.time : undefined,
          temperature: (inst.temperature && inst.temperature > 0) ? inst.temperature : undefined,
        })),
      
      // Tags and classification
      tags: [
        ...(recipeData.dietaryTags || []), 
        ...(recipeData.customTags || [])
      ].filter((tag: string) => tag && tag.trim()),
      
      // Media
      image: uploadedImages.length > 0 ? uploadedImages[0].url : '',
      images: uploadedImages.map(img => img.url),
      
      // Attribution (stored in description field for now)
      // source: recipeData.isOriginal ? 'user_original' : (recipeData.source?.trim() || 'unknown'),
      // isOriginal: recipeData.isOriginal, // Not part of Recipe interface
      
      // Visibility and sharing
      isPublic: recipeData.isPublic,
      
      // User and metadata
      authorId: recipeData.userId,
      authorName: 'User Recipe', // Will be updated from user data
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Initialize interaction counters (remove non-Recipe fields)
      // likes: 0,
      // reviews: [],
      // averageRating: 0,
      // totalReviews: 0,
      
      // Recipe visibility (use isPublished instead of status)
      isPublished: recipeData.isPublic,
      
      // SEO and discovery (remove slug - not part of Recipe interface)
      // slug: generateSlug(recipeData.title),
    };

    // Insert recipe into database
    const result = await db.collection('recipes').insertOne(recipe as any);

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
    const completeRecipe = await db.collection('recipes').findOne({ _id: result.insertedId });

    return NextResponse.json({
      success: true,
      message: 'Rezept erfolgreich hochgeladen',
      recipe: {
        ...completeRecipe,
        _id: result.insertedId.toString(),
      },
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

// Helper function to generate URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[äöüß]/g, (match) => {
      const replacements: Record<string, string> = {
        'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss'
      };
      return replacements[match] || match;
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET() {
  return NextResponse.json(
    { message: 'Recipe upload endpoint - POST method required' },
    { status: 405 }
  );
}