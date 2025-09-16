import { useSpoonacularSearch } from '@/hooks/useSpoonacularSearch';
import { useState } from 'react';

export default function SpoonacularImport() {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [intolerances, setIntolerances] = useState('');
  const { results, loading, error, searchRecipes } = useSpoonacularSearch();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    searchRecipes(query, { cuisine, diet, intolerances });
  }

  async function handleImport(id: number) {
    const res = await fetch('/api/recipes/import-spoonacular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.recipe) {
      alert('Rezept erfolgreich importiert!');
    } else {
      alert('Import fehlgeschlagen!');
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-neutral-900">
      <form onSubmit={handleSearch} className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Suchbegriff (z.B. Pasta)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Küche (optional)"
          value={cuisine}
          onChange={e => setCuisine(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Diät (optional)"
          value={diet}
          onChange={e => setDiet(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Intoleranzen (optional)"
          value={intolerances}
          onChange={e => setIntolerances(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Suchen</button>
      </form>
      {loading && <div className="animate-pulse">Lade Ergebnisse...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="space-y-2">
        {results.map((recipe: any) => (
          <li key={recipe.id} className="flex items-center justify-between border-b py-2">
            <span>{recipe.title}</span>
            <button
              className="bg-accent text-white px-2 py-1 rounded"
              onClick={() => handleImport(recipe.id)}
            >
              Importieren
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
