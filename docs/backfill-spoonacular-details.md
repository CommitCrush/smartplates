# Backfill Spoonacular Details (extendedIngredients, analyzedInstructions, cuisines)

Dieses Skript füllt fehlende Felder für bereits gespeicherte Spoonacular-Rezepte in MongoDB nach.

## Was wird gefüllt
- extendedIngredients
- analyzedInstructions
- cuisines
- Zusätzlich werden dishTypes, diets, summary, readyInMinutes, servings, image, nutrition aktualisiert.

## Wo liegt das Skript
- `scripts/backfill-spoonacular-details.ts`

## Voraussetzungen
- Gültiger Spoonacular API Key in `.env`:
  - `SPOONACULAR_API_KEY=...`
- Externe API erlaubt:
  - `SPOONACULAR_ENABLED=true`

Optional (zur besseren Steuerung):
- `BACKFILL_BATCH_SIZE` (default: 50) – Anzahl Rezepte pro Durchlaufschritt
- `BACKFILL_SLEEP_MS` (default: 1200) – Pause zwischen API-Calls in Millisekunden
- `BACKFILL_MAX_RECIPES` – Gesamtlimit für einen Lauf
- `SPOONACULAR_DAILY_QUOTA` – Falls dein Tarif weniger als 150 Requests/Tag erlaubt (z. B. 50), setze diesen Wert, um Quota-Checks realistisch zu halten (wenn konfiguriert)

## Ausführen

```bash
# Beispiel: vorsichtig mit kleinem Batch und Gesamtlimit
BACKFILL_BATCH_SIZE=25 BACKFILL_MAX_RECIPES=100 BACKFILL_SLEEP_MS=1500 bun run backfill:spoonacular
```

Hinweise:
- Das Skript verarbeitet nur Rezepte, bei denen die Felder fehlen/leer sind.
- Quota-Fehler (402) werden geloggt; reduziere Batch-Größe oder erhöhe die Pause, und starte den Backfill am nächsten Tag erneut.
- Das Skript nutzt den Cache-/Quota-aware Weg über `getSpoonacularRecipe`, um API-Aufrufe zu minimieren.

## Verifizieren
- In der App: Suche/öffne die betroffenen Rezepte – die Felder sollten angezeigt werden.
- In MongoDB (Compass oder Shell): Prüfe, dass `extendedIngredients`, `analyzedInstructions`, `cuisines` gefüllt sind.

Beispiel für einen schnellen Check (MongoDB Shell):
```js
// Anzahl Rezepte mit fehlenden Feldern
db.spoonacular_recipes.countDocuments({
  $or: [
    { extendedIngredients: { $exists: false } },
    { extendedIngredients: { $size: 0 } },
    { analyzedInstructions: { $exists: false } },
    { analyzedInstructions: { $size: 0 } },
    { cuisines: { $exists: false } },
    { cuisines: { $size: 0 } },
  ]
})
```

## Tipps
- Führe den Backfill in mehreren kleinen Läufen aus, um die Tages-Quota nicht auszureizen.
- Wähle stabile Filter beim initialen Befüllen des Caches, damit viele IDs später schon im Cache sind.
- Falls dein Tarif nur 50 Requests/Tag erlaubt, plane den Backfill über mehrere Tage.
