import { getCollection } from '@/lib/db';
import { Recipe } from '@/types/recipe';

export type Pagination = { page?: number; limit?: number };
export type SearchFilters = {
  query?: string;
  type?: string;
  diet?: string;
  intolerances?: string;
  difficulty?: string;
  maxReadyTime?: number;
  authorId?: string;
};

export async function searchRecipesMongoAI(filters: SearchFilters = {}, pagination: Pagination = {}, randomize: boolean = false) {
  const page = Math.max(1, pagination.page || 1);
  const limit = Math.min(100, Math.max(1, pagination.limit || 30));
  const col = await getCollection<Recipe>('spoonacular_recipes');

  const query: any = {
    'analyzedInstructions.0': { $exists: true },
    'analyzedInstructions.0.steps.0': { $exists: true },
    'analyzedInstructions.0.steps.0.step': { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } },
    'extendedIngredients.0': { $exists: true }
  };

  if (filters.query) {
    const ingredients = filters.query.split(',').map(z => z.trim()).filter(Boolean);
    const ingredientRegexArr = ingredients.map(zutat => ({ 'extendedIngredients.name': { $regex: zutat, $options: 'i' } }));
    query.$or = [
      { title: { $regex: filters.query, $options: 'i' } },
      { description: { $regex: filters.query, $options: 'i' } },
      ...ingredientRegexArr,
    ];
  }
  if (filters.type) {
    query.dishTypes = { $in: [filters.type] };
  }
  if (filters.diet) {
    const dietMapping: Record<string, string[]> = {
      'vegetarian': ['lacto ovo vegetarian', 'vegetarian'],
      'vegan': ['vegan'],
      'gluten free': ['gluten free'],
      'ketogenic': ['ketogenic'],
      'paleo': ['paleolithic'],
      'primal': ['primal'],
      'whole30': ['whole 30'],
      'pescatarian': ['pescatarian'],
      'dairy free': ['dairy free']
    };
    const mappedDiets = dietMapping[filters.diet.toLowerCase()] || [filters.diet];
    query.diets = { $in: mappedDiets };
  }
  if (typeof filters.maxReadyTime === 'number') {
    query.readyInMinutes = { $lte: filters.maxReadyTime };
  }
  if (filters.difficulty) {
    // Map difficulty levels to cooking time ranges
    const difficultyMapping: Record<string, { $lte?: number; $gte?: number }> = {
      'easy': { $lte: 15 },      // Easy: <= 15 minutes
      'medium': { $gte: 16, $lte: 30 }, // Medium: 31-60 minutes  
      'hard': { $gte: 31 }       // Hard: > 60 minutes
    };
    
    const timeFilter = difficultyMapping[filters.difficulty.toLowerCase()];
    if (timeFilter) {
      if (timeFilter.$lte && timeFilter.$gte) {
        query.readyInMinutes = { $gte: timeFilter.$gte, $lte: timeFilter.$lte };
      } else if (timeFilter.$lte) {
        query.readyInMinutes = { $lte: timeFilter.$lte };
      } else if (timeFilter.$gte) {
        query.readyInMinutes = { $gte: timeFilter.$gte };
      }
    }
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
    query.extendedIngredients = {
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
      : col.find(query)
          .sort({ createdAt: -1, _id: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
    col.countDocuments(query),
  ]);

  return { recipes: items, total };
}
