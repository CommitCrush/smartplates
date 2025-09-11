# SmartPlates Design System

## Überblick

Das SmartPlates Design System ist ein umfassendes, zugängliches und konsistentes Design-Framework, das auf TailwindCSS v4 basiert und eine professionelle Benutzeroberfläche für die Meal-Planning-Plattform bietet.

## 🎨 Farbsystem

### Primärfarben

Das SmartPlates Farbschema verwendet ein duales Farbsystem mit Grün als Primärfarbe und Coral als Akzentfarbe.

#### Primär (Grün) - `primary-*`
```css
primary-50:  #f0fdf4    /* Sehr helles Grün */
primary-100: #dcfce7    /* Helles Grün */
primary-200: #bbf7d0    /* Mittelhelles Grün */
primary-300: #86efac    /* Mittelgrün */
primary-400: #4ade80    /* Lebendiges Grün */
primary-500: #22c55e    /* Standard Grün (Hauptfarbe) */
primary-600: #16a34a    /* Dunkles Grün */
primary-700: #15803d    /* Sehr dunkles Grün */
primary-800: #166534    /* Dunkelgrün */
primary-900: #14532d    /* Sehr dunkelgrün */
```

**Verwendung:**
- Hauptnavigation und Links
- Call-to-Action Buttons
- Interaktive Elemente
- Erfolgs-Indikatoren

#### Akzent (Coral) - `coral-*`
```css
coral-50:  #fef2f2     /* Sehr helles Coral */
coral-100: #fee2e2     /* Helles Coral */
coral-200: #fecaca     /* Mittelhelles Coral */
coral-300: #fca5a5     /* Mittel Coral */
coral-400: #f87171     /* Lebendiges Coral */
coral-500: #ff6b6b     /* Standard Coral (Hauptfarbe) */
coral-600: #dc2626     /* Dunkles Coral */
coral-700: #b91c1c     /* Sehr dunkles Coral */
coral-800: #991b1b     /* Dunkel Coral */
coral-900: #7f1d1d     /* Sehr dunkel Coral */
```

**Verwendung:**
- Sekundäre Call-to-Action Buttons
- Highlight-Elemente
- Wichtige Benachrichtigungen
- Hover-Zustände

### Neutralfarben

#### Graustufen - `neutral-*`
```css
neutral-50:  #fafafa   /* Sehr helles Grau */
neutral-100: #f5f5f5   /* Helles Grau */
neutral-200: #e5e5e5   /* Mittelhelles Grau */
neutral-300: #d4d4d4   /* Mittelgrau */
neutral-400: #a3a3a3   /* Dunkleres Mittelgrau */
neutral-500: #737373   /* Standardgrau */
neutral-600: #525252   /* Dunkles Grau */
neutral-700: #404040   /* Sehr dunkles Grau */
neutral-800: #262626   /* Dunkelgrau */
neutral-900: #171717   /* Sehr dunkelgrau */
```

### Semantische Farben

#### Light Mode Farben
```css
/* Hintergründe */
background: white                    /* Haupthintergrund */
background-secondary: #f8fafc       /* Sekundärer Hintergrund */
background-card: white              /* Karten-Hintergrund */

/* Text */
foreground: #0f172a                 /* Haupttext */
foreground-muted: #64748b           /* Gedämpfter Text */
foreground-subtle: #94a3b8          /* Subtiler Text */
foreground-inverse: white           /* Inverser Text */

/* Ränder */
border: #e2e8f0                     /* Standard Rand */
border-muted: #f1f5f9              /* Gedämpfter Rand */
```

#### Dark Mode Farben
```css
/* Hintergründe */
background: #0f172a                 /* Haupthintergrund */
background-secondary: #1e293b       /* Sekundärer Hintergrund */
background-card: #334155            /* Karten-Hintergrund */

/* Text */
foreground: #f8fafc                 /* Haupttext */
foreground-muted: #cbd5e1           /* Gedämpfter Text */
foreground-subtle: #94a3b8          /* Subtiler Text */
foreground-inverse: #0f172a         /* Inverser Text */

/* Ränder */
border: #475569                     /* Standard Rand */
border-muted: #334155               /* Gedämpfter Rand */
```

