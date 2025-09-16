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
