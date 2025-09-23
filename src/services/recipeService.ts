// Save imported Spoonacular recipe to local DB (placeholder)
import { SpoonacularRecipe } from './spoonacularService';

export async function saveRecipeToDb(recipe: SpoonacularRecipe, userId: string) {
	// TODO: Implement actual DB save logic
	// For now, return recipe with user attribution
	return {
		...recipe,
		importedBy: userId,
		source: 'spoonacular',
		importedAt: new Date().toISOString(),
	};
}
// src/services/recipeService.ts
import { parseIngredient, ParsedIngredient } from '@/utils/validators';
import { connectToDatabase } from '@/lib/db';
// Removed unused import

export async function generateGroceryList(mealPlan: any) {
  // mealPlan contains array of recipeIds
  const db = await connectToDatabase();
  const recipes = await db
    .collection('recipes')
    .find({ _id: { $in: mealPlan.recipes } })
    .toArray();

  const groceryMap: Record<string, { quantity: number; unit: string }> = {};

  recipes.forEach((recipe: any) => {
    recipe.ingredients?.forEach((raw: string) => {
      const ing: ParsedIngredient = parseIngredient(raw);
      const key = `${ing.name.toLowerCase()}-${ing.unit}`;

      if (!groceryMap[key]) {
        groceryMap[key] = { quantity: 0, unit: ing.unit };
      }
      groceryMap[key].quantity += ing.quantity;
    });
  });

  return Object.entries(groceryMap).map(([key, val]) => {
    const [name] = key.split('-');
    return { name, quantity: val.quantity, unit: val.unit };
  });
}