### Zusätzliche Systemfarben

```css
/* Erfolg */
success: #22c55e
success-muted: #dcfce7

/* Warnung */
warning: #f59e0b
warning-muted: #fef3c7

/* Fehler */
error: #ef4444
error-muted: #fee2e2

/* Information */
info: #3b82f6
info-muted: #dbeafe
```

## 📝 Typografie

### Schriftarten

```css
/* Primäre Schriftart */
font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace für Code */
font-mono: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
```

### Typografie-Skala

#### Text-Größen (Mobile-First)
```css
/* Überschriften */
text-xs:    12px / 16px     /* Sehr kleine Labels */
text-sm:    14px / 20px     /* Mobile Body Text */
text-base:  16px / 24px     /* Standard Body Text */
text-lg:    18px / 28px     /* Große Body Text / Mobile H3 */
text-xl:    20px / 28px     /* Mobile H2 */
text-2xl:   24px / 32px     /* Mobile H1 */
text-3xl:   30px / 36px     /* Tablet H1 */
text-4xl:   36px / 40px     /* Desktop H1 */
text-5xl:   48px / 1        /* Große Überschriften */
text-6xl:   60px / 1        /* Hero Überschriften */
```

#### Responsive Typografie-Patterns
```css
/* Hero Überschrift */
class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"

/* Sektion Überschrift */
class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"

/* Komponenten Überschrift */
class="text-lg sm:text-xl md:text-2xl"

/* Body Text */
class="text-sm sm:text-base md:text-lg"

/* Kleine Labels */
class="text-xs sm:text-sm"
```

### Zeilenhöhen

```css
leading-none:     1.0        /* Kompakte Überschriften */
leading-tight:    1.25       /* Mobile Überschriften */
leading-snug:     1.375      /* Optimierte Lesbarkeit */
leading-normal:   1.5        /* Standard Body Text */
leading-relaxed:  1.625      /* Entspannter Text */
leading-loose:    2.0        /* Sehr entspannter Text */
```

### Schriftgewichte

```css
font-light:       300        /* Helle Texte */
font-normal:      400        /* Standard Body Text */
font-medium:      500        /* Mittlere Betonung */
font-semibold:    600        /* Starke Betonung */
font-bold:        700        /* Überschriften */
font-extrabold:   800        /* Starke Überschriften */
```

## 📐 Spacing & Layout

### Spacing-Skala (Design Tokens)

```css
/* Basis: 4px (0.25rem) */
space-0:    0px       /* Kein Abstand */
space-1:    4px       /* Sehr kleiner Abstand */
space-2:    8px       /* Kleiner Abstand */
space-3:    12px      /* Kleiner-mittlerer Abstand */
space-4:    16px      /* Standard Abstand */
space-6:    24px      /* Mittlerer Abstand */
space-8:    32px      /* Größerer Abstand */
space-12:   48px      /* Großer Abstand */
space-16:   64px      /* Sehr großer Abstand */
space-20:   80px      /* Extra großer Abstand */
space-24:   96px      /* Sektions-Abstand */
```

### Responsive Spacing Patterns

```css
/* Sektions Padding */
py-12 sm:py-16 md:py-20 lg:py-24

/* Container Padding */
px-4 sm:px-6 lg:px-8

/* Element Margins */
mb-3 sm:mb-4 md:mb-6

/* Grid Gaps */
gap-4 sm:gap-6 lg:gap-8
```

### Border Radius

```css
rounded-none:     0px         /* Keine Rundung */
rounded-sm:       2px         /* Kleine Rundung */
rounded-md:       6px         /* Mittlere Rundung (Standard) */
rounded-lg:       8px         /* Große Rundung */
rounded-xl:       12px        /* Extra große Rundung */
rounded-2xl:      16px        /* Sehr große Rundung */
rounded-3xl:      24px        /* Maximale Rundung */
rounded-full:     9999px      /* Vollständige Rundung */
```

