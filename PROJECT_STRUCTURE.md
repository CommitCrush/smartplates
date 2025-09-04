# SmartPlates Project Structure

## Aktuelle Verzeichnisstruktur

```
smartplates/
├── .github/                 # GitHub Konfiguration
│   └── copilot-instructions.md
├── docs/                    # Projektdokumentation
│   └── README.md
├── features/                # Feature-Tracking
│   └── README.md
├── tests/                   # Test Suite
│   ├── __tests__/
│   ├── e2e/
│   ├── __mocks__/
│   └── README.md
├── public/                  # Statische Assets
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                     # Hauptquellcode
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.module.css
│   │   ├── page.tsx
│   │   ├── (admin)/         # Admin Routen (Route Group)
│   │   │   └── admin/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── dashboard/
│   │   │       │   ├── manage_cookware_commissions/
│   │   │       │   ├── manage-recipes/
│   │   │       │   ├── manage-users/
│   │   │       │   └── statistics/
│   │   │       └── settings/
│   │   ├── (public)/        # Öffentliche Routen (Route Group)
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── cookware/
│   │   │   ├── login/
│   │   │   ├── recipe/
│   │   │   └── register/
│   │   ├── (user)/          # User Routen (Route Group)
│   │   │   └── user/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── dashboard/
│   │   │       │   ├── ai_feature/
│   │   │       │   ├── cookware/
│   │   │       │   ├── my_added_recipes/
│   │   │       │   ├── my_meal_plan/
│   │   │       │   └── my_saved_meal_plan/
│   │   │       └── profile/
│   │   └── api/             # API Routen
│   │       ├── admin/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   ├── logout/
│   │       │   └── register/
│   │       ├── recipes/
│   │       │   └── [id]/
│   │       └── users/
│   │           └── [id]/
│   ├── components/          # React Komponenten
│   │   ├── cards/
│   │   │   ├── InfoCard.tsx
│   │   │   └── ProfileCard.tsx
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RecipeForm.tsx
│   │   │   ├── registerForm.tsx
│   │   │   └── SettingsForm.tsx
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── profile_sidebar/
│   │   ├── manage_cookware_commisions/
│   │   ├── manage_recipes/
│   │   ├── manage_users/
│   │   ├── my_added_recipes/
│   │   ├── my_meal_plan/
│   │   ├── profile/
│   │   ├── recipe/
│   │   │   ├── Filter.tsx
│   │   │   └── RecipeCard.tsx
│   │   ├── settings/
│   │   │   ├── notifications.tsx
│   │   │   └── settings.tsx
│   │   └── ui/              # shadcn/ui Komponenten
│   │       ├── Buttons.tsx
│   │       ├── Dropdowns.tsx
│   │       ├── Inputs.tsx
│   │       └── Modals.tsx
│   ├── context/             # React Context
│   │   └── authContext.tsx
│   ├── lib/                 # Utilities und Datenbank
│   │   ├── auth.ts
│   │   └── db.ts
│   ├── middleware/          # Next.js Middleware
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/              # Datenbank Modelle
│   │   ├── Category.ts
│   │   ├── Recipe.ts
│   │   └── User.ts
│   ├── services/            # Externe Services
│   │   ├── emailService.ts
│   │   ├── recipeService.ts
│   │   └── userService.ts
│   ├── styles/              # Style Konfiguration
│   │   └── config/
│   │       └── constants.ts
│   ├── types/               # TypeScript Definitionen
│   │   ├── card.d.ts
│   │   ├── recipe.d.ts
│   │   ├── settings.d.ts
│   │   └── user.d.ts
│   ├── utils/               # Utility Funktionen
│   │   ├── formatDate.ts
│   │   ├── generateToken.ts
│   │   ├── logger.ts
│   │   └── validators.ts
│   ├── config/              # Konfigurationsdateien
│   ├── hooks/               # Custom React Hooks
│   └── ai/                  # AI Integration (Google Cloud Vision)
├── bun.lock
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── README.md
└── FEATURE_ROADMAP.md
```

## Verzeichnis Beschreibungen

### Neue Struktur Hinzugefügt

- **`docs/`** - Projektdokumentation und Implementierungsrichtlinien
- **`features/`** - Feature-spezifisches Tracking und Status
- **`tests/`** - Komplette Test Suite (Unit, Integration, E2E)
- **`src/config/`** - Zentrale Konfigurationsdateien
- **`src/hooks/`** - Custom React Hooks
- **`src/ai/`** - Google Cloud Vision AI Integration

### Existierende Struktur

- **`.github/`** - GitHub spezifische Konfiguration und Copilot Instructions
- **`src/app/`** - Next.js 14 App Router Seiten mit Route Groups
- **`src/components/`** - Wiederverwendbare React Komponenten
- **`src/lib/`** - Utilities, Datenbank-Verbindungen
- **`src/types/`** - TypeScript Interface Definitionen
- **`src/middleware/`** - Next.js Middleware für Auth, Error Handling
- **`src/models/`** - MongoDB Datenmodelle
- **`src/services/`** - Integration mit externen Services

## Route Groups Erklärung

Das Projekt nutzt Next.js App Router Route Groups:

- **`(admin)/`** - Admin-spezifische Routen, erreichbar unter `/admin/*`
- **`(public)/`** - Öffentlich zugängliche Seiten ohne Auth-Requirement
- **`(user)/`** - Authentifizierte User-Bereiche unter `/user/*`

Diese Gruppierung ermöglicht:
- Unterschiedliche Layouts pro Bereich
- Spezifische Middleware pro Route Group
- Bessere Code-Organisation nach User-Rollen

## Next Steps

1. **Setup der Entwicklungsumgebung** (siehe `docs/setup-guide.md`)
2. **Team-Zuweisung** basierend auf `FEATURE_ROADMAP.md`
3. **Implementierung in Phasen** wie in Features dokumentiert
4. **Regelmäßige Updates** der Dokumentation während Entwicklung
