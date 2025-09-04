# GitHub Copilot Instructions Template - {PROJECT_NAME}

## Project Overview

**{PROJECT_NAME}** is a {TECH_STACK} application focused on {PROJECT_DESCRIPTION}. The platform provides {KEY_FEATURES} with a complete {BACKEND_DESCRIPTION} system.

## Architecture & Key Patterns

### Tech Stack

- **Framework**: {FRAMEWORK} with {ROUTING_SYSTEM}
- **Styling**: {STYLING_FRAMEWORK} with {THEMING_APPROACH}
- **UI Components**: {UI_LIBRARY} with custom {COMPONENT_SYSTEM}
- **{AI_INTEGRATION}**: {AI_TOOL} for AI-powered features
- **Backend**: {BACKEND_SERVICE} integration for {BACKEND_PURPOSE}

### Component Architecture

```
src/
├── app/                 # {FRAMEWORK} pages
├── components/          # React components
│   └── ui/             # Reusable {UI_LIBRARY} components
├── lib/                # Utilities and data
├── types/              # TypeScript definitions
└── {AI_FOLDER}/        # {AI_TOOL} flows
```

### Design System

- **Primary Color**: {PRIMARY_COLOR} - used for interactive elements
- **Fonts**:
  - Headlines: `{HEADLINE_FONT}` ({HEADLINE_FONT_FAMILY})
  - Body: `{BODY_FONT}` ({BODY_FONT_FAMILY})
- **Dark Mode**: {DARK_MODE_IMPLEMENTATION}
- **Component Pattern**: All UI components use `{CLASSNAME_UTILITY}` utility for className merging

## Critical Development Patterns

### Code Implementation Rule

#### Do's

- Always follow the established component patterns and naming conventions.
- Always use the appropriate edit tools (replace_string_in_file, create_file, etc.) to implement changes directly.
- After implementation, provide a brief bullet point summary of what was accomplished without repeating the code.
- Always ensure that the code is production-ready and adheres to Software Development Best Practices and principles like DRY, KISS, and SOLID.
- Always test your changes locally before suggesting them.
- Always document new patterns or changes in the `docs/` directory.
- Always document any new features or enhancements in the `features/` directory.

#### Don'ts

- NEVER print out codeblocks with file changes unless the user specifically asks for code examples.
- Never alter the database for example deploying a {DATABASE_RULE} or adding a new collection without explicitly showing the user the code and requesting confirmation.
- Never interact with GitHub directly (e.g., pushing commits, creating branches) without user confirmation.

### Styling Conventions

- Use CSS custom properties defined in `{GLOBAL_CSS_PATH}`
- Always use `{CLASSNAME_UTILITY}` from `{UTILS_PATH}` for conditional classes
- Follow {UI_LIBRARY} patterns: `{CLASSNAME_UTILITY}(baseClasses, conditionalClasses, className)`
- Dark mode support via `{DARK_MODE_CLASS}` class with {COLOR_FORMAT} color values

### Component Structure

```tsx
const Component = ({ className, ...props }) => (
  <div
    className={cn("default classes", "variant classes", className)}
    {...props}
  />
);
```

### Data Layer

- **Current**: {BACKEND_SERVICE} integration maintaining same interface
- **Pattern**: Export const arrays with TypeScript types

### {AI_INTEGRATION} Integration

- **{AI_TOOL} flows** in `{AI_FOLDER}/flows/` for AI-powered features
- **Server actions pattern**: `'use server'` directive at top of flow files
- **Schema validation**: Input/output schemas using {VALIDATION_LIBRARY} for type safety
- **Current implementation**: `{EXAMPLE_AI_FLOW}` flow for {AI_FLOW_PURPOSE}
- **Optimization needed**: Fine-tune prompts, add error handling, implement caching
- **Pattern**: Define prompt → Define flow → Export server action function
- **Testing**: Use `{AI_DEV_COMMAND}` to test flows in {AI_TOOL} UI before integration

## Development Commands

### Primary Workflows

