import { useState } from 'react';

export function useSpoonacularSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchRecipes(query: string, filters: Record<string, any> = {}) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ query, ...filters });
      const res = await fetch(`/api/recipes/search-spoonacular?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError('Fehler bei der Spoonacular-Suche');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return { results, loading, error, searchRecipes };
}
