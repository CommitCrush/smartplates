# SmartPlates Validation Infrastructure

Diese Dokumentation erklärt das Validierungssystem für die SmartPlates API.

## Übersicht

Das Validierungssystem basiert auf [Zod](https://zod.dev/) und bietet:
- **Typsichere Validierung** für alle API-Eingaben
- **Deutsche Fehlermeldungen** für benutzerfreundliche Rückmeldungen
- **Einheitliche API-Responses** über alle Endpoints
- **Wiederverwendbare Schemas** für verschiedene Operationen

## Struktur

```
src/lib/validation/
├── userSchemas.ts        # Benutzer-Validierung
├── recipeSchemas.ts      # Rezept-Validierung
├── categorySchemas.ts    # Kategorie-Validierung
└── apiValidation.ts      # API-Middleware
```

## Verwendung

### 1. API-Endpoint mit Validierung

```typescript
// src/app/api/users/route.ts
import { withValidation } from '@/lib/validation/apiValidation';
import { createUserValidation } from '@/lib/validation/userSchemas';

export const POST = withValidation(
  createUserValidation,
  async (validatedData) => {
    // validatedData ist typsicher und validiert
    const newUser = await createUser(validatedData);
    return createSuccessResponse(newUser, 'Benutzer erfolgreich erstellt');
  }
);
```

### 2. Manuelle Validierung

```typescript
import { z } from 'zod';
import { createUserValidation } from '@/lib/validation/userSchemas';

try {
  const validatedData = createUserValidation.parse(requestData);
  // Daten sind validiert und typsicher
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors); // Deutsche Fehlermeldungen
  }
}
```

## Schema-Typen

### Benutzer-Schemas (`userSchemas.ts`)

- **`createUserValidation`**: Neue Benutzer erstellen
- **`updateUserValidation`**: Benutzer aktualisieren (optionale Felder)
- **`loginValidation`**: Login-Daten validieren
- **`bulkUserValidation`**: Mehrere Benutzer gleichzeitig

```typescript
// Beispiel: Benutzer erstellen
const userData = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  firstName: 'Max',
  lastName: 'Mustermann',
  role: 'user'
};

const validatedUser = createUserValidation.parse(userData);
```

### Rezept-Schemas (`recipeSchemas.ts`)

- **`createRecipeValidation`**: Neue Rezepte erstellen
- **`updateRecipeValidation`**: Rezepte aktualisieren
- **`recipeSearchValidation`**: Suchparameter validieren
- **`bulkRecipeValidation`**: Mehrere Rezepte importieren

```typescript
// Beispiel: Rezept erstellen
const recipeData = {
  title: 'Spaghetti Carbonara',
  description: 'Klassisches italienisches Pasta-Gericht',
  ingredients: [
    { name: 'Spaghetti', amount: 400, unit: 'g' },
    { name: 'Speck', amount: 200, unit: 'g' }
  ],
  instructions: [
    { step: 1, description: 'Pasta kochen' },
    { step: 2, description: 'Speck anbraten' }
  ],
  cookingTime: 20,
  servings: 4,
  difficulty: 'medium'
};

const validatedRecipe = createRecipeValidation.parse(recipeData);
```

### Kategorie-Schemas (`categorySchemas.ts`)

- **`createCategoryValidation`**: Neue Kategorien erstellen
- **`updateCategoryValidation`**: Kategorien aktualisieren
- **`categoryHierarchyValidation`**: Kategorie-Hierarchien verwalten

```typescript
// Beispiel: Kategorie erstellen
const categoryData = {
  name: 'Italienische Küche',
  description: 'Traditionelle Rezepte aus Italien',
  parentCategory: 'internationale-kueche', // optional
  isActive: true
};

const validatedCategory = createCategoryValidation.parse(categoryData);
```

## API-Response-Format

Alle API-Responses folgen einem einheitlichen Format:

### Erfolgs-Response

```json
{
  "success": true,
  "data": { /* Die angeforderten Daten */ },
  "message": "Operation erfolgreich abgeschlossen",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Fehler-Response

```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Die Eingabedaten sind ungültig",
    "details": [
      {
        "field": "email",
        "message": "Bitte geben Sie eine gültige E-Mail-Adresse ein"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Fehlermeldungen

Alle Fehlermeldungen sind auf Deutsch und benutzerfreundlich:

- **E-Mail-Validierung**: "Bitte geben Sie eine gültige E-Mail-Adresse ein"
- **Passwort-Stärke**: "Das Passwort muss mindestens 8 Zeichen lang sein und Groß-, Kleinbuchstaben, Zahlen und Sonderzeichen enthalten"
- **Pflichtfelder**: "Dieses Feld ist erforderlich"
- **Datentypen**: "Bitte geben Sie eine gültige Zahl ein"

## Error-Handler

Der `ValidationError`-Handler fängt Zod-Validierungsfehler ab und formatiert sie:

```typescript
export class ValidationError extends Error {
  constructor(
    public zodError: z.ZodError,
    message = 'Validierungsfehler'
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  formatErrors() {
    return this.zodError.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message
    }));
  }
}
```

## Erweiterte Validierung

### Custom Validatoren

```typescript
// Beispiel: Custom E-Mail-Domain-Validierung
const customEmailValidation = z.string()
  .email('Ungültige E-Mail-Adresse')
  .refine(
    (email) => email.endsWith('@company.com'),
    'E-Mail muss von der Firmen-Domain sein'
  );
```

### Conditional Validierung

```typescript
// Beispiel: Bedingte Validierung basierend auf Benutzerrolle
const conditionalUserValidation = z.object({
  role: z.enum(['user', 'admin']),
  permissions: z.array(z.string()).optional()
}).refine(
  (data) => data.role !== 'admin' || data.permissions,
  {
    message: 'Admin-Benutzer benötigen Berechtigungen',
    path: ['permissions']
  }
);
```

## Best Practices

1. **Immer validieren**: Alle Benutzereingaben müssen validiert werden
2. **Klare Fehlermeldungen**: Deutsche, verständliche Meldungen verwenden
3. **Typsicherheit**: TypeScript-Typen aus Zod-Schemas ableiten
4. **Wiederverwendung**: Gemeinsame Validierungslogik in Schemas auslagern
5. **Performance**: Nur notwendige Validierungen durchführen

## Integration mit TypeScript

```typescript
// Typen aus Schemas ableiten
import { z } from 'zod';
import { createUserValidation } from '@/lib/validation/userSchemas';

type CreateUserData = z.infer<typeof createUserValidation>;
type UpdateUserData = z.infer<typeof updateUserValidation>;

// Verwendung in Funktionen
async function createUser(userData: CreateUserData) {
  // userData ist automatisch typsicher
  return await saveToDatabase(userData);
}
```

## Testing

Für Tests der Validierung siehe `tests/__tests__/validation.test.ts`:

```typescript
describe('Benutzer-Validierung', () => {
  test('sollte gültige Benutzerdaten akzeptieren', () => {
    const validData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User'
    };

    expect(() => createUserValidation.parse(validData)).not.toThrow();
  });

  test('sollte ungültige E-Mail ablehnen', () => {
    const invalidData = { email: 'invalid-email' };
    
    expect(() => createUserValidation.parse(invalidData))
      .toThrow('Bitte geben Sie eine gültige E-Mail-Adresse ein');
  });
});
```
