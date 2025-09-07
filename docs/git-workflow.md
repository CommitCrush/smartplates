# Git Workflow - SmartPlates

## Übersicht

Dieses Dokument beschreibt die Git-Branching-Strategie und den Development Workflow für das SmartPlates-Projekt.

## Branch-Struktur

### Hauptbranches

#### `main` Branch
- **Zweck**: Nur production-ready Code
- **Schutz**: Geschützter Branch - keine direkten Commits erlaubt
- **Deployment**: Automatisches Deployment nach Vercel bei Push
- **Merge**: Nur über Pull Request mit Admin-Approval

#### `dev` Branch  
- **Zweck**: Aktiver Entwicklungs-Branch
- **Basis**: Alle Feature-Branches zweigen von `dev` ab
- **Integration**: Alle Features werden zuerst in `dev` integriert
- **Testing**: Kontinuierliche Integration und Testing

### Feature Branches

#### Naming Convention
```
feature/feature-name     # Neue Features
bugfix/issue-description # Bug Fixes
hotfix/critical-fix      # Kritische Produktions-Fixes
```

#### Beispiele
- `feature/meal-planning`
- `feature/recipe-search`
- `bugfix/login-validation`
- `hotfix/security-patch`

## Development Workflow

### 1. Neues Feature starten

```bash
# Zum dev branch wechseln
git checkout dev

# Latest changes holen
git pull origin dev

# Neuen Feature Branch erstellen
git checkout -b feature/your-feature-name
```

### 2. Während der Entwicklung

```bash
# Regelmäßige Commits
git add .
git commit -m "feat: implement user authentication"

# Feature Branch pushen
git push origin feature/your-feature-name

# Regelmäßig mit dev synchronisieren
git pull origin dev
```

### 3. Feature abschließen

1. **Pull Request erstellen**
   - Von `feature/your-feature-name` → `dev`
   - Beschreibung der Änderungen
   - Screenshots bei UI-Änderungen

2. **Code Review**
   - Mindestens ein Team-Mitglied muss reviewen
   - Alle Kommentare müssen aufgelöst werden
   - CI-Tests müssen grün sein

3. **Merge**
   - Nach Approval: Merge in `dev`
   - Feature Branch löschen

### 4. Production Release

```bash
# Von dev zu main
# Nur für finale, getestete Releases
# Requires Admin approval
```

## Team Guidelines

### Commit Messages

Wir verwenden Conventional Commits:

```
feat: neue Funktion hinzufügen
fix: Bug beheben
docs: Dokumentation aktualisieren
style: Code-Formatierung (ohne Logik-Änderung)
refactor: Code-Refactoring
test: Tests hinzufügen oder korrigieren
chore: Build-Prozess oder Tools aktualisieren
```

### Code Review Kriterien

- [ ] Code folgt den Projekt-Standards
- [ ] Funktionalität wurde getestet
- [ ] Dokumentation ist aktuell
- [ ] Keine Breaking Changes ohne Diskussion
- [ ] Performance-Impact berücksichtigt

### Branch Hygiene

- **Feature Branches**: Kurz und fokussiert halten
- **Regelmäßiges Cleanup**: Gemergete Branches löschen
- **Sync mit dev**: Mindestens täglich pullen
- **Descriptive Names**: Klare, beschreibende Branch-Namen

## Notfall-Prozeduren

### Hotfixes für Production

```bash
# Direkt von main branchen für kritische Fixes
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# Fix implementieren und committen
git add .
git commit -m "hotfix: fix critical security issue"

# Zu main UND dev mergen
git push origin hotfix/critical-issue
# PR zu main AND dev erstellen
```

### Merge Conflicts

1. **Lokal auflösen**:
   ```bash
   git pull origin dev
   # Conflicts manuell auflösen
   git add .
   git commit -m "resolve: merge conflicts with dev"
   ```

2. **Bei größeren Konflikten**:
   - Team-Mitglied um Hilfe bitten
   - Pair Programming für komplexe Merges

## Tools & Automation

### GitHub Protection Rules

- **Main Branch**: 
  - Require PR reviews
  - Dismiss stale reviews
  - Require status checks
  - Restrict pushes to admins only

- **Dev Branch**:
  - Require PR reviews (1 minimum)
  - Require up-to-date branches

### CI/CD Pipeline

- **Lint Check**: ESLint auf alle PR
- **Type Check**: TypeScript compilation
- **Build Test**: Next.js build erfolgreich
- **Deploy Preview**: Vercel Preview für PRs

## Troubleshooting

### Common Issues

1. **"Branch protection rules"**
   - Lösung: PR erstellen statt direkter Push

2. **"Merge conflicts"**
   - Lösung: `git pull origin dev` vor Push

3. **"Failed CI checks"**
   - Lösung: Lokal testen mit `npm run lint` und `npm run build`

### Git Commands Cheat Sheet

```bash
# Status prüfen
git status

# Branches anzeigen
git branch -a

# Zu Branch wechseln
git checkout branch-name

# Änderungen stashen
git stash
git stash pop

# Branch umbenennen
git branch -m old-name new-name

# Remote branch löschen
git push origin --delete branch-name
```

## Weiterführende Dokumentation

- **Team Guidelines**: `team-guidelines.md`
- **Code Standards**: `coding-standards.md`
- **Setup Guide**: `setup-guide.md`
- **Feature Tracking**: `../features/README.md`