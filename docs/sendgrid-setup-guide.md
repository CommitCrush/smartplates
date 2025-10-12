# SendGrid Setup für SmartPlates Contact Form

## 🚀 SendGrid Setup Anleitung

### Schritt 1: SendGrid Account erstellen

1. **Gehe zu**: https://sendgrid.com/
2. **Erstelle kostenlosen Account** (100 Emails/Tag kostenlos)
3. **Verifiziere deine Email-Adresse**

### Schritt 2: API Key erstellen

1. **Gehe zu**: SendGrid Dashboard → Settings → API Keys
2. **Klicke auf**: "Create API Key"
3. **Name**: "SmartPlates Contact Form"
4. **Permissions**: "Full Access" (oder nur "Mail Send")
5. **Kopiere den API Key** (nur einmalig sichtbar!)

### Schritt 3: Sender Identity verifizieren

**Option A: Single Sender Verification (Einfach)**
1. Gehe zu: Settings → Sender Authentication → Single Sender Verification
2. Füge hinzu: `noreply@smartplates.app` oder `smartplates.group@gmail.com`
3. Verifiziere über Email-Link

**Option B: Domain Authentication (Professional)**
1. Gehe zu: Settings → Sender Authentication → Domain Authentication
2. Füge deine Domain hinzu: `smartplates.app`
3. Folge den DNS-Setup Anweisungen

### Schritt 4: Environment Variables konfigurieren

Füge in [`.env.local`](.env.local ) hinzu:

```bash
# SendGrid Configuration (Primary Email Service)
SENDGRID_API_KEY=SG.dein-api-key-hier
SENDGRID_FROM_EMAIL=noreply@smartplates.app
```

### Schritt 5: Testen

1. **Server starten**:
   ```bash
   bun run dev
   ```

2. **Test-Endpunkt aufrufen**:
   ```bash
   curl http://localhost:3000/api/test-sendgrid
   ```

3. **Contact Form testen**:
   - Gehe zu: http://localhost:3000/contact
   - Fülle das Formular aus
   - Überprüfe: `smartplates.group@gmail.com` Posteingang

## 🔧 Troubleshooting

### Problem: "API Key not configured"
**Lösung**: 
- Überprüfe [`.env.local`](.env.local ) auf korrekte Variable
- Server neu starten nach Änderungen

### Problem: "Sender not verified"
**Lösung**:
- Verifiziere Sender-Email in SendGrid Dashboard
- Verwende nur verifizierte Email-Adressen

### Problem: "Emails kommen nicht an"
**Lösung**:
- Überprüfe Spam-Ordner
- Teste mit anderem Email-Provider
- Überprüfe SendGrid Activity Dashboard

## 📊 SendGrid Dashboard Features

### Activity Dashboard
- **Email Status**: Delivered, Bounced, Opened, Clicked
- **Analytics**: Öffnungsraten, Klickraten
- **Error Logs**: Fehlgeschlagene Sendungen

### Email Templates
- **Erstelle Templates** für wiederkehrende Emails
- **Personalisierung** mit Variablen
- **A/B Testing** für bessere Performance

## 💡 Vorteile von SendGrid

### vs. Gmail SMTP:
- ✅ **Keine 2FA nötig**
- ✅ **Professionelle Zustellbarkeit**
- ✅ **Detaillierte Analytics**
- ✅ **Höhere Limits** (100 Emails/Tag kostenlos)
- ✅ **Spam-Score Optimierung**

### Production Features:
- 📈 **Skalierbarkeit**: Bis zu 100K+ Emails/Monat
- 📊 **Reporting**: Detaillierte Email-Performance
- 🔒 **Security**: Enterprise-Level Sicherheit
- 🚀 **Reliability**: 99.9% Uptime Garantie

## 🎯 Nächste Schritte

1. **SendGrid Account erstellen** und API Key generieren
2. **Sender Email verifizieren** (wichtig!)
3. **Environment Variables setzen** in [`.env.local`](.env.local )
4. **Server neu starten** und testen
5. **Contact Form verwenden** - Emails gehen direkt an SmartPlates!

## 🔄 Fallback System

Das System ist so konfiguriert:

1. **Erste Priorität**: SendGrid (professionell, zuverlässig)
2. **Fallback**: Gmail SMTP (falls SendGrid ausfällt)
3. **Emergency**: Console Logging (für Debug-Zwecke)

So funktioniert die Contact Form auch wenn einer der Services temporär nicht verfügbar ist!

## 📞 Support

Bei Problemen:
1. Überprüfe SendGrid Dashboard für Error-Logs
2. Schaue Browser Console für JavaScript-Fehler
3. Prüfe Server-Logs für Backend-Errors
4. Teste mit `/api/test-sendgrid` Endpunkt