# SmartPlates Style Guide

## 📚 Übersicht

Willkommen zum offiziellen Style Guide von SmartPlates. Diese Dokumentation dient als zentrale Referenz für alle Design- und Entwicklungsentscheidungen und gewährleistet Konsistenz, Zugänglichkeit und Benutzerfreundlichkeit.

## 📖 Dokumentations-Struktur

### 🎨 [Design System](./design-system.md)
Vollständige Design System Dokumentation mit:
- **Farbsystem**: Primär-, Akzent- und semantische Farben
- **Typografie**: Schriftarten, Größen und responsive Skalierung
- **Spacing**: Abstände, Layout-Patterns und responsive Spacing
- **Komponenten-Styles**: Button-, Card- und Input-Patterns
- **Accessibility**: WCAG 2.1 AA Compliance Guidelines

### 🧩 [Component Patterns](./component-patterns.md) 
Detaillierte Dokumentation der selbst entwickelten Komponenten:
- **Layout Components**: Navbar, Footer, Sidebar
- **Card Components**: InfoCard, RecipeCard, ProfileCard
- **Form Components**: LoginForm, RecipeForm mit Validation
- **UI Components**: Custom Buttons, Inputs, Dropdowns
- **Custom Hooks**: useLocalStorage, useDebounce

## 🚀 Quick Start Guide

### Für Designer

