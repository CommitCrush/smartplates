// Save imported recipe to local DB (placeholder)
import { Recipe } from '@/types/recipe';

export async function saveRecipeToDb(recipe: Recipe, userId: string) {
	// TODO: Implement actual DB save logic
	// For now, return recipe with user attribution
	return {
		...recipe,
		importedBy: userId,
		source: 'spoonacular',
		importedAt: new Date().toISOString(),
	};
}
