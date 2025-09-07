# SmartPlates (Rezept-Planer) 🍽️

## Projektbeschreibung

SmartPlates ist eine Full-Stack-Webanwendung, die entwickelt wurde, um die Essensplanung zu vereinfachen. Benutzer können Rezepte entdecken, ihre eigenen hochladen, detaillierte Essenspläne erstellen und eine KI-gestützte Funktion zur Analyse von Lebensmittelbildern nutzen. Die Anwendung zielt darauf ab, eine intuitive und effiziente Erfahrung für die Organisation von Mahlzeiten zu bieten.

Das Projekt umfasst ein umfassendes Backend für die Benutzer- und Rezeptverwaltung sowie ein modernes Frontend für eine nahtlose Benutzerinteraktion.

---

## Design & UI/UX Vision

Basierend auf den visuellen Entwürfen soll das Projekt eine saubere, moderne und benutzerfreundliche Oberfläche erhalten.

* **Responsive Design**: Alle Komponenten und Layouts werden vollständig responsiv gestaltet, um eine optimale Darstellung und Funktionalität auf allen Geräten – vom Desktop-PC über Tablets bis hin zu Smartphones – sicherzustellen.

### Homepage (Ansicht für Besucher)

Die Startseite dient als einladender Einstieg in die Welt von SmartPlates.
* **Design & Farben**: Ein minimalistisches Layout mit viel Weißraum, sanften Grüntönen und einem warmen Korallton für Akzente und Call-to-Action-Buttons.
* **Slogan**: Der zentrale Leitspruch ist **"Effortless Meal Planning. Delicious Living."**, um den Kernnutzen der App zu kommunizieren.
* **Layout**: Ein prominenter Header-Bereich mit hochwertigen Food-Bildern, dem Slogan und einem direkten "START PLANNING NOW"-Button. Darunter werden die drei Hauptfunktionen ("Plan Your Week", "Smart Grocery List", "AI Meal Suggestions") visuell ansprechend präsentiert.

---

## Features

### Benutzer-Features

* **Mein Essensplan (My Meal Plan)**: Dies ist die zentrale Planungszentrale. Hier können Benutzer in einer Kalenderansicht ihre Mahlzeiten für die Woche organisieren. Um den Plan zu füllen, steht eine leistungsstige Such- und Filterfunktion zur Verfügung. Mithilfe von **Dropdowns mit Kategorien und Allergien** können Rezepte zur besseren Filterung nach Kriterien wie "Beliebt" oder "Schnell & Einfach" durchsucht und direkt zum Plan hinzugefügt werden.
* **Einkaufsliste (Groceries)**: Automatisch generierte Zutatenliste basierend auf dem ausgewählten Essensplan.
* **Gespeicherte Pläne (Saved Meal Plan)**: Möglichkeit, bewährte Wochenpläne zu speichern und wiederzuverwenden.
* **Rezept-Upload**: Benutzer können eigene Rezepte mit Titel, Zutaten, Anleitung, Bildern/Videos und Kategorien hochladen.
* **KI-gestützte Rezeptvorschläge**: Eine innovative Funktion, die es Benutzern ermöglicht, ein Foto vom Inhalt ihres Kühlschranks hochzuladen. Die KI analysiert das Bild, erkennt die vorhandenen Zutaten (z.B. Eier, Tomaten) und schlägt passende Rezepte vor. Zusätzlich können Benutzer über Texteingaben (Prompts) gezielt nach Rezeptideen suchen.
* **Kochgeschirr (Cookware)**: Eine kuratierte Liste von grundlegenden Küchenutensilien mit Affiliate-Links zu Amazon oder IKEA.

### Admin-Features