1. **Farben verwenden**: Nutze das definierte Farbsystem aus [Design System](./design-system.md#farbsystem)
2. **Typography beachten**: Folge der responsive Typografie-Skala
3. **Spacing einhalten**: Verwende die 4px-basierte Spacing-Skala
4. **Accessibility prüfen**: Kontrastwerte und Touch-Targets validieren

### Für Entwickler

1. **Component Patterns studieren**: Siehe [Component Patterns](./component-patterns.md)
2. **cn Utility verwenden**: Für bedingte Klassen-Zusammenstellung
3. **Mobile-First entwickeln**: Beginne immer mit Mobile-Design
4. **TypeScript nutzen**: Vollständige Typisierung aller Components

## 🎯 Design Prinzipien

### 1. **Mobile-First**
- Beginne Design und Entwicklung mit 320px Breite
- Progressive Enhancement für größere Bildschirme
- Touch-optimierte Interaktionen

### 2. **Accessibility by Design**
- WCAG 2.1 AA Compliance als Standard
- Keyboard-Navigation in allen Komponenten
- Semantisches HTML und ARIA-Labels

### 3. **Konsistenz**
- Einheitliche Design Tokens
- Wiederverwendbare Component Patterns
- Standardisierte Naming Conventions

### 4. **Performance**
- Optimierte CSS mit TailwindCSS v4
- Component Memoization wo sinnvoll
- Progressive Loading und Code Splitting

## 🎨 Kern-Design-Elemente

### Farbpalette
```css
/* Primärfarben */
primary-500: #22c55e    /* Hauptgrün */
coral-500: #ff6b6b      /* Akzent Coral */

/* Neutrale Farben */
foreground: #0f172a     /* Haupttext (Light) */
background: #ffffff     /* Hintergrund (Light) */

/* Dark Mode */
foreground: #f8fafc     /* Haupttext (Dark) */
background: #0f172a     /* Hintergrund (Dark) */
```

### Typografie
```css
/* Font Stack */
font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;

/* Responsive Größen */
text-3xl sm:text-4xl md:text-5xl lg:text-6xl  /* Hero */
text-2xl sm:text-3xl md:text-4xl              /* Section Headers */
text-sm sm:text-base                          /* Body Text */
```

### Spacing
```css
/* Standard Patterns */
py-12 sm:py-16 md:py-20 lg:py-24    /* Section Padding */
px-4 sm:px-6 lg:px-8                /* Container Padding */
gap-4 sm:gap-6 lg:gap-8             /* Grid Gaps */
```

## 🧩 Haupt-Komponenten

### Buttons
```tsx
// Primary Button
<Button className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-3 rounded-lg">
  Primary Action
</Button>

// Secondary Button  
<Button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-6 py-3 rounded-lg">
  Secondary Action
</Button>
```

### Cards
```tsx
// Standard Card
<div className="bg-card rounded-lg shadow-md border border-border p-4 sm:p-6">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-foreground-muted">Card content</p>
</div>
```

### Forms
```tsx
// Form Field Pattern
<FormField label="Field Label" required error={error}>
  <TextInput 
    value={value}
    onChange={onChange}
    placeholder="Enter value"
  />
</FormField>
```

## 📱 Responsive Guidelines

### Breakpoints
- **Mobile**: 0-639px (Primärer Focus)
- **Small Tablet**: 640-767px 
- **Tablet**: 768-1023px
- **Desktop**: 1024px+

### Touch Targets
- **Minimum**: 44px (WCAG AA)
- **Recommended**: 48px Mobile, 56px Desktop
- **Implementation**: `min-h-[48px] sm:min-h-[56px]`

### Typography Scaling
- Start mit kleinster sinnvoller Größe auf Mobile
- Stufe weise Vergrößerung bei größeren Bildschirmen
- Immer Line-Height für Lesbarkeit beachten

## ♿ Accessibility Checkliste

### Must-Have
- [ ] Semantisches HTML verwenden
- [ ] ARIA-Labels für alle interaktiven Elemente
- [ ] Keyboard-Navigation funktional
- [ ] 4.5:1 Farbkontrast für Text
- [ ] 48px+ Touch-Targets auf Mobile

### Recommended
- [ ] Focus-Indikatoren sichtbar
- [ ] Screen Reader Testing
- [ ] High Contrast Mode Unterstützung
- [ ] Reduced Motion Preferences respektieren

## 🔧 Entwicklungs-Workflow

### 1. Component Creation
```bash
# 1. Create component file
touch src/components/category/ComponentName.tsx

# 2. Follow naming conventions
- PascalCase für Components
- camelCase für Props
- kebab-case für CSS-Klassen
```

### 2. Styling Pattern
```tsx
// 1. Import cn utility
import { cn } from '@/lib/utils';

// 2. Use compound classes
className={cn(
  "base-classes",
  "responsive-classes sm:enhanced-classes",
  variant === 'primary' && "variant-classes",
  className
)}
```

### 3. TypeScript Integration
```tsx
// Interface definition
interface ComponentProps {
  title: string;
  optional?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Props destructuring with spread
export default function Component({
  title,
  optional = false,
  className,
  children,
  ...props
}: ComponentProps) {
  // Component implementation
}
```

## 📋 Code Review Checkliste

### Design System Compliance
- [ ] Korrekte Farben aus Design System verwendet
- [ ] Responsive Typography-Skala befolgt
- [ ] Spacing-System korrekt angewendet
- [ ] Component Patterns eingehalten

### Accessibility
- [ ] Semantic HTML verwendet
- [ ] ARIA-Attribute korrekt gesetzt
- [ ] Keyboard-Navigation getestet
- [ ] Touch-Targets ausreichend groß

### Performance
- [ ] Unnecessary re-renders vermieden
- [ ] useCallback/useMemo wo angebracht
- [ ] Bundle-Size impact geprüft
- [ ] CSS-Klassen optimiert

### Code Quality
- [ ] TypeScript Typen vollständig
- [ ] Error-Handling implementiert
- [ ] Loading-States berücksichtigt
- [ ] Edge Cases abgedeckt

## 🎯 Testing Strategy

### Visual Testing
- Cross-browser Testing (Chrome, Firefox, Safari)
- Responsive Testing (Mobile, Tablet, Desktop)
- Dark/Light Mode Validation

### Accessibility Testing
- Keyboard-only Navigation
- Screen Reader Testing (VoiceOver, NVDA)
- Color Contrast Validation
- Touch Target Size Verification

### Performance Testing
- Bundle Size Analysis
- Runtime Performance Profiling
- Lighthouse Audits

## 📞 Support & Kontakt

### Fragen zum Design System
- Dokumentation: [Design System](./design-system.md)
- Issues: GitHub Issues mit Label "design-system"

### Fragen zu Component Patterns  
- Dokumentation: [Component Patterns](./component-patterns.md)
- Issues: GitHub Issues mit Label "components"

### Allgemeine Fragen
- Project Maintainer: Siehe CONTRIBUTING.md
- Slack Channel: #smartplates-design (falls verfügbar)

---

**Version**: 1.0.0  
**Letzte Aktualisierung**: September 2025  
**Status**: ✅ Aktiv

Dieses Style Guide ist ein lebendes Dokument und wird kontinuierlich mit neuen Patterns und Best Practices erweitert.
