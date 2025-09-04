# SmartPlates Tests

## Übersicht

Dieses Verzeichnis enthält alle Tests für das SmartPlates-Projekt.

## Test Struktur

```
tests/
├── __tests__/           # Jest Unit Tests
│   ├── components/      # Component Tests
│   ├── pages/          # Page Tests
│   ├── api/            # API Route Tests
│   └── utils/          # Utility Function Tests
├── e2e/                # End-to-End Tests (Cypress)
│   ├── integration/    # Integration Tests
│   └── fixtures/       # Test Data
├── __mocks__/          # Mock Files
├── setup/              # Test Setup Files
└── coverage/           # Coverage Reports
```

## Testing Strategy

### Unit Tests (Jest + React Testing Library)
- **Components**: Test rendering, props, user interactions
- **Utilities**: Test pure functions and helpers
- **Hooks**: Test custom React hooks
- **Services**: Test API calls and data transformations

### Integration Tests
- **API Routes**: Test database operations and business logic
- **User Flows**: Test multi-component interactions
- **Authentication**: Test login/logout flows

### End-to-End Tests (Cypress)
- **Critical User Journeys**: Complete meal planning workflow
- **Admin Functions**: Recipe and user management
- **AI Features**: Fridge analysis and recipe suggestions

## Running Tests

```bash
# Unit Tests
npm run test
npm run test:watch
npm run test:coverage

# E2E Tests
npm run cypress:open
npm run cypress:run

# All Tests
npm run test:all
```

## Test Guidelines

### Component Testing
- Test user interactions, not implementation details
- Use accessible queries (getByRole, getByLabelText)
- Mock external dependencies
- Test error states and loading states

### API Testing
- Test both success and error scenarios
- Validate input/output schemas
- Test authentication and authorization
- Use test database for integration tests

### E2E Testing
- Focus on critical user paths
- Test cross-browser compatibility
- Include mobile viewport testing
- Test performance metrics

## Coverage Targets

- **Components**: 90%+ coverage
- **Utilities**: 95%+ coverage
- **API Routes**: 85%+ coverage
- **Critical Paths**: 100% E2E coverage
