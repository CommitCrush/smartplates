import { useState } from 'react';

export function useRecipeSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchRecipes(params: Record<string, any>) {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.dietaryRestrictions && Array.isArray(params.dietaryRestrictions)) {
        params.dietaryRestrictions.forEach((val: string) => queryParams.append('dietaryRestrictions', val));
      }
      if (params.tags && Array.isArray(params.tags)) {
        params.tags.forEach((tag: string) => queryParams.append('tags', tag));
      }
      if (params.maxTime) queryParams.append('maxTime', params.maxTime.toString());
      const res = await fetch(`/api/recipes?${queryParams.toString()}`);
      const data = await res.json();
      if (data.source) {
        console.log('API Source:', data.source, data.recipes);
      } else {
        console.log('API Response:', data);
      }
      setResults(data.recipes || []);
    } catch (err: any) {
      setError('Fehler bei der Rezeptsuche');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return { results, loading, error, searchRecipes };
}
