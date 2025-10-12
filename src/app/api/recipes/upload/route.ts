import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCollection, COLLECTIONS } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Recipe upload started');

    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('No session found');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', session.user.email);

    // Parse form data
    const formData = await request.formData();
    const recipeDataString = formData.get('recipeData') as string;
    
    if (!recipeDataString) {
      console.log('No recipe data found');
      return NextResponse.json(
        { success: false, message: 'Recipe data missing' },
        { status: 400 }
      );
    }

    console.log('Recipe data received');

    let recipeData;
    try {
      recipeData = JSON.parse(recipeDataString);
    } catch (error) {
      console.error('JSON parse error:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid recipe data' },
        { status: 400 }
      );
    }

    // Basic validation
    if (!recipeData.title?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    console.log('Validation passed');

    // Handle image uploads - check if images are already uploaded to Cloudinary
    const uploadedImages: Array<{url: string; publicId: string}> = [];
    
    // First, check if we have pre-uploaded Cloudinary images
    if (recipeData.cloudinaryImages && recipeData.cloudinaryImages.length > 0) {
      console.log('Using pre-uploaded Cloudinary images:', recipeData.cloudinaryImages.length);
      recipeData.cloudinaryImages.forEach((img: any) => {
        uploadedImages.push({
          url: img.url,
          publicId: img.publicId || '',
        });
      });
    } else if (recipeData.imageUrls && recipeData.imageUrls.length > 0) {
      console.log('Using image URLs:', recipeData.imageUrls.length);
      recipeData.imageUrls.forEach((url: string, index: number) => {
        uploadedImages.push({
          url: url,
          publicId: `recipe_image_${index}`,
        });
      });
    } else {
      // Handle new file uploads if no pre-uploaded images
      const imageFiles: File[] = [];

      // Collect image files from FormData
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('image_') && value instanceof File) {
          imageFiles.push(value);
        }
      }

      console.log('Found', imageFiles.length, 'new images to upload');

      // Upload images to Cloudinary
      for (const imageFile of imageFiles) {
        try {
          if (!imageFile.type.startsWith('image/')) {
            continue;
          }

          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'image',
                folder: 'smartplates/recipes',
                transformation: [
                  { width: 800, height: 600, crop: 'limit' },
                  { quality: 'auto:good' },
                  { format: 'webp' }
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(buffer);
          });

          if (uploadResult) {
            uploadedImages.push({
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
            });
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }

    console.log('Images uploaded:', uploadedImages.length);

    // Prepare recipe document
    const recipeDoc = {
      title: recipeData.title.trim(),
      description: recipeData.description || '',
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
      servings: recipeData.servings || 1,
      prepTime: recipeData.prepTime || 0,
      cookTime: recipeData.cookTime || 0,
      totalTime: (recipeData.prepTime || 0) + (recipeData.cookTime || 0),
      difficulty: recipeData.difficulty || 'medium',
      category: recipeData.category || 'dinner',
      cuisine: recipeData.cuisine || '',
      dietaryTags: recipeData.dietaryTags || [],
      allergens: recipeData.allergens || [],
      customTags: recipeData.customTags || [],
      images: uploadedImages.map((img, index) => ({
        id: `img_${index}`,
        url: img.url,
        alt: `${recipeData.title} - Image ${index + 1}`,
        isPrimary: index === 0,
      })),
      image: uploadedImages[0]?.url || '', // Single image field for compatibility
      primaryImageUrl: uploadedImages[0]?.url || '',
      source: recipeData.source || '',
      isOriginal: recipeData.isOriginal || true,
      isPublic: recipeData.isPublic || false,
      authorId: session.user.id,
      authorName: session.user.name || session.user.email,
      authorType: session.user.role === 'admin' ? 'admin' : 'user',
      status: session.user.role === 'admin' ? 'approved' : 'under-review',
      views: 0,
      likes: 0,
      saves: 0,
      likedBy: [],
      savedBy: [],
      cookedBy: [],
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      searchTags: [
        ...(recipeData.dietaryTags || []),
        ...(recipeData.customTags || []),
        recipeData.category || '',
        recipeData.difficulty || '',
        ...(recipeData.cuisine ? [recipeData.cuisine] : [])
      ],
      slug: `${recipeData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: recipeData.isPublic ? new Date() : undefined,
    };

    console.log('Saving recipe to database');

    // Save to appropriate collection based on user role
    const isAdmin = session.user.role === 'admin';
    const targetCollection = isAdmin ? COLLECTIONS.RECIPES : COLLECTIONS.USER_RECIPES;
    const recipesCollection = await getCollection(targetCollection);
    
    console.log(`Saving to collection: ${targetCollection} (Admin: ${isAdmin})`);
    console.log(`Recipe doc preview:`, {
      title: recipeDoc.title,
      authorType: recipeDoc.authorType,
      authorId: recipeDoc.authorId,
      status: recipeDoc.status
    });
    
    const result = await recipesCollection.insertOne(recipeDoc);

    if (!result.insertedId) {
      console.error('Failed to insert recipe - no insertedId returned');
      return NextResponse.json(
        { success: false, message: 'Error saving recipe - database insert failed' },
        { status: 500 }
      );
    }

    console.log(`Recipe saved successfully with ID: ${result.insertedId} in collection: ${targetCollection}`);

    return NextResponse.json({
      success: true,
      message: 'Recipe uploaded successfully',
      recipe: {
        id: result.insertedId.toString(),
        title: recipeDoc.title,
        slug: recipeDoc.slug,
        status: recipeDoc.status,
        isPublic: recipeDoc.isPublic,
        authorType: recipeDoc.authorType,
      },
      uploadedImages: uploadedImages.length,
    });

  } catch (error) {
    console.error('Recipe upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown upload error',
        error: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    );
  }
}