```bash
{DEV_COMMAND}          # Development server on port {PORT} with {DEV_TOOL}
{AI_DEV_COMMAND}       # Start {AI_TOOL} development server
{AI_WATCH_COMMAND}     # Watch mode for AI flow development
{TYPECHECK_COMMAND}    # TypeScript validation
```

### File Naming Conventions

- **Pages**: `{PAGE_FILE_FORMAT}` ({ROUTING_SYSTEM})
- **Components**: {COMPONENT_NAMING} (e.g., `{COMPONENT_EXAMPLE}`)
- **UI Components**: {UI_COMPONENT_NAMING} (e.g., `{UI_COMPONENT_EXAMPLE}`)
- **Utilities**: {UTILITY_NAMING} (e.g., `{UTILITY_EXAMPLE}`)

## Project-Specific Patterns

### {MAIN_FEATURE} Management

- {MAIN_ENTITIES} are typed with `{TYPE_INTERFACE}` interface from `{TYPES_PATH}`
- {ROUTING_PATTERN}: `{ROUTE_EXAMPLE}`
- Static generation with `{STATIC_GENERATION_FUNCTION}()`
- {FEATURE_FUNCTIONALITY} on {FEATURE_PAGE}

### UI Component Usage

- Import {UI_LIBRARY} components from `{UI_COMPONENTS_PATH}`
- Use {ICON_LIBRARY} for consistent iconography
- Skeleton loading states for async content
- Toast notifications via `{TOAST_COMPONENT_PATH}`

### State Management

- Client components use React hooks for local state
- {STATE_DESCRIPTION} managed in {STATE_LOCATION}
- Global {AUTH_STATE} via {AUTH_CONTEXT}
- No additional global state management needed

### Image Handling

- {IMAGE_COMPONENT} for optimization
- Add "priority" attribute for critical images
- {IMAGE_STORAGE} for image uploads in admin interface
- Placeholder images: `{PLACEHOLDER_PATTERN}` pattern
- `{AI_HINT_ATTRIBUTE}` attributes for AI image suggestions

## {BACKEND_SERVICE} Integration (COMPLETED)

{BACKEND_SERVICE} is fully integrated with production-ready features:

- ✅ {DATABASE} database for {DATA_ENTITIES}
- ✅ {STORAGE_SERVICE} for image uploads
- ✅ {AUTH_SERVICE} for admin access
- ✅ Security rules and data validation
- ✅ Static data fallback for resilience

### Admin Features Implementation

✅ **COMPLETED** - All admin features are fully functional:

**Admin Dashboard** (`{ADMIN_DASHBOARD_PATH}`):

- ✅ {ADMIN_FEATURE_1}
- ✅ {ADMIN_FEATURE_2}
- ✅ {ADMIN_FEATURE_3}
- ✅ {ADMIN_FEATURE_4}
- ✅ {ADMIN_FEATURE_5}
- ✅ {ADMIN_FEATURE_6}

**Admin Components** (`{ADMIN_COMPONENTS_PATH}`):

- ✅ `{ADMIN_FORM_COMPONENT}` - {ADMIN_FORM_DESCRIPTION}
- ✅ `{ADMIN_LIST_COMPONENT}` - {ADMIN_LIST_DESCRIPTION}
- ✅ `{ADMIN_UPLOAD_COMPONENT}` - {ADMIN_UPLOAD_DESCRIPTION}
- ✅ `{ADMIN_EDITOR_COMPONENT}` - {ADMIN_EDITOR_DESCRIPTION}
- ✅ `{ADMIN_SIDEBAR_COMPONENT}` - {ADMIN_SIDEBAR_DESCRIPTION}

**Authentication Flow** (COMPLETED):

- ✅ {AUTH_SERVICE} integration
- ✅ Protected routes with middleware
- ✅ Login/logout functionality
- ✅ Session management with {AUTH_CONTEXT}

**Data Management** (COMPLETED):

- ✅ {BACKEND_SERVICE} Service (`{DATA_SERVICE_PATH}`)
- ✅ CRUD operations with error handling
- ✅ Real-time updates for admin interface
- ✅ Fallback to static data for resilience

## Recent UI Improvements ({IMPROVEMENT_DATE})

