# SmartPlates (Rezept-Planer) 🍽️

## Projektbeschreibung

SmartPlates ist eine Full-Stack-Webanwendung, die entwickelt wurde, um die Essensplanung zu vereinfachen. Benutzer können Rezepte entdecken, ihre eigenen hochladen, detaillierte Essenspläne erstellen und eine KI-gestützte Funktion zur Analyse von Lebensmittelbildern nutzen. Die Anwendung zielt darauf ab, eine intuitive und effiziente Erfahrung für die Organisation von Mahlzeiten zu bieten.

Das Projekt umfasst ein umfassendes Backend für die Benutzer- und Rezeptverwaltung sowie ein modernes Frontend für eine nahtlose Benutzerinteraktion.

## 📊 Current Project Status (11. September 2025)

### Phase 1: Foundation & Core Setup ⚠️ **60% COMPLETE**

| Feature | Developer | Status | Details |
|---------|-----------|--------|---------|
| Project Setup & Authentication | Developer 1 (Ese) | ✅ **COMPLETED** | Next.js, Auth, Database ready |
| Database & API Foundation | Developer 5 (Monika) | ✅ **COMPLETED** | CRUD operations, validation ready |
| User Management System | Developer 2 (Balta) | ⚠️ **PARTIAL** | Profile management missing |
| Admin Foundation | Developer 3 (Hana) | ⚠️ **PARTIAL** | Dashboard integration needed |
| UI/UX Foundation | Developer 4 (Rozn) | ⚠️ **PARTIAL** | Design system incomplete |

**📋 Detailed Status**: See `PHASE_1_STATUS_REPORT.md`  
**📝 Complete TODO**: See `TODO_COMPLETE.md`

### 🔗 External API Integration Status
- **Spoonacular API**: ✅ **DOCUMENTED** (`docs/spoonacular-api-integration.md`)
- **Implementation**: ❌ **PENDING** (Service layer not implemented)

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