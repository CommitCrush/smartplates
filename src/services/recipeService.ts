import { ObjectId, type Filter, type UpdateFilter } from 'mongodb';
import { Recipe, RecipeIngredient, RecipeInstructionBlock } from '@/types/recipe';
import { getCollection } from '@/lib/db';
import RecipeModel from '@/models/Recipe';

const COLLECTION_NAME = 'spoonacular_recipes';

// Hilfsfunktion zur Validierung vollständiger Rezepte
function isRecipeComplete(recipe: Partial<Recipe>): boolean {
	return !!(
		recipe.title &&
		recipe.analyzedInstructions &&
		recipe.analyzedInstructions.length > 0 &&
		recipe.analyzedInstructions.some(block => 
			block.steps && block.steps.length > 0 && 
			block.steps.some(step => step.step && step.step.trim().length > 0)
		) &&
		recipe.extendedIngredients &&
		recipe.extendedIngredients.length > 0
	);
}

export type Pagination = { page?: number; limit?: number };

export type SearchFilters = {
	query?: string;
	type?: string;
	diet?: string;
	intolerances?: string;
	maxReadyTime?: number;
	authorId?: string;
};

export async function searchRecipesMongo(filters: SearchFilters = {}, pagination: Pagination = {}, randomize: boolean = false) {
	const page = Math.max(1, pagination.page || 1);
	const limit = Math.min(100, Math.max(1, pagination.limit || 30));
	const col = await getCollection<Recipe>(COLLECTION_NAME);

	const query: Filter<Recipe> = {
		// Nur Rezepte mit vollständigen analyzedInstructions
		'analyzedInstructions.0': { $exists: true },
		'analyzedInstructions.0.steps.0': { $exists: true },
		'analyzedInstructions.0.steps.0.step': { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } },
		// Nur Rezepte mit Zutaten
		'extendedIngredients.0': { $exists: true }
	};
	if (filters.query) {
		query.$or = [
			{ title: { $regex: filters.query, $options: 'i' } },
			{ description: { $regex: filters.query, $options: 'i' } },
		];
	}
	if (filters.type) {
		query.dishTypes = { $in: [filters.type] };
	}
	if (filters.diet) {
		query.diets = { $in: [filters.diet] };
	}
	if (typeof filters.maxReadyTime === 'number') {
		query.readyInMinutes = { $lte: filters.maxReadyTime };
	}
	if (filters.intolerances) {
		const intoleranceKey = filters.intolerances.toLowerCase();
		const regexMap: Record<string, RegExp> = {
			egg: /\begg(s)?\b/i,
			gluten: /(gluten|wheat|flour|barley|rye)/i,
			dairy: /(milk|cheese|butter|cream|yogurt|lactose)/i,
			peanut: /peanut/i,
			seafood: /(fish|shrimp|prawn|crab|lobster|tuna|salmon)/i,
			sesame: /sesame/i,
			soy: /(soy|soya|tofu|soybean)/i,
			sulfite: /(sulfite|sulphite)/i,
			'tree nut': /(almond|walnut|hazelnut|cashew|pecan|pistachio|macadamia)/i,
			wheat: /(wheat|flour)/i,
		};
		const rx = regexMap[intoleranceKey] || new RegExp(intoleranceKey.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
			(query as Filter<Recipe> & { extendedIngredients?: { $not: { $elemMatch: { name: RegExp } } } }).extendedIngredients = {
				$not: { $elemMatch: { name: rx } }
			};
	}
	if (filters.authorId) {
		query.authorId = filters.authorId;
	}

	const [items, total] = await Promise.all([
		randomize 
			? col.aggregate([
				{ $match: query },
				{ $sample: { size: limit } }
			]).toArray()
			: col.find(query).skip((page - 1) * limit).limit(limit).toArray(),
		col.countDocuments(query),
	]);

	return { recipes: items, total };
}

export async function findRecipeById(id: string) {
	const col = await getCollection<Recipe>(COLLECTION_NAME);

	// Try direct _id
		try {
			const asObjectId = new ObjectId(id);
			const byObjectId = await col.findOne({ _id: asObjectId } as Filter<Recipe>);
		if (byObjectId) return byObjectId;
	} catch {}

	// Try by stored string id
		const byStringId = await col.findOne({ id } as Filter<Recipe>);
	if (byStringId) return byStringId;

	// Try by spoonacularId (supports both plain number or prefixed string)
	const spoonId = id.startsWith('spoonacular-') ? parseInt(id.replace('spoonacular-', '')) : parseInt(id);
	if (!Number.isNaN(spoonId)) {
			const bySpoon = await col.findOne({ spoonacularId: spoonId } as Filter<Recipe>);
		if (bySpoon) return bySpoon;
	}

	return null;
}

export type CreateUserRecipeInput = {
	userId: string;
	title: string;
	description: string;
	servings: number;
	image?: string;
	readyInMinutes?: number;
	ingredients: Array<{ name: string; amount: number; unit: string; notes?: string }>;
	instructions: Array<{ stepNumber: number; instruction: string; time?: number; temperature?: number }>;
	category?: string;
	cuisine?: string;
	dietaryTags?: string[];
	isPublic?: boolean;
};

