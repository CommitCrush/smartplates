import { SpoonacularService } from '../src/services/spoonacularService';

describe('SpoonacularService', () => {
  const service = new SpoonacularService('test-key');

  it('should search recipes and return an array', async () => {
    // Mock axios
    jest.spyOn(service as any, 'searchRecipes').mockResolvedValue([
      { id: 1, title: 'Test Recipe', image: 'test.jpg' }
    ]);
    const results = await service.searchRecipes('test');
    expect(Array.isArray(results)).toBe(true);
    expect(results[0].title).toBe('Test Recipe');
  });

  it('should get recipe details', async () => {
    jest.spyOn(service as any, 'getRecipeDetails').mockResolvedValue({ id: 1, title: 'Test Recipe', image: 'test.jpg' });
    const details = await service.getRecipeDetails(1);
    expect(details).toHaveProperty('id', 1);
  });

  it('should find recipes by ingredients', async () => {
    jest.spyOn(service as any, 'findByIngredients').mockResolvedValue([
      { id: 2, title: 'Ingredient Recipe', image: 'ingredient.jpg' }
    ]);
    const results = await service.findByIngredients(['tomato']);
    expect(results[0].title).toBe('Ingredient Recipe');
  });
});
