# 🎯 Rollenbasierte Weiterleitung - Komplette Implementierung

## 📋 **Übersicht**

Das System leitet Benutzer nach dem Login automatisch zu verschiedenen Dashboards weiter, basierend auf ihrer Rolle:

- **👑 Admin** → `/admin` (Admin Dashboard)
- **👤 User** → `/user` (Benutzer Dashboard)

## 🔧 **Wie es funktioniert**

### 1. **Login-Prozess mit Rollenentscheidung**

#### In `LoginForm.tsx`:
```typescript
if (response.ok && data.success) {
  // Hole die Benutzerrolle aus der API-Antwort
  const userRole = data.user?.role;
  let redirectPath: string;
  
  switch (userRole) {
    case 'admin':
      redirectPath = '/admin';    // Admin Dashboard
      break;
    case 'user':
      redirectPath = '/user';     // Benutzer Dashboard
      break;
    default:
      redirectPath = redirectTo;  // Fallback
  }
  
  console.log(`🔄 Redirecting ${userRole} to: ${redirectPath}`);
  router.push(redirectPath);
}
```

#### In `registerForm.tsx`:
- Gleiche Logik für neue Registrierungen
- Neue Benutzer werden standardmäßig als "user" erstellt
- Admins müssen separat erstellt werden

## 🏗️ **Implementierte Komponenten**

### 2. **Admin-Benutzer erstellen**

#### A) Automatische Standard-Admins:
```bash
# API-Call zum Erstellen von Standard-Admins
curl -X POST http://localhost:3001/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"action": "create-defaults"}'
```

Das erstellt:
- `admin@smartplates.dev` / `admin123`
- `superadmin@smartplates.dev` / `superadmin123`

#### B) Individuellen Admin erstellen:
```bash
# API-Call für benutzerdefinierten Admin
curl -X POST http://localhost:3001/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dein Name",
    "email": "dein@email.com", 
    "password": "deinpasswort"
  }'
```

### 3. **Route-Struktur**

```
src/app/
├── (admin)/admin/     → Admin Dashboard (/admin)
│   ├── page.tsx       → Admin Hauptseite
│   ├── dashboard/     → Admin Sub-Features
│   └── settings/      → Admin Einstellungen
│
└── (user)/user/       → User Dashboard (/user)
    ├── page.tsx       → User Hauptseite  
    ├── profile/       → User Profile
    └── settings/      → User Einstellungen
```

## 🧪 **Testing - So testest du es**

### Test 1: Admin-Login
1. **Browser öffnen**: `http://localhost:3001/login`
2. **Admin-Credentials eingeben**:
   - Email: `admin@smartplates.dev`
   - Password: `admin123`
3. **Erwartetes Ergebnis**: Weiterleitung zu `/admin`

### Test 2: Benutzer-Registrierung und Login
1. **Registrierung**: `http://localhost:3001/register`
   - Neuen Benutzer registrieren
   - **Erwartetes Ergebnis**: Weiterleitung zu `/user`
2. **Login**: `http://localhost:3001/login`
   - Mit den gleichen Credentials einloggen
   - **Erwartetes Ergebnis**: Weiterleitung zu `/user`

## 🔍 **Debug-Features**

### Console-Logs aktiviert:
- Das System loggt die Weiterleitung in der Browser-Konsole
- Öffne die Entwickler-Tools (F12) und schaue in die Console
- Du siehst: `🔄 Redirecting admin to: /admin` oder `🔄 Redirecting user to: /user`

### Troubleshooting:
```typescript
// Falls die Weiterleitung nicht funktioniert, prüfe:
1. API-Antwort enthält `data.user.role`
2. Switch-Statement wird erreicht  
3. router.push() wird aufgerufen
4. Ziel-Route existiert (/admin oder /user)
```

## 📝 **Schritt-für-Schritt Anleitung**

### Schritt 1: Admin-Benutzer erstellen
```bash
# Terminal öffnen und ausführen:
cd /home/dci-student/web_dev/projekts/smart_plate

# Standard-Admins erstellen
curl -X POST http://localhost:3001/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"action": "create-defaults"}'
```

### Schritt 2: Admin-Login testen
```bash
# Browser öffnen: http://localhost:3001/login
# Eingeben:
# Email: admin@smartplates.dev
# Password: admin123
# → Sollte zu /admin weiterleiten
```

### Schritt 3: User-Login testen
```bash
# Browser öffnen: http://localhost:3001/register
# Neuen User registrieren
# → Sollte zu /user weiterleiten

# Dann mit gleichen Daten in /login
# → Sollte zu /user weiterleiten
```

## ⚙️ **Konfiguration**

### Default-Weiterleitungen ändern:
```typescript
// In LoginForm.tsx oder registerForm.tsx
export function LoginForm({ 
  className, 
  redirectTo = '/user'  // Ändere hier den Fallback
}: LoginFormProps) {
```

### Neue Rollen hinzufügen:
```typescript
// In der Switch-Anweisung:
switch (userRole) {
  case 'admin':
    redirectPath = '/admin';
    break;
  case 'user':
    redirectPath = '/user';
    break;
  case 'moderator':        // Neue Rolle
    redirectPath = '/moderator';
    break;
  default:
    redirectPath = redirectTo;
}
```

## 🎉 **Zusammenfassung**

✅ **Was implementiert wurde:**
- Rollenbasierte Weiterleitung nach Login/Registrierung
- API-Endpoint zum Erstellen von Admin-Benutzern
- Automatische Erkennung der Benutzerrolle
- Debug-Logging für Troubleshooting

✅ **Was du jetzt tun kannst:**
1. Admin-Benutzer erstellen (über API)
2. Als Admin einloggen → automatische Weiterleitung zu `/admin`
3. Als User registrieren/einloggen → automatische Weiterleitung zu `/user`

**Das System ist voll funktionsfähig! 🚀**
