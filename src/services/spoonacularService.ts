// src/services/spoonacularService.ts
import axios from 'axios';

const SPOONACULAR_API_URL = 'https://api.spoonacular.com';
const API_KEY = process.env.SPOONACULAR_API_KEY;

export interface SpoonacularSearchFilters {
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  [key: string]: any;
}

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  [key: string]: any;
}

export class SpoonacularService {
  private apiKey: string;

  constructor(apiKey: string = API_KEY || '') {
    this.apiKey = apiKey;
  }

  async searchRecipes(query: string, filters: SpoonacularSearchFilters = {}): Promise<SpoonacularRecipe[]> {
    try {
      const params = {
        apiKey: this.apiKey,
        query,
        ...filters,
      };
      const response = await axios.get(`${SPOONACULAR_API_URL}/recipes/complexSearch`, { params });
      return response.data.results || [];
    } catch (error: any) {
      // TODO: Add error and rate limit handling
      return [];
    }
  }

  async getRecipeDetails(id: number): Promise<SpoonacularRecipe | null> {
    try {
      const params = { apiKey: this.apiKey };
      const response = await axios.get(`${SPOONACULAR_API_URL}/recipes/${id}/information`, { params });
      return response.data || null;
    } catch (error: any) {
      // TODO: Add error and rate limit handling
      return null;
    }
  }

  async findByIngredients(ingredients: string[]): Promise<SpoonacularRecipe[]> {
    try {
      const params = {
        apiKey: this.apiKey,
        ingredients: ingredients.join(',')
      };
      const response = await axios.get(`${SPOONACULAR_API_URL}/recipes/findByIngredients`, { params });
      return response.data || [];
    } catch (error: any) {
      // TODO: Add error and rate limit handling
      return [];
    }
  }
}
