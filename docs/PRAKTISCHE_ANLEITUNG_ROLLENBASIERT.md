# 🚀 **PRAKTISCHE ANLEITUNG: Rollenbasierte Weiterleitung testen**

## 📋 **Was du jetzt sofort machen kannst**

### **🎯 METHODE 1: Direkt im Browser testen**

#### **Test A: Admin-Login** 
1. **Öffne**: `http://localhost:3001/login`
2. **Eingeben**:
   ```
   Email: admin@smartplates.dev
   Password: admin123
   ```
3. **Button klicken**: "Sign In"
4. **✅ Erwartetes Ergebnis**: Du wirst zu `/admin` weitergeleitet

#### **Test B: User registrieren und einloggen**
1. **Öffne**: `http://localhost:3001/register`
2. **Eingeben**:
   ```
   Name: Dein Name
   Email: deine@email.com  
   Password: deinpasswort123
   Confirm Password: deinpasswort123
   ```
3. **Button klicken**: "Create Account"
4. **✅ Erwartetes Ergebnis**: Du wirst zu `/user` weitergeleitet

5. **Danach logout und Login-Test**:
   - Gehe zu `/login`
   - Nutze die gleichen Credentials
   - **✅ Erwartetes Ergebnis**: Du wirst zu `/user` weitergeleitet

---

## 🔧 **METHODE 2: Für Tech-Savvy - API direkt testen**

### **Schritt 1: Terminal öffnen und Admin erstellen**
```bash
# Admin-Benutzer erstellen (einmalig)
curl -X POST http://localhost:3001/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"action": "create-defaults"}'
```

### **Schritt 2: Admin-Login testen**
```bash
# Admin einloggen via API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartplates.dev",
    "password": "admin123"
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "user": {
    "role": "admin",  // <-- Das ist wichtig!
    "email": "admin@smartplates.dev"
  }
}
```

### **Schritt 3: User registrieren via API**
```bash
# User registrieren
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User API",
    "email": "testapi@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "user": {
    "role": "user",  // <-- Das ist wichtig!
    "email": "testapi@example.com"
  }
}
```

---

## 🐛 **DEBUGGING: So siehst du, was passiert**

### **Browser Console verwenden:**
1. **F12 drücken** (Entwickler-Tools öffnen)
2. **Console Tab** auswählen
3. **Login/Register durchführen**
4. **Du siehst Logs wie:**
   ```
   🔄 Redirecting admin to: /admin
   🔄 Redirecting user to: /user
   ```

### **Prüfen, ob die Weiterleitung funktioniert:**
```javascript
// In der Browser-Console nach Login eingeben:
console.log('Current URL:', window.location.pathname);

// Sollte zeigen:
// Für Admin: "/admin" 
// Für User: "/user"
```

---

## 📍 **WO die Magie passiert - Code-Erklärung**

### **In `LoginForm.tsx` (Zeile ~40):**
```typescript
if (response.ok && data.success) {
  // 🎯 HIER passiert die Rollenentscheidung
  const userRole = data.user?.role;  // Aus API-Antwort holen
  let redirectPath: string;
  
  switch (userRole) {
    case 'admin':
      redirectPath = '/admin';    // 👑 Admin Dashboard
      break;
    case 'user':  
      redirectPath = '/user';     // 👤 User Dashboard
      break;
    default:
      redirectPath = redirectTo;  // Fallback
  }
  
  console.log(`🔄 Redirecting ${userRole} to: ${redirectPath}`);
  router.push(redirectPath);  // 🚀 Weiterleitung ausführen
}
```

### **In der API-Antwort (`/api/auth/login`):**
```typescript
// Das Login API gibt zurück:
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "role": "admin"  // 🔑 DAS ist der entscheidende Wert!
  }
}
```

---

## 🎯 **SOFORT-TEST: Was du JETZT machen kannst**

### **Option 1: Schnelltest (5 Minuten)**
1. Browser öffnen: `http://localhost:3001/register`
2. Registriere dich mit beliebigen Daten
3. Schaue, ob du zu `/user` weitergeleitet wirst
4. **✅ Funktioniert? Dann ist alles OK!**

### **Option 2: Vollständiger Test (10 Minuten)**
1. **Admin-Test**: 
   - Gehe zu `/login`
   - Email: `admin@smartplates.dev`, Password: `admin123`
   - Prüfe Weiterleitung zu `/admin`

2. **User-Test**:
   - Registriere neuen User über `/register`
   - Prüfe Weiterleitung zu `/user`
   - Logge dich aus und wieder ein
   - Prüfe erneut Weiterleitung zu `/user`

---

## 🔄 **Falls es nicht funktioniert:**

### **Häufige Probleme & Lösungen:**

1. **"admin@smartplates.dev" existiert nicht**
   ```bash
   # Admin-User erstellen:
   curl -X POST http://localhost:3001/api/admin/create-admin \
     -H "Content-Type: application/json" \
     -d '{"action": "create-defaults"}'
   ```

2. **Weiterleitung funktioniert nicht**
   - F12 → Console → Schaue nach Error-Messages
   - Prüfe, ob die API-Antwort `user.role` enthält

3. **Routes nicht gefunden (404)**
   - Prüfe, ob `/admin/page.tsx` und `/user/page.tsx` existieren
   - Server neu starten: `bun dev`

---

## 🎉 **Zusammenfassung**

**Was implementiert wurde:**
- ✅ Login-Formulare erkennen Benutzerrolle automatisch
- ✅ Admin → `/admin`, User → `/user` Weiterleitung
- ✅ API-Endpoints für Admin-Erstellung
- ✅ Debug-Logging in Browser-Console

**Was du jetzt testen kannst:**
1. **Sofort**: Registriere dich und schaue, ob Weiterleitung zu `/user` funktioniert
2. **Mit Admin**: Nutze `admin@smartplates.dev` / `admin123` für Admin-Test
3. **Debug**: Öffne F12 Console und schaue dir die Logs an

**🚀 Das System funktioniert bereits - teste es jetzt!**
