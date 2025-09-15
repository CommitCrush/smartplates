# Spoonacular API Integration

**Phase**: 2 - Core Recipe System (Woche 2)  
**Developer**: Developer 5 (Monika) - Grocery List Generation & External API Integration  
**Priorität**: HOCH - Erweitert die Recipe-Funktionalität

## Übersicht

Die Spoonacular API wird für die Beschaffung von externen Rezeptdaten, Zutateninformationen und Nährwertangaben verwendet. Diese Dokumentation erklärt die Integration und Verwendung der API.

## API-Konfiguration

### Environment Variables

```bash
# .env.local
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
SPOONACULAR_BASE_URL=https://api.spoonacular.com
```

### API Key Setup

1. Registrieren Sie sich bei [Spoonacular API](https://spoonacular.com/food-api)
2. Wählen Sie einen passenden Plan (free tier verfügbar)
3. Kopieren Sie Ihren API Key
4. Fügen Sie den API Key zu `.env.local` hinzu

## Service Implementation

### Spoonacular Service

```typescript
// src/services/spoonacularService.ts

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  spoonacularSourceUrl: string;
}

export interface RecipeInformation extends SpoonacularRecipe {
  instructions: string;
  extendedIngredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    originalString: string;
  }>;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

class SpoonacularService {
  private baseURL = process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com';
  private apiKey = process.env.SPOONACULAR_API_KEY;

  /**
   * Suche nach Rezepten mit verschiedenen Filtern
   */
  async searchRecipes(params: {
    query?: string;
    cuisine?: string;
    diet?: string;
    intolerances?: string;
    number?: number;
    offset?: number;
  }): Promise<{ results: SpoonacularRecipe[]; totalResults: number }> {
    const searchParams = new URLSearchParams({
      apiKey: this.apiKey!,
      addRecipeInformation: 'true',
      fillIngredients: 'true',
      number: (params.number || 12).toString(),
      offset: (params.offset || 0).toString(),
    });

    if (params.query) searchParams.append('query', params.query);
    if (params.cuisine) searchParams.append('cuisine', params.cuisine);
    if (params.diet) searchParams.append('diet', params.diet);
    if (params.intolerances) searchParams.append('intolerances', params.intolerances);

    const response = await fetch(`${this.baseURL}/recipes/complexSearch?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Detaillierte Rezeptinformationen abrufen
   */
  async getRecipeInformation(id: number): Promise<RecipeInformation> {
    const response = await fetch(
      `${this.baseURL}/recipes/${id}/information?apiKey=${this.apiKey}&includeNutrition=true`
    );

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Rezepte basierend auf verfügbaren Zutaten finden
   */
  async findByIngredients(ingredients: string[], number: number = 10): Promise<SpoonacularRecipe[]> {
    const response = await fetch(
      `${this.baseURL}/recipes/findByIngredients?apiKey=${this.apiKey}&ingredients=${ingredients.join(',')}&number=${number}`
    );

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Nährwertinformationen für Zutaten
   */
  async getIngredientInformation(id: number): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/food/ingredients/${id}/information?apiKey=${this.apiKey}&amount=1&unit=piece`
    );

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const spoonacularService = new SpoonacularService();
```

## API Routes Integration

### Recipe Import API

```typescript
// src/app/api/recipes/import-spoonacular/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { spoonacularService } from '@/services/spoonacularService';
import { withAuth } from '@/middleware/authMiddleware';

async function importSpoonacularRecipe(
  request: NextRequest,
  { user }: { user: any }
): Promise<NextResponse> {
  try {
    const { spoonacularId } = await request.json();

    // Rezept von Spoonacular API abrufen
    const spoonacularRecipe = await spoonacularService.getRecipeInformation(spoonacularId);

    // In SmartPlates Format konvertieren
    const smartPlatesRecipe = {
      title: spoonacularRecipe.title,
      description: spoonacularRecipe.instructions,
      image: spoonacularRecipe.image,
      servings: spoonacularRecipe.servings,
      cookingTime: spoonacularRecipe.readyInMinutes,
      ingredients: spoonacularRecipe.extendedIngredients.map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit
      })),
      nutrition: spoonacularRecipe.nutrition,
      sourceUrl: spoonacularRecipe.sourceUrl,
      externalId: spoonacularRecipe.id,
      source: 'spoonacular',
      createdBy: user.id
    };

    // In lokaler Datenbank speichern
    // (Implementation mit bestehenden Recipe CRUD Operationen)

    return NextResponse.json({
      success: true,
      recipe: smartPlatesRecipe
    });

  } catch (error) {
    console.error('Spoonacular import error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Importieren des Rezepts' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(importSpoonacularRecipe);
```

## Frontend Integration

### Recipe Search Hook

```typescript
// src/hooks/useSpoonacularSearch.ts

import { useState, useCallback } from 'react';
import { SpoonacularRecipe } from '@/services/spoonacularService';

export function useSpoonacularSearch() {
  const [results, setResults] = useState<SpoonacularRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecipes = useCallback(async (searchParams: {
    query?: string;
    cuisine?: string;
    diet?: string;
    intolerances?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recipes/search-spoonacular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Rezept-Suche');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, searchRecipes };
}
```

## Rate Limiting & Caching

### API Request Caching

```typescript
// src/lib/cache/spoonacularCache.ts

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class SpoonacularCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 3600000; // 1 hour

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const spoonacularCache = new SpoonacularCache();
```

## Error Handling

### API Error Types

```typescript
// src/types/spoonacular.d.ts

export interface SpoonacularError {
  status: number;
  message: string;
  code?: string;
}

export class SpoonacularApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'SpoonacularApiError';
  }
}
```

## Verwendung in Komponenten

### Recipe Import Component

```typescript
// src/components/recipe/SpoonacularImport.tsx

'use client';

import { useState } from 'react';
import { useSpoonacularSearch } from '@/hooks/useSpoonacularSearch';

export function SpoonacularImport() {
  const { results, loading, error, searchRecipes } = useSpoonacularSearch();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    searchRecipes({ query });
  };

  const handleImport = async (spoonacularId: number) => {
    try {
      const response = await fetch('/api/recipes/import-spoonacular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spoonacularId })
      });

      if (response.ok) {
        alert('Rezept erfolgreich importiert!');
      }
    } catch (error) {
      alert('Fehler beim Importieren des Rezepts');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rezept suchen..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Suchen...' : 'Suchen'}
        </button>
      </div>

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((recipe) => (
          <div key={recipe.id} className="border rounded-lg p-4">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-48 object-cover rounded mb-2"
            />
            <h3 className="font-semibold">{recipe.title}</h3>
            <p className="text-sm text-gray-600">
              {recipe.readyInMinutes} Min | {recipe.servings} Portionen
            </p>
            <button
              onClick={() => handleImport(recipe.id)}
              className="mt-2 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Importieren
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## API Limits & Kostenmanagement

### Free Tier Limits
- **Requests**: 150 requests/Tag
- **Points**: Jede API-Call kostet 1-10 Points
- **Rate Limiting**: Max. 1 request/Sekunde

### Kostensparende Strategien
1. **Caching**: Spoonacular-Responses für 1 Stunde zwischenspeichern
2. **Batch Requests**: Mehrere Daten in einem API Call abrufen
3. **Local Storage**: Häufig verwendete Daten lokal speichern
4. **Fallback**: Bei API-Limit auf lokale Rezept-Datenbank zurückgreifen

## Implementation Status

### ❌ TO DO - Noch zu implementieren:
- [ ] `src/services/spoonacularService.ts`
- [ ] `src/app/api/recipes/search-spoonacular/route.ts`
- [ ] `src/app/api/recipes/import-spoonacular/route.ts`
- [ ] `src/hooks/useSpoonacularSearch.ts`
- [ ] `src/components/recipe/SpoonacularImport.tsx`
- [ ] Environment Variables Setup
- [ ] Caching System
- [ ] Error Handling Integration

### Dependencies
- **Phase 1 Prerequisites**: 
  - ✅ Authentication System (Developer 1)
  - ✅ Database & API Foundation (Developer 5)
  - ⚠️ User Management System (Developer 2) - needed for user attribution
- **Phase 2 Prerequisites**:
  - Recipe CRUD Operations (must be completed first)
  - Recipe Display Components (for imported recipes)
  - Authentication System for user-specific imports
- **External Requirements**:
  - Spoonacular API Account & Key
  - UI Components für Recipe Display

## Testing

### API Testing
```bash
# Test Spoonacular connection
curl "https://api.spoonacular.com/recipes/complexSearch?apiKey=YOUR_API_KEY&query=pasta&number=2"
```

### Integration Tests
```typescript
// tests/spoonacular.test.ts
describe('Spoonacular Integration', () => {
  test('should search for recipes', async () => {
    // Test implementation
  });
  
  test('should import recipe to local database', async () => {
    // Test implementation
  });
});
```

---

**Status: 📋 DOKUMENTIERT - Bereit zur Implementierung**

**Phase 2 Assignment**: Diese Integration gehört zu Phase 2 (Core Recipe System) und sollte von **Developer 5** nach Abschluss der grundlegenden Grocery List Features implementiert werden.

**Implementation Timeline**: 
- **Woche 2**: Grundlegende Spoonacular Service Implementation
- **Ende Woche 2**: Recipe Import Functionality 
- **Woche 3**: Frontend Integration und UI Components (falls Phase 2 früh abgeschlossen)

Diese Dokumentation bietet eine vollständige Grundlage für die Spoonacular API Integration in SmartPlates. Die Implementation erweitert die Recipe-Funktionalität um externe Rezeptdaten und AI-basierte Vorschläge.