### Schatten

```css
/* Shadow Scale */
shadow-sm:    0 1px 2px rgba(0, 0, 0, 0.05)
shadow-md:    0 4px 6px rgba(0, 0, 0, 0.07)
shadow-lg:    0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl:    0 20px 25px rgba(0, 0, 0, 0.1)
shadow-2xl:   0 25px 50px rgba(0, 0, 0, 0.25)

/* Navbar Shadow */
shadow-navbar: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)
```

## 🔲 Komponenten-Patterns

### Button Patterns

#### Primary Button
```css
bg-coral-500 hover:bg-coral-600 text-white
px-6 py-3 sm:px-8 sm:py-4
min-h-[48px] sm:min-h-[56px]
rounded-lg font-semibold
focus:outline-none focus:ring-2 focus:ring-coral-300
transition-all duration-200
```

#### Secondary Button
```css
bg-transparent border-2 border-primary-600 text-primary-600
hover:bg-primary-600 hover:text-white
px-6 py-3 sm:px-8 sm:py-4
min-h-[48px] sm:min-h-[56px]
rounded-lg font-semibold
focus:outline-none focus:ring-2 focus:ring-primary-600/30
transition-all duration-200
```

#### Ghost Button
```css
bg-transparent text-foreground
hover:bg-neutral-100 dark:hover:bg-neutral-800
px-4 py-2 rounded-md
focus:outline-none focus:ring-2 focus:ring-primary-500
transition-colors duration-200
```

### Card Patterns

#### Standard Card
```css
bg-card rounded-lg shadow-md border border-border
p-4 sm:p-6
hover:shadow-lg transition-shadow duration-300
```

#### Interactive Card
```css
bg-card rounded-lg shadow-md border border-border
p-4 sm:p-6
hover:shadow-lg hover:scale-102
transition-all duration-300
cursor-pointer
```

### Input Patterns

#### Text Input
```css
w-full px-3 py-2 sm:px-4 sm:py-3
border border-border rounded-md
bg-background text-foreground
focus:outline-none focus:ring-2 focus:ring-primary-500
focus:border-primary-500
transition-colors duration-200
```

#### Label
```css
block text-sm font-medium text-foreground
mb-1 sm:mb-2
```

### Navigation Patterns

#### Navigation Link
```css
text-foreground hover:text-coral-500
hover:bg-neutral-100 dark:hover:bg-neutral-800
px-3 py-2 rounded-md text-sm font-medium
transition-colors duration-200
focus:outline-none focus:ring-2 focus:ring-primary-500
```

#### Mobile Navigation Link
```css
text-foreground hover:text-coral-500
hover:bg-neutral-100 dark:hover:bg-neutral-800
block px-3 py-2 rounded-md text-base font-medium
transition-colors duration-200
focus:outline-none focus:ring-2 focus:ring-primary-500
```

## 📱 Responsive Design

### Breakpoint System

```css
/* Mobile First Approach */
mobile: '0px',        /* 0-639px    - Primäre Mobile-Geräte */
sm: '640px',          /* 640-767px  - Große Mobile/kleine Tablets */
md: '768px',          /* 768-1023px - Tablet Querformat */
lg: '1024px',         /* 1024-1279px - Kleine Desktops */
xl: '1280px',         /* 1280-1535px - Große Desktops */
2xl: '1536px'         /* 1536px+    - Extra große Bildschirme */
```

### Responsive Grid Patterns

```css
/* Content Cards */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

/* Feature Cards */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

/* Complex Layouts */
grid-cols-1 md:grid-cols-2 xl:grid-cols-3
```

### Container Patterns

```css
/* Standard Container */
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

/* Content Container */
max-w-4xl mx-auto px-4 sm:px-6

/* Text Container */
max-w-2xl mx-auto px-4
```

## ♿ Accessibility (WCAG 2.1 AA)