### Enhanced {MAIN_FEATURE} Layout

**Wider Content Area**:

- Container width increased from `{OLD_WIDTH}` to `{NEW_WIDTH}`
- {CONTENT_AREA}: `{RESPONSIVE_CLASS}` with responsive growth
- Better content proportions for large monitors

**Improved {COMPONENT} Positioning**:

- {COMPONENT_FEATURE} moved to {NEW_POSITION}
- {COMPONENT_FEATURE} width increased from `{OLD_COMPONENT_WIDTH}` to `{NEW_COMPONENT_WIDTH}` for better readability
- Fixed sticky positioning: `{STICKY_CLASS}` (accounts for navbar height)

**Enhanced Responsive Behavior**:

- Mobile/Tablet: Vertical stack (`{MOBILE_LAYOUT}`) with `{MOBILE_GAP}`
- Desktop: Side-by-side layout (`{DESKTOP_LAYOUT}`) with `{DESKTOP_GAP}`
- Better content flow across all screen sizes

**Navbar Collision Fixes**:

- Admin sidebar: `{ADMIN_SIDEBAR_POSITION}` with `{ADMIN_SIDEBAR_HEIGHT}`
- {CONTENT_HEADINGS}: `{SCROLL_OFFSET_CLASS}` for proper anchor positioning
- {NAVIGATION_COMPONENT}: `{NAV_POSITION_CLASS}` prevents navbar overlap

### Icon System Migration

- ✅ Replaced {OLD_ICON_LIBRARY} with {NEW_ICON_LIBRARY}
- ✅ Updated all components: {UPDATED_COMPONENTS}
- ✅ Consistent iconography throughout the application

### Enhanced {FEATURE} Features

**{FEATURE_IMPROVEMENT_1}**:

- {IMPROVEMENT_DESCRIPTION_1}
- {IMPROVEMENT_DESCRIPTION_2}
- {IMPROVEMENT_DESCRIPTION_3}

**{FEATURE_IMPROVEMENT_2}**:

- {IMPROVEMENT_DESCRIPTION_4}
- {IMPROVEMENT_DESCRIPTION_5}
- {IMPROVEMENT_DESCRIPTION_6}

## Testing Patterns

### Unit Testing Recommendations

**Component Testing** (using {TESTING_FRAMEWORK}):

```bash
{TESTING_INSTALL_COMMAND}
```

**Key areas to test**:

- `{TEST_COMPONENT_1}` - {TEST_DESCRIPTION_1}
- `{TEST_COMPONENT_2}` - {TEST_DESCRIPTION_2}
- Admin forms - Validation, submission, error states
- AI flows - Input/output validation, error handling

**Test file naming**: `{TEST_FILE_PATTERN}` alongside components

**Integration Testing**:

- {INTEGRATION_TEST_1}
- {INTEGRATION_TEST_2}
- {INTEGRATION_TEST_3}
- {INTEGRATION_TEST_4}

**E2E Testing** ({E2E_FRAMEWORK} recommended):

- {E2E_TEST_1}
- {E2E_TEST_2}
- {E2E_TEST_3}

## Common Issues & Solutions

### Styling Problems

- Always check CSS variable definitions in `{GLOBAL_CSS_PATH}`
- Ensure dark mode variants are defined for both `:root` and `{DARK_MODE_CLASS}`
- Use `{CLASSNAME_UTILITY}` utility instead of manual className concatenation

### Import Paths

- Use `{PATH_ALIAS}` alias for `{SOURCE_DIRECTORY}` directory
- UI components: `{UI_IMPORT_PATTERN}`
- Types: `{TYPES_IMPORT_PATTERN}`
- Utils: `{UTILS_IMPORT_PATTERN}`

### {AI_INTEGRATION} Development

- Start {AI_TOOL} dev server before testing AI flows
- Use proper {VALIDATION_LIBRARY} schemas for input/output validation
- Server actions require `'use server'` directive
- **Prompt optimization**: Current {AI_PROMPT_TYPE} prompt needs fine-tuning for better results
- **Error handling**: Add try-catch blocks and fallback responses
- **Caching**: Implement response caching to reduce AI API calls
- **Testing flow**: Test in {AI_TOOL} UI (`{AI_DEV_COMMAND}`) before integration

