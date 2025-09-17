import { useState } from 'react';

export function useRecipeSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchRecipes(params: Record<string, any>) {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        query: params.q || '',
        type: params.category || '',
        diet: params.diet || '',
        maxReadyTime: params.quick ? '20' : '',
      }).toString();
      const res = await fetch(`/api/recipes/search-spoonacular?${query}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError('Fehler bei der Rezeptsuche (Spoonacular)');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return { results, loading, error, searchRecipes };
}
