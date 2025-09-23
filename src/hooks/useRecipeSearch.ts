'use client';

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
      if (params.q) queryParams.append('search', params.q);
      if (params.category) queryParams.append('category', params.category);
      if (params.difficulty) queryParams.append('difficulty', params.difficulty);
      if (params.tags) queryParams.append('tags', params.tags);
      if (params.quick) queryParams.append('maxTime', '20');
      // dietaryRestrictions als Array übergeben, falls beide Werte vorhanden sind
      const dietaryRestrictions: string[] = [];
      if (params.diet) dietaryRestrictions.push(params.diet);
      // Tags als Array übergeben
      if (params.tags && Array.isArray(params.tags)) {
        params.tags.forEach((tag: string) => queryParams.append('tags', tag));
      }
      dietaryRestrictions.forEach(val => queryParams.append('dietaryRestrictions', val));
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