### {AI_INTEGRATION} Flow Improvements Needed

**Current Issues**:

- Basic prompt lacks context and tone guidance
- No error handling for API failures
- No caching mechanism for repeated requests
- Limited input validation

**Optimization Pattern**:

```typescript
// Enhanced prompt with context
const prompt = ai.definePrompt({
  name: "{PROMPT_NAME}",
  input: { schema: {INPUT_SCHEMA} },
  output: { schema: {OUTPUT_SCHEMA} },
  prompt: `{ENHANCED_PROMPT_TEMPLATE}`,
});

// Add error handling and caching
const {FLOW_NAME} = ai.defineFlow(
  {
    name: "{FLOW_NAME}",
    inputSchema: {INPUT_SCHEMA},
    outputSchema: {OUTPUT_SCHEMA},
  },
  async (input) => {
    try {
      // Check cache first
      const cached = await getCachedResult(input.{INPUT_FIELD});
      if (cached) return cached;

      const { output } = await prompt(input);

      // Cache successful result
      await cacheResult(input.{INPUT_FIELD}, output);

      return output!;
    } catch (error) {
      // Fallback response
      return {
        {OUTPUT_FIELD}: "{FALLBACK_RESPONSE}",
      };
    }
  }
);
```

## Feature Implementation Workflow

### Feature Tracking System

This project uses a structured feature tracking system located in the `features/` directory:

- **Before implementing any feature**: Update the corresponding markdown file in `features/`
- **During implementation**: Log progress and challenges in the feature's markdown file
- **After completion**: Update status and document lessons learned
- **Always update**: This copilot instructions file when new patterns emerge

### Feature Status Tracking

Check `features/README.md` for current implementation status and priorities:

- 🔄 Not Started → 🚧 In Progress → ✅ Completed
- Each feature has detailed implementation steps and testing strategies
- Feature dependencies are clearly documented

### Implementation Sequence

1. **{FOUNDATION_FEATURE}** (`features/{FOUNDATION_FEATURE_FILE}`) - {FOUNDATION_DESCRIPTION}
2. **{FEATURE_2}** (`features/{FEATURE_2_FILE}`) - {FEATURE_2_DESCRIPTION}
3. **{FEATURE_3}** (`features/{FEATURE_3_FILE}`) - {FEATURE_3_DESCRIPTION}
4. **{FEATURE_4}** (`features/{FEATURE_4_FILE}`) - {FEATURE_4_DESCRIPTION}
5. **{FEATURE_5}** (`features/{FEATURE_5_FILE}`) - {FEATURE_5_DESCRIPTION}
6. **Additional features** as documented in individual files

### Documentation Requirements

When implementing features, always:

- Update feature markdown files with progress
- Document new patterns in this file
- Add test cases and examples
- Note any architectural decisions or changes

## Documentation Organization

### Folder Structure

All documentation files must be organized according to this structure:

- **`docs/`** - All implementation documentation, enhancement tracking, deployment guides, and project management files
- **`features/`** - Feature-specific implementation tracking and status (already established)
- **`.github/`** - GitHub-specific documentation including this copilot instructions file
- **Root level** - Only `README.md` should remain at root level

### Documentation Categories

**Core Project Documentation** (`docs/`):

- Project summaries and overviews
- Todo lists and task tracking
- Deployment and operational guides
- Architecture documentation

**Implementation Documentation** (`docs/`):

- Component and feature implementation guides
- Enhancement tracking (UI/UX improvements)
- Technical decision documentation
- Code examples and patterns

**Feature Tracking** (`features/`):

- Feature-specific implementation status
- Requirements and specifications
- Testing strategies and results
- Feature dependencies and relationships

### File Naming Conventions

- **Implementation docs**: `{DOCS_NAMING_PATTERN}` (e.g., `{DOCS_EXAMPLE}`)
- **General docs**: `{GENERAL_DOCS_NAMING}` (e.g., `{GENERAL_DOCS_EXAMPLE}`)
- **Feature tracking**: `{FEATURE_NAMING}` (e.g., `{FEATURE_EXAMPLE}`)

