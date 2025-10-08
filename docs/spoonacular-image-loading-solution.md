# Spoonacular Image Loading Strategy

## Problem gelöst ✅

Die 429-Fehler von Spoonacular wurden behoben durch eine **hybride Image-Loading-Strategie**:

## Lösung

### 1. **Next.js Image Component** (Optimiert)
- Für **lokale Bilder** und **vertrauenswürdige Domains**
- Automatische Optimierung, WebP-Konvertierung, Lazy Loading
- Verwendet für: Cloudinary, Unsplash, lokale Assets

### 2. **Direct HTML `<img>` Tag** (Spoonacular)
- Für **Spoonacular URLs** um 429-Fehler zu vermeiden
- Direkter Zugriff ohne Next.js Image Proxy
- Manuelles Lazy Loading implementiert

## Implementierte Komponenten

### ✅ `RecipeCard.tsx`
```tsx
function getRecipeImage(url) {
  if (url.includes('spoonacular.com')) {
    return { src: url, useNextImage: false }; // Direct loading
  }
  return { src: url, useNextImage: true }; // Next.js optimization
}
```

### ✅ `RecipeHeader.tsx`
- Gleiche hybride Strategie
- Für Recipe Detail Pages

### ✅ `RecipeSearchFilter.tsx`
- Hybride Image-Loading
- Für Suchresultate

### ✅ `next.config.ts`
```typescript
// Spoonacular domains ENTFERNT aus images.domains
// Verhindert Next.js Image Proxy für Spoonacular URLs
domains: [
  // 'img.spoonacular.com', // REMOVED
  'images.unsplash.com',
  'res.cloudinary.com'
]
```

## Resultat

- ✅ **Keine 429-Fehler mehr**
- ✅ **Spoonacular-Bilder werden angezeigt**
- ✅ **Optimierung für andere Bilder bleibt erhalten**
- ✅ **Performance-optimiert durch selective loading**

## Next.js Warnings

Die `Using <img> could result in slower LCP` Warnung ist **ERWÜNSCHT** und **NOTWENDIG**:
- Nur für Spoonacular URLs
- Verhindert 429 Rate Limit Errors
- Performance-Trade-off zugunsten der Funktionalität

## Monitoring

Überwachen Sie die Konsole auf:
- ✅ Keine 429-Fehler mehr
- ✅ Erfolgreiche Bild-Ladevorgänge
- ✅ Normale API-Response-Zeiten