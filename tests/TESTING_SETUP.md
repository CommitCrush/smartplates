# Package Dependencies Setup für SmartPlates API Testing

## Benötigte Test-Dependencies

Um die API-Tests auszuführen, müssen folgende Development-Dependencies installiert werden:

```bash
npm install --save-dev \
  @types/jest \
  jest \
  ts-jest \
  mongodb-memory-server \
  @jest/globals \
  supertest \
  @types/supertest
```

## Alternative mit yarn:

```bash
yarn add -D \
  @types/jest \
  jest \
  ts-jest \
  mongodb-memory-server \
  @jest/globals \
  supertest \
  @types/supertest
```

## Package.json Scripts hinzufügen:

Die folgenden Scripts sollten zur `package.json` hinzugefügt werden:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --silent"
  }
}
```

## TypeScript Types Setup:

Erstelle eine `types/jest.d.ts` Datei für bessere TypeScript-Integration:

```typescript
import '@jest/globals';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidObjectId(): R;
      toMatchApiResponseSchema(): R;
    }
  }
}
```

## Aktualisierte package.json

```json
{
  "name": "smartplates",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack", 
    "start": "next start",
    "lint": "eslint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --silent"
  },
  "dependencies": {
    "@auth/mongodb-adapter": "^3.10.0",
    "@google-cloud/storage": "^7.17.0",
    "@google-cloud/vision": "^5.3.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@tailwindcss/postcss": "^4.1.12",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.542.0",
    "mongodb": "^6.19.0",
    "next": "15.5.2",
    "next-auth": "^4.24.11",
    "postcss": "^8.5.6",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "tailwind-merge": "^3.3.1",
    "tailwindcss": "^4.1.12",
    "zod": "^4.1.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@jest/globals": "^29.7.0",
    "@types/bcrypt": "^6.0.0",
    "@types/jest": "^29.5.12",
    "@types/js-cookie": "^3.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/mongodb": "^4.0.7",
    "@types/mongoose": "^5.11.97",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/supertest": "^6.0.2",
    "@types/validator": "^13.15.2",
    "bcrypt": "^6.0.0",
    "eslint": "^9",
    "eslint-config-next": "15.5.2",
    "jest": "^29.7.0",
    "js-cookie": "^3.0.5",
    "jsonwebtoken": "^9.0.2",
    "mongodb-memory-server": "^9.1.8",
    "mongoose": "^8.18.0",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.2",
    "typescript": "^5",
    "validator": "^13.15.15"
  }
}
```

## Installation ausführen:

Nach dem Hinzufügen der Dependencies:

```bash
npm install
```

## Tests ausführen:

```bash
# Alle Tests ausführen
npm test

# Tests mit Watch-Mode
npm run test:watch

# Tests mit Coverage-Report
npm run test:coverage

# Tests für CI/CD
npm run test:ci
```

## Warum diese Dependencies?

- **@types/jest**: TypeScript-Typen für Jest
- **jest**: Test-Framework
- **ts-jest**: TypeScript-Unterstützung für Jest
- **mongodb-memory-server**: In-Memory MongoDB für isolierte Tests
- **@jest/globals**: Jest-Globals für bessere TypeScript-Integration
- **supertest**: HTTP-Request-Testing für API-Endpoints
- **@types/supertest**: TypeScript-Typen für Supertest

## Nächste Schritte:

1. Dependencies installieren
2. Tests ausführen: `npm test`
3. Jest-Konfiguration anpassen falls nötig
4. Weitere Tests für spezifische API-Endpoints schreiben
