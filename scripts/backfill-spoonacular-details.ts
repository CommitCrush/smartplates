/**
 * Backfill-Skript: extendedIngredients, analyzedInstructions, cuisines, cookingMinutes, preparationMinutes
 *
 * Zweck: Für bereits gespeicherte Spoonacular-Rezepte in MongoDB die fehlenden
 * Felder aus der Spoonacular API nachladen und in der Collection `spoonacular_recipes` speichern.
 *
 * Ergänzte Felder:
 * - extendedIngredients (Zutatenliste mit Mengen)
 * - analyzedInstructions (Schritt-für-Schritt Anweisungen)
 * - cuisines, dishTypes, diets
 * - cookingMinutes (Kochzeit)
 * - preparationMinutes (Vorbereitungszeit)
 * - nutrition, summary, image
 *
 * Sicherheiten:
 * - Respektiert Tages-Quota über vorhandene Quota-Checks (optional: SPOONACULAR_ENABLED)
 * - Rate-Limit zwischen Requests (1–2s)
 * - Überspringt Rezepte, die bereits vollständige Felder haben (konfigurierbar)
 */

import { getCollection } from '@/lib/db';
import type { Recipe } from '@/types/recipe';
import type { Filter } from 'mongodb';
import { getSpoonacularRecipe } from '@/services/spoonacularService';

// Konfiguration
const BATCH_SIZE = parseInt(process.env.BACKFILL_BATCH_SIZE || '50', 10); // Anzahl an Rezepten pro Durchlauf
const SLEEP_MS = parseInt(process.env.BACKFILL_SLEEP_MS || '1200', 10);    // Pause zwischen API-Calls
const MAX_RECIPES = process.env.BACKFILL_MAX_RECIPES
  ? parseInt(process.env.BACKFILL_MAX_RECIPES, 10)
  : undefined; // Optional gesamt Limit