export async function createUserRecipe(input: CreateUserRecipeInput): Promise<Recipe> {
	// Validierung der Eingabedaten
	if (!input.title || !input.instructions || input.instructions.length === 0) {
		throw new Error('Rezept muss Titel und Anweisungen haben');
	}

	if (!input.ingredients || input.ingredients.length === 0) {
		throw new Error('Rezept muss mindestens eine Zutat haben');
	}

	const col = await getCollection<Recipe>(COLLECTION_NAME);

	const extendedIngredients: RecipeIngredient[] = input.ingredients.map((ing, idx) => ({
		id: idx + 1,
		name: ing.name,
		amount: ing.amount,
		unit: ing.unit,
		notes: ing.notes,
	}));

	const analyzedInstructions: RecipeInstructionBlock[] = [
		{
			name: 'Steps',
			steps: input.instructions
				.filter(inst => inst.instruction && inst.instruction.trim().length > 0)
				.sort((a, b) => a.stepNumber - b.stepNumber)
				.map((inst) => ({ number: inst.stepNumber, step: inst.instruction.trim() })),
		},
	];

	// Prüfung auf vollständige Anweisungen
	if (analyzedInstructions[0].steps.length === 0) {
		throw new Error('Rezept muss mindestens eine gültige Anweisung haben');
	}

	const doc: Omit<Recipe, '_id'> & { id?: string } = {
		title: input.title,
		description: input.description,
		summary: input.description,
		image: input.image || '/placeholder-recipe.svg',
		sourceUrl: undefined,
		readyInMinutes: input.readyInMinutes ?? Math.max(5, input.instructions.length * 3),
		servings: input.servings,
		extendedIngredients,
		analyzedInstructions,
		cuisines: input.cuisine ? [input.cuisine] : [],
		dishTypes: input.category ? [input.category] : [],
		diets: input.dietaryTags || [],
		nutrition: undefined,
		rating: 0,
		ratingsCount: 0,
		likesCount: 0,
		authorId: input.userId,
		authorName: undefined,
		isPublished: input.isPublic ?? true,
		isPending: false,
		moderationNotes: '',
		isSpoonacular: false,
	};

	// Finale Vollständigkeitsprüfung
	if (!isRecipeComplete(doc)) {
		throw new Error('Rezept ist unvollständig und kann nicht gespeichert werden');
	}

	const res = await col.insertOne(doc as unknown as Omit<Recipe, '_id'>);
	return { ...doc, _id: res.insertedId } as Recipe;
}

export async function updateRecipe(id: string, updates: Partial<Recipe>) {
	const col = await getCollection<Recipe>(COLLECTION_NAME);
		const filter: Filter<Recipe> = (() => {
			try { return { _id: new ObjectId(id) } as unknown as Filter<Recipe>; } catch { return { id } as unknown as Filter<Recipe>; }
		})();
		const update: UpdateFilter<Recipe> = { $set: { ...updates, updatedAt: new Date().toISOString() } as Partial<Recipe> } as UpdateFilter<Recipe>;
		await col.updateOne(filter, update);
	return findRecipeById(id);
}

export async function deleteRecipe(id: string) {
	const col = await getCollection<Recipe>(COLLECTION_NAME);
		const filter: Filter<Recipe> = (() => {
			try { return { _id: new ObjectId(id) } as unknown as Filter<Recipe>; } catch { return { id } as unknown as Filter<Recipe>; }
		})();
	const res = await col.deleteOne(filter);
	return res.deletedCount === 1;
}

export async function listRecipesByUser(
  userId: string,
  opts: { page?: number; limit?: number; dishTypes?: string[] } = {}
) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 30));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { 
    userId,
    // Nur vollständige Rezepte
    'analyzedInstructions.0': { $exists: true },
    'analyzedInstructions.0.steps.0': { $exists: true },
    'analyzedInstructions.0.steps.0.step': { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } },
    'extendedIngredients.0': { $exists: true }
  };

  if (opts.dishTypes && opts.dishTypes.length > 0) {
    filter.dishTypes = { $in: opts.dishTypes.map((d) => d.toLowerCase()) };
  }

  const [recipes, total] = await Promise.all([
    RecipeModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    RecipeModel.countDocuments(filter),
  ]);

  return { recipes, total, page, limit };
}

// Neue Funktion: Bereinigung unvollständiger Rezepte
export async function cleanupIncompleteRecipes(): Promise<{ deletedCount: number }> {
	const col = await getCollection<Recipe>(COLLECTION_NAME);
	
	const incompleteFilter = {
		$or: [
			{ analyzedInstructions: { $exists: false } },
			{ analyzedInstructions: { $size: 0 } },
			{ 'analyzedInstructions.0.steps': { $exists: false } },
			{ 'analyzedInstructions.0.steps': { $size: 0 } },
			{ 'analyzedInstructions.0.steps.0.step': { $exists: false } },
			{ 'analyzedInstructions.0.steps.0.step': '' },
			{ 'analyzedInstructions.0.steps.0.step': { $regex: /^\s*$/ } },
			{ extendedIngredients: { $exists: false } },
			{ extendedIngredients: { $size: 0 } },
			{ title: { $exists: false } },
			{ title: '' }
		]
	};

	const result = await col.deleteMany(incompleteFilter);
	
	console.log(`🗑️ Gelöscht: ${result.deletedCount} unvollständige Rezepte`);
	return { deletedCount: result.deletedCount };
}

// Back-compat helper erweitert mit Vollständigkeitsprüfung
export async function saveRecipeToDb(recipe: Recipe, userId: string) {
	// Vollständigkeitsprüfung vor dem Speichern
	if (!isRecipeComplete(recipe)) {
		console.warn('⚠️ Unvollständiges Rezept wird nicht gespeichert:', recipe.title);
		throw new Error('Rezept ist unvollständig und kann nicht gespeichert werden');
	}

	const col = await getCollection<Recipe>(COLLECTION_NAME);
	const doc: Recipe & { id?: string } = {
		...recipe,
		authorId: userId,
		isSpoonacular: recipe.isSpoonacular ?? true,
	};
	
	const res = await col.insertOne(doc as unknown as Omit<Recipe, '_id'>);
	return { ...doc, _id: res.insertedId } as Recipe;
}
