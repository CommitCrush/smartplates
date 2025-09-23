import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, COLLECTIONS } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    console.log('✅ Connected to MongoDB for import');

    // JSON-Datei lesen
    const jsonPath = path.join(process.cwd(), 'public', 'cached-recipes.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(jsonData);

    console.log(`📊 Found ${data.totalCount} recipes in JSON file`);

    let importedCount = 0;
    let skippedCount = 0;

    const recipesCollection = db.collection(COLLECTIONS.RECIPES);

    // Jedes Rezept importieren
    for (const recipe of data.recipes) {
      try {
        // Prüfen ob Rezept bereits existiert
        const existingRecipe = await recipesCollection.findOne({ 
          $or: [
            { id: recipe.id },
            { title: recipe.title }
          ]
        });

        if (existingRecipe) {
          console.log(`⏩ Skipping existing recipe: ${recipe.title}`);
          skippedCount++;
          continue;
        }

        // Neues Rezept erstellen (ohne _id - MongoDB generiert automatisch)
        const recipeToInsert = {
          ...recipe,
          createdAt: new Date(recipe.createdAt || Date.now()),
          updatedAt: new Date(recipe.updatedAt || Date.now())
        };

        // _id entfernen falls vorhanden
        delete recipeToInsert._id;

        await recipesCollection.insertOne(recipeToInsert);
        console.log(`✅ Imported: ${recipe.title}`);
        importedCount++;

      } catch (recipeError) {
        console.error(`❌ Failed to import ${recipe.title}:`, recipeError);
      }
    }

    // Ergebnis zurückgeben
    const result = {
      success: true,
      message: `Import completed: ${importedCount} imported, ${skippedCount} skipped`,
      imported: importedCount,
      skipped: skippedCount,
      total: data.totalCount
    };

    console.log('🎉 Import completed:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Import failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}