// Kriterien, wann ein Rezept "unvollständig" ist
function needsBackfill(r: Recipe): boolean {
  const missingIngredients = !r.extendedIngredients || r.extendedIngredients.length === 0;
  const partialIngredients = Array.isArray(r.extendedIngredients)
    ? r.extendedIngredients.some((ing) => !ing || !ing.name || typeof ing.amount !== 'number')
    : false;
  const missingInstructions = !r.analyzedInstructions || r.analyzedInstructions.length === 0;
  const emptyInstructionBlocks = Array.isArray(r.analyzedInstructions)
    ? r.analyzedInstructions.some((blk) => !blk || !Array.isArray(blk.steps) || blk.steps.length === 0)
    : false;
  const missingCuisines = !r.cuisines || r.cuisines.length === 0;
  const missingTimeFields = !r.cookingMinutes || !r.preparationMinutes;
  return missingIngredients || partialIngredients || missingInstructions || emptyInstructionBlocks || missingCuisines || missingTimeFields;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const spoonacularEnabled = process.env.SPOONACULAR_ENABLED !== 'false';
  if (!spoonacularEnabled) {
    console.error('SPOONACULAR_ENABLED=false – Backfill abgebrochen.');
    process.exit(1);
  }

  const collection = await getCollection<Recipe>('spoonacular_recipes');

  // Finde Rezepte, die unvollständig sind
  const baseQuery = ({
    $or: [
      // fehlende oder leere Zutatenliste
      { extendedIngredients: { $exists: false } },
      { extendedIngredients: { $size: 0 } },
      // Zutaten mit fehlenden Feldern (z.B. amount oder name)
      { extendedIngredients: { $elemMatch: { $or: [
        { amount: { $exists: false } },
        { amount: null },
        { name: { $exists: false } },
        { name: '' },
      ] } } },
      // fehlende oder leere Instructions
      { analyzedInstructions: { $exists: false } },
      { analyzedInstructions: { $size: 0 } },
      // Blocks ohne Schritte
      { analyzedInstructions: { $elemMatch: { $or: [
        { steps: { $exists: false } },
        { steps: { $size: 0 } },
      ] } } },
      // fehlende Cuisines
      { cuisines: { $exists: false } },
      { cuisines: { $size: 0 } },
      // fehlende Zeit-Felder
      { cookingMinutes: { $exists: false } },
      { cookingMinutes: null },
      { preparationMinutes: { $exists: false } },
      { preparationMinutes: null },
    ],
  } as unknown) as Filter<Recipe>;

  let processed = 0;
  let updated = 0;

  const cursor = collection.find(baseQuery, { projection: { _id: 1, spoonacularId: 1, id: 1, title: 1 } }).limit(MAX_RECIPES ?? 1_000_000);

  while (await cursor.hasNext()) {
    const batch: Recipe[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const doc = await cursor.next();
      if (!doc) break;
      batch.push(doc as Recipe);
    }

    if (batch.length === 0) break;

    for (const r of batch) {
      // Versuche die Spoonacular-ID abzuleiten
      let numericId: string | undefined;
      const spoonId = (r as unknown as { spoonacularId?: number }).spoonacularId;
      if (typeof spoonId === 'number') {
        numericId = String(spoonId);
      } else if (typeof r.id === 'number') {
        numericId = String(r.id);
      } else if (typeof r.id === 'string') {
        numericId = r.id.replace('spoonacular-', '');
      } else if (typeof r._id === 'string') {
        numericId = r._id.replace('spoonacular-', '');
      }
      if (!numericId || !/^\d+$/.test(numericId)) {
        processed++;
        continue;
      }

      // Skip, falls bereits vollständig
      if (!needsBackfill(r)) {
        processed++;
        continue;
      }

      try {
        const fullRecipe = await getSpoonacularRecipe(numericId);
        if (!fullRecipe) {
          processed++;
          await sleep(SLEEP_MS);
          continue;
        }

        const update: Partial<Recipe> = {
          extendedIngredients: fullRecipe.extendedIngredients,
          analyzedInstructions: fullRecipe.analyzedInstructions,
          cuisines: fullRecipe.cuisines,
          dishTypes: fullRecipe.dishTypes,
          diets: fullRecipe.diets,
          summary: fullRecipe.summary,
          readyInMinutes: fullRecipe.readyInMinutes,
          servings: fullRecipe.servings,
          image: fullRecipe.image || undefined,
          nutrition: fullRecipe.nutrition,
          cookingMinutes: fullRecipe.cookingMinutes,
          preparationMinutes: fullRecipe.preparationMinutes,
        };

        const filter: Filter<Recipe> = r._id
          ? ({ _id: r._id } as Filter<Recipe>)
          : (r.id
              ? ({ id: r.id } as Filter<Recipe>)
              : ({ id: `spoonacular-${numericId}` } as Filter<Recipe>));
        const res = await collection.updateOne(
          filter,
          { $set: update },
          { upsert: false }
        );

        if (res.modifiedCount > 0) {
          updated++;
          console.log(`✅ Updated recipe "${r.title}" with time data:`, {
            cookingMinutes: update.cookingMinutes || 'N/A',
            preparationMinutes: update.preparationMinutes || 'N/A',
            readyInMinutes: update.readyInMinutes || 'N/A'
          });
        }
      } catch (e) {
        const err = e as Error;
        const msg = err?.message || String(e);
        console.error(`Backfill-Fehler für Rezept ${numericId} (${r.title}):`, msg);
        // Bei Quota-Fehler (402) frühzeitig abbrechen, um Tageslimit zu respektieren
        if (msg.includes('status: 402') || msg.includes('daily points limit')) {
          console.warn('🚦 Quota erreicht (402). Backfill wird für heute beendet.');
          console.log(`Fortschritt: verarbeitet=${processed}, aktualisiert=${updated}`);
          console.log('Bitte morgen erneut starten.');
          console.log();
          console.log('Tipp: BACKFILL_BATCH_SIZE verkleinern und BACKFILL_SLEEP_MS erhöhen.');
          process.exit(0);
        }
      } finally {
        processed++;
        await sleep(SLEEP_MS);
      }
    }

    console.log(`Fortschritt: verarbeitet=${processed}, aktualisiert=${updated}`);
  }

  console.log(`Backfill abgeschlossen. Verarbeitet=${processed}, Aktualisiert=${updated}`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Unerwarteter Fehler im Backfill:', e);
  process.exit(1);
});