### Touch Targets

```css
/* Minimum Touch Target Sizes */
min-h-[44px]                    /* WCAG Minimum */
min-h-[48px]                    /* Empfohlen Mobile */
min-h-[48px] sm:min-h-[56px]    /* Progressive Enhancement */
```

### Focus States

```css
/* Standard Focus Ring */
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2

/* Button Focus */
focus:outline-none focus:ring-4 focus:ring-primary-600/30

/* High Contrast Focus */
focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
```

### Color Contrast

- **Text auf Hintergrund**: Mindestens 4.5:1 Kontrast
- **Große Texte**: Mindestens 3:1 Kontrast
- **Interactive Elements**: Mindestens 3:1 Kontrast zu benachbarten Farben

### ARIA Labels

```tsx
/* Button Labels */
aria-label="Beschreibende Aktion"

/* Section Labels */
aria-label="Bereich Beschreibung"

/* State Indicators */
aria-pressed={boolean}
aria-expanded={boolean}
```

## 🎭 Animation & Transitions

### Standard Transitions

```css
/* Farb-Übergänge */
transition-colors duration-200

/* Alle Eigenschaften */
transition-all duration-200

/* Schatten */
transition-shadow duration-300

/* Transform */
transition-transform duration-300
```

### Hover Effects

```css
/* Subtle Scale */
hover:scale-102

/* Shadow Enhancement */
hover:shadow-lg

/* Color Changes */
hover:bg-primary-600 hover:text-white
```

### Animation Preferences

```css
/* Respektiert Benutzer-Präferenzen */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 🛠️ Utility Classes

### Custom Utilities

```css
/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Touch Manipulation */
.touch-manipulation {
  touch-action: manipulation;
}

/* Text Clamp */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
```

### Navbar Specific

```css
/* Navbar Background */
.navbar-bg {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dark .navbar-bg {
  background: rgba(15, 23, 42, 0.95);
}
```

## 📋 Implementierungs-Richtlinien

### CSS Custom Properties Verwendung

Alle Farben werden als CSS Custom Properties definiert und in TailwindCSS v4 konfiguriert:

```css
:root {
  --color-primary-500: 34 197 94;
  --color-coral-500: 255 107 107;
  --color-foreground: 15 23 42;
}

.dark {
  --color-foreground: 248 250 252;
}
```

### Komponenten-Entwicklung

1. **Mobile-First**: Beginne immer mit Mobile-Design
2. **Progressive Enhancement**: Füge Features für größere Bildschirme hinzu
3. **Accessibility**: Integriere WCAG 2.1 AA von Anfang an
4. **Konsistenz**: Verwende etablierte Patterns und Design Tokens

### Code-Stil

```tsx
// Verwende cn Utility für bedingte Klassen
className={cn(
  "base-classes",
  "responsive-classes sm:enhanced-classes",
  conditionalClasses && "conditional-classes",
  className
)}
```

## 🔍 Testing & Validierung

### Accessibility Testing

- **Keyboard Navigation**: Tab-Order und Funktionalität testen
- **Screen Reader**: VoiceOver/NVDA Kompatibilität prüfen
- **Color Contrast**: WCAG Kontrast-Verhältnisse validieren
- **Touch Targets**: Mindestgrößen auf mobilen Geräten testen

### Cross-Browser Testing

- **Chrome**: Primärer Browser für Entwicklung
- **Firefox**: Alternative Engine Testing
- **Safari**: iOS/macOS Kompatibilität
- **Edge**: Windows Kompatibilität

### Responsive Testing

- **Mobile**: iPhone SE (375px), iPhone 14 (390px)
- **Tablet**: iPad (768px), iPad Pro (1024px)
- **Desktop**: 1280px, 1920px, 2560px

---

Dieses Design System gewährleistet eine konsistente, zugängliche und professionelle Benutzeroberfläche für die SmartPlates-Plattform und dient als zentrale Referenz für alle Design- und Entwicklungsentscheidungen.