### Documentation Standards

#### When creating new documentation:

1. **Always save to appropriate folder**: `docs/` for implementation/enhancement docs, `features/` for feature tracking
2. **Include clear headers**: Structure with proper markdown hierarchy
3. **Add status tracking**: Include completion status and next steps
4. **Provide code examples**: Include relevant code snippets
5. **Cross-reference**: Link to related documentation and source files
6. **Update indexes**: Update README files in both `docs/` and `features/` directories

### Mandatory Documentation Actions

- **Before implementing features**: Update corresponding file in `features/`
- **During implementation**: Log progress and technical decisions in `docs/`
- **After completion**: Update status in both `features/` and `docs/` as needed
- **Always update**: This copilot instructions file when new patterns emerge

## Environment Variables & Deployment

### Environment Variable Management

- **Development**: Use `.env.local` for local development
- **Production**: Set environment variables in deployment platform (e.g., Vercel, Netlify)
- **Pattern**: Use `{ENV_VAR_PREFIX}` prefix for client-side variables
- **Access**: Import from centralized configuration files rather than direct `process.env` access

### Common Environment Variables

```bash
# Core Application
{ENV_VAR_PREFIX}_SITE_URL={SITE_URL}
{ENV_VAR_PREFIX}_GA_ID={ANALYTICS_ID}

# Backend Integration
{ENV_VAR_PREFIX}_{BACKEND_VAR_1}={BACKEND_VALUE_1}
{ENV_VAR_PREFIX}_{BACKEND_VAR_2}={BACKEND_VALUE_2}

# External Services
{ENV_VAR_PREFIX}_{SERVICE_VAR_1}={SERVICE_VALUE_1}
{ENV_VAR_PREFIX}_{SERVICE_VAR_2}={SERVICE_VALUE_2}
```

### Deployment Considerations

- **Build Time**: Environment variables are replaced at build time for `{ENV_VAR_PREFIX}_*` variables
- **Production Issues**: Always verify environment variables are set in deployment platform
- **Centralized Config**: Use configuration files like `lib/{CONFIG_FILE}.ts` for reliable access
- **Testing**: Test environment variable access in both development and production builds

## Key Files to Reference

- `{TYPES_FILE}` - Core TypeScript definitions
- `{DATA_FILE}` - Static content structure
- `{GLOBAL_CSS_PATH}` - CSS variables and theming
- `{TAILWIND_CONFIG}` - Design system configuration
- `{UI_COMPONENTS_PATH}` - UI component implementations
- `features/` - Feature implementation tracking and documentation
- `docs/` - Implementation documentation and enhancement tracking

---

## Template Usage Instructions

### How to Use This Template

1. **Copy this file** to your new project as `.github/copilot-instructions.md`
2. **Replace all placeholders** (items in `{CURLY_BRACES}`) with project-specific values
3. **Update sections** that don't apply to your project or add new ones as needed
4. **Maintain documentation** by updating this file as your project evolves

### Key Placeholders to Replace

**Project Identity:**

- `{PROJECT_NAME}` - Your project name
- `{PROJECT_DESCRIPTION}` - Brief project description
- `{TECH_STACK}` - Main technology stack

**Technical Stack:**

- `{FRAMEWORK}` - Main framework (Next.js, React, etc.)
- `{STYLING_FRAMEWORK}` - Styling solution (Tailwind CSS, etc.)
- `{UI_LIBRARY}` - UI component library (shadcn/ui, etc.)
- `{BACKEND_SERVICE}` - Backend service (Firebase, Supabase, etc.)

**Development Environment:**

- `{DEV_COMMAND}` - Development server command
- `{PORT}` - Development server port
- `{AI_INTEGRATION}` - AI integration name if applicable

**File Paths & Patterns:**

- `{GLOBAL_CSS_PATH}` - Path to global CSS file
- `{TYPES_PATH}` - Path to TypeScript definitions
- `{UTILS_PATH}` - Path to utility functions

Remember to customize sections based on your specific project needs and remove any sections that don't apply.