* **Dashboard & Statistiken**: Eine Übersicht über Nutzeraktivitäten, beliebte Rezepte und andere relevante Metriken.
* **Benutzerverwaltung**: Admins können registrierte Benutzer einsehen, ihren Status verwalten und bei Bedarf löschen.
* **Rezeptverwaltung**: Admins haben die volle Kontrolle über alle in der Datenbank befindlichen Rezepte.
* **Cookware & Provisionen**: Verwalten Sie die Liste der Kochgeschirr-Artikel und die damit verbundenen Partner-Provisionen.

---

## Einstellungsoptionen (Settings)

Die Einstellungsseite ist an moderne Dashboards wie die GitHub-Profileinstellungen angelehnt und verfügt über eine Navigationsleiste (Sidebar) auf der linken Seite.

### Benutzer-Einstellungen

* **Profil**:
    * Profilbild, Benutzername und E-Mail ändern.
    * Passwort ändern.
    * Sichtbarkeit des Profils einstellen (öffentlich/privat).
* **Personalisierung**:
    * App-Sprache und Design (Hell/Dunkel) anpassen.
    * Benachrichtigungen für Kommentare und Likes verwalten.
    * Ernährungsvorlieben (z.B. vegan, glutenfrei) speichern.
* **Datenschutz & Sicherheit**:
    * Cookie-Einwilligungen verwalten (erstellen, speichern, löschen).
* **Konto**:
    * Konto löschen und Logout.

### Admin-Einstellungen

* **Profil-Settings**:
    * Profilbild, Benutzername, E-Mail und Passwort des Admin-Kontos ändern.
* **Konto**:
    * Konto löschen und Logout.

---

## Technologie-Stack

* **Framework**: Next.js (Fullstack mit App Router)
* **Datenbank**: MongoDB
* **Authentifizierung**: Google Cloud for Authentication
* **Styling**: Tailwind CSS
* **Bild- & Videoverwaltung**: Google Cloud Storage
* **Deployment**: Vercel
* **Externe APIs & Services**:
    * **Rezept-API** (z.B. Spoonacular, TheMealDB) zur Beschaffung von Gerichten und Zutaten.
    * **KI Vision API**: Google Cloud Vision AI zur Analyse von Bildern für das Kühlschrank-Feature.

---

## Development Workflow

### Git Branching Strategy

This project follows a structured Git workflow to ensure clean code management and stable releases:

#### Branch Structure

- **`main`** - Production-ready code only. Protected branch with no direct commits allowed.
- **`dev`** - Active development branch. All feature branches must branch off from `dev`.
- **`feature/*`** - Individual feature branches created from `dev`.

#### Workflow Process

1. **Starting a New Feature:**
   ```bash
   # Always start from the latest dev branch
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Working on Features:**
   - Make commits to your feature branch
   - Regularly sync with dev: `git pull origin dev`
   - Push feature branch: `git push origin feature/your-feature-name`

3. **Completing a Feature:**
   - Create Pull Request from `feature/your-feature-name` → `dev`
   - Request code review from team members
   - Merge into `dev` after approval

4. **Production Release:**
   - Only final, tested code from `dev` gets merged into `main`
   - `main` branch is protected and requires admin approval
   - Production deployments happen only from `main`

#### Branch Protection Rules

- **Main Branch**: No direct commits, requires Pull Request with reviews
- **Dev Branch**: Primary working branch, all features merge here first
- **Feature Branches**: Short-lived, deleted after merge

#### Guidelines

- **Feature Branch Naming**: Use descriptive names like `feature/meal-planning`, `feature/recipe-search`, `bugfix/login-issue`
- **Commit Messages**: Clear, descriptive commit messages following conventional format
- **Code Review**: All code must be reviewed before merging
- **Testing**: Features must pass all tests before merging

### Team Coordination

- **Daily Standups**: Progress updates and blocker identification
- **Weekly Reviews**: Feature demos and sprint planning
- **Code Reviews**: Mandatory for all Pull Requests
- **Documentation**: Update relevant docs with each feature

For detailed feature tracking, see the `features/` directory and `FEATURE_ROADMAP.md`.