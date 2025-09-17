# Search & Filter System

## Status: ✅ Completed

## Zuständig: Developer 2

## Beschreibung
Advanced Recipe Search und Filter System mit Performance-Optimierung.


## Technische Planung

### Ziel
- Schnelle, flexible Rezeptsuche mit Text und Filtern
- Filter für Kategorie, Allergien, Zubereitungszeit, "Quick & Easy"
- Echtzeit-Suche mit optimierter Performance

### Backend
- MongoDB Text Search (`$text`-Operator) für Volltextsuche
- Aggregation Pipeline für Filter (Kategorie, Allergien, Zeit)
- Indexe auf Suchfeldern für Performance
- API-Route: `src/app/api/recipes/search/route.ts`
	- Query-Parameter: `q` (Text), `category`, `allergies`, `time`, `quick`

### Frontend
- Suchfeld mit Live-Update (Debounce)
- Filter-Komponente (Dropdowns, Checkboxen)
- Ergebnis-Komponente mit Skeleton-Loading
- Anzeige von beliebten/Trend-Rezepten

### Performance
- MongoDB-Indexe für Text und Filter
- Debounced Search im Frontend
- Caching der Suchergebnisse (optional)

### Beispiel-API-Aufruf
```ts
GET /api/recipes/search?q=pasta&category=italian&allergies=gluten&time=30&quick=true
```

### Nächste Schritte
1. API-Route für Suche und Filter anlegen
2. Frontend-Suchfeld und Filter-Komponente erstellen
3. Ergebnis-Komponente implementieren
4. Performance und Caching ergänzen

## Technische Anforderungen
- Elasticsearch oder MongoDB Text Search
- Faceted Search
- Performance Optimization
- Real-time Search

## Dependencies
- Benötigt: 06-recipe-management

## Completion Criteria
✅ Such-/Filter-Funktion funktioniert
✅ Performance ist acceptable
✅ Filter sind intuitiv
