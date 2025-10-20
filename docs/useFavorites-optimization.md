# useFavorites Hook Optimization

## Problem

Der ursprüngliche `useFavorites` Hook hatte mehrere Performanceprobleme:

1. Übermäßige API-Aufrufe bei jeder Komponenten-Montage oder Auth-Status-Änderung
2. Keine Client-seitige Zwischenspeicherung, was zu unnötiger Netzwerkbelastung führte
3. Keine Optimierung für wiederholte `refetch`-Aufrufe, die alle direkt API-Anfragen auslösten
4. Keine optimistische UI-Updates, was zu einer verzögerten Benutzererfahrung führte

Diese Probleme führten zu einer übermäßigen Anzahl von Datenbankverbindungen und einer langsameren Benutzeroberfläche.

## Implementierte Lösungen

### 1. Client-Side Caching mit localStorage

```typescript
// Konstanten für Cache-Verwaltung
const FAVORITES_CACHE_KEY = 'smartplates-favorites-cache';
const FAVORITES_CACHE_TIMESTAMP = 'smartplates-favorites-timestamp';
const CACHE_TTL = 5 * 60 * 1000; // 5 Minuten in Millisekunden
```

Die Lieblingsdaten werden nun im localStorage mit einem Zeitstempel gespeichert. Dies ermöglicht:
- Schnelles Laden beim ersten Rendern
- Vermeidung unnötiger API-Anfragen bei Seitenaktualisierungen
- Einstellbare TTL (Time-To-Live) für die Cache-Gültigkeit

### 2. Debouncing von API-Anfragen

```typescript
const debouncedFetch = useCallback((force: boolean = false) => {
  if (fetchTimer.current) {
    clearTimeout(fetchTimer.current);
  }
  
  fetchTimer.current = setTimeout(() => {
    fetchFavorites(force);
    fetchTimer.current = null;
  }, 300);
}, [fetchFavorites]);
```

Verhindert mehrere schnell aufeinanderfolgende API-Anfragen durch Zusammenfassung in eine einzige, verzögerte Anfrage.

### 3. Optimistische UI-Updates

Bei Änderungen wird die UI sofort aktualisiert, bevor die Serverantwort eintrifft:

```typescript
// Optimistische UI-Aktualisierung
if (isFavorite) {
  // Aus Favoriten entfernen (optimistisch)
  setFavorites(prev => prev.filter(fav => fav.recipeId !== recipeId));
} else {
  // Zu Favoriten hinzufügen (optimistisch)
  const optimisticFavorite = {
    _id: `temp-${Date.now()}`, // Temporäre ID
    userId: '',
    recipeId,
    recipeTitle,
    recipeImage: recipeImage || '/placeholder-recipe.svg',
    createdAt: new Date().toISOString()
  };
  setFavorites(prev => [...prev, optimisticFavorite]);
}
```

### 4. Intelligente Refetch-Logik

```typescript
const refetch = useCallback((force: boolean = false) => {
  // Überspringe unnötige Abrufe, wenn die Daten aktuell sind
  if (!force && 
      lastFetched && 
      (Date.now() - lastFetched < CACHE_TTL) && 
      pendingToggles.current.size === 0 && 
      favorites.length > 0) {
    return;
  }
  
  debouncedFetch(force);
}, [lastFetched, favorites.length, debouncedFetch]);
```

Die `refetch`-Funktion lädt Daten nur neu, wenn:
- Ein Neuabruf explizit erzwungen wird
- Der Cache abgelaufen ist
- Ausstehende Aktualisierungen vorhanden sind
- Noch keine Daten geladen wurden

### 5. Tracking ausstehender Änderungen

```typescript
const pendingToggles = useRef<Set<string>>(new Set());
```

Verfolgt Rezepte, die gerade aktualisiert werden, um sicherzustellen, dass alle Änderungen synchronisiert werden.

## Vorteile

1. **Reduzierte API-Aufrufe**: Von einem API-Aufruf pro Komponentenmontage auf höchstens einen alle 5 Minuten (konfigurierbar)
2. **Verbesserte Benutzerfreundlichkeit**: Sofortige UI-Updates ohne auf Serverantworten warten zu müssen
3. **Geringere Serverbelastung**: Weniger Datenbankverbindungen und -abfragen
4. **Schnelleres UI-Rendering**: Keine Verzögerung beim Rendern von Favoriten-Status

## Verwendung

Die Verwendung des Hooks bleibt unverändert:

```tsx
const { favorites, loading, toggleFavorite, isFavorited, refetch } = useFavorites();
```

Der Hook bietet dieselbe API wie zuvor, ist aber jetzt wesentlich effizienter.