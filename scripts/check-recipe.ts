#!/usr/bin/env bun
import { getCollection } from '../src/lib/db.js';

async function checkSpecificRecipe(recipeId: string) {
  console.log(`🔍 Prüfe Rezept mit _id: "${recipeId}"`);
  
  try {
    const col = await getCollection('spoonacular_recipes');
    
    // Try different _id formats
    let recipe = await col.findOne({ _id: recipeId } as unknown as any);
    
    // If not found, try as spoonacularId
    if (!recipe && recipeId.startsWith('spoonacular-')) {
      const spoonId = parseInt(recipeId.replace('spoonacular-', ''));
      recipe = await col.findOne({ spoonacularId: spoonId } as unknown as any);
    }
    
    if (!recipe) {
      console.log(`❌ Rezept mit _id "${recipeId}" nicht gefunden`);
      return;
    }
    
    console.log('\n📋 Rezept gefunden:');
    console.log('Titel:', recipe.title);
    console.log('spoonacularId:', recipe.spoonacularId);
    console.log('analyzedInstructions Länge:', recipe.analyzedInstructions?.length || 0);
    
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      console.log('\n🔍 analyzedInstructions Inhalt:');
      recipe.analyzedInstructions.forEach((block: unknown, idx: number) => {
        const blockData = block as { name?: string; steps?: Array<{ number: number; step: string }> };
        console.log(`Block ${idx + 1}: ${blockData.name || 'Unnamed'}`);
        console.log(`  Steps: ${blockData.steps?.length || 0}`);
        if (blockData.steps && blockData.steps.length > 0) {
          blockData.steps.slice(0, 3).forEach((step: { number: number; step: string }) => {
            const stepText = step.step?.substring(0, 80) || 'Kein Text';
            console.log(`    ${step.number}. ${stepText}...`);
          });
          if (blockData.steps.length > 3) {
            console.log(`    ... und ${blockData.steps.length - 3} weitere Steps`);
          }
        }
      });
    } else {
      console.log('⚠️ analyzedInstructions ist leer oder undefined');
      
      if (recipe.instructions) {
        console.log('\n📝 Aber instructions (String) vorhanden:');
        console.log(recipe.instructions.substring(0, 300) + '...');
      } else {
        console.log('❌ Auch instructions (String) ist leer');
      }
    }
    
    // Additional info
    console.log('\n📊 Weitere Infos:');
    console.log('extendedIngredients:', recipe.extendedIngredients?.length || 0, 'items');
    console.log('readyInMinutes:', recipe.readyInMinutes);
    console.log('servings:', recipe.servings);
    console.log('isSpoonacular:', recipe.isSpoonacular);
    
  } catch (error) {
    console.error('❌ Fehler beim Prüfen des Rezepts:', error);
    throw error;
  }
}

async function main() {
  const recipeId = process.argv[2] || 'spoonacular-715543';
  console.log('🚀 MongoDB Rezept-Checker\n');
  
  try {
    await checkSpecificRecipe(recipeId);
    console.log('\n✅ Prüfung abgeschlossen');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script fehlgeschlagen:', error);
    process.exit(1);
  }
}

main();