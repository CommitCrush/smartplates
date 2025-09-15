# GitHub Copilot Instructions - SmartPlates

## Project Overview

**SmartPlates** is a Next.js 14 Full-Stack application focused on meal planning and recipe management. The platform provides recipe discovery, meal planning, AI-powered suggestions, and cookware recommendations with a complete MongoDB backend system.

## Architecture & Key Patterns

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with CSS custom properties
- **UI Components**: shadcn/ui with custom component system
- **AI Integration**: Google Cloud Vision AI for AI-powered features
- **Backend**: MongoDB integration for data persistence
- **Authentication**: Google Cloud Authentication
- **Storage**: Google Cloud Storage for images/videos
- **Deployment**: Vercel

### Component Architecture

```
src/
├── app/                 # Next.js 14 App Router pages
├── components/          # React components
│   └── ui/             # Reusable shadcn/ui components
├── lib/                # Utilities and data
├── types/              # TypeScript definitions
├── ai/                 # Google Cloud Vision AI flows
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── middleware/         # Next.js middleware
├── models/             # Database models
├── services/           # External service integrations
└── utils/              # Utility functions
```

### Design System

- **Primary Color**: Green (#22c55e) - used for interactive elements
- **Accent Color**: Coral (#ff6b6b) - used for CTAs and highlights
- **Fonts**:
  - Headlines: `Inter` (sans-serif)
  - Body: `Inter` (sans-serif)
- **Dark Mode**: Class-based with TailwindCSS custom properties
- **Component Pattern**: All UI components use `cn` utility for className merging

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
- Never alter the database schema or adding a new collection without explicitly showing the user the code and requesting confirmation.
- Never interact with GitHub directly (e.g., pushing commits, creating branches) without user confirmation.

### Styling Conventions

- Use CSS custom properties defined in `src/app/globals.css`
- Always use `cn` from `src/lib/utils.ts` for conditional classes
- Follow shadcn/ui patterns: `cn(baseClasses, conditionalClasses, className)`
- Dark mode support via `dark` class with CSS custom property color values
- **File Size Limit**: No single file should exceed 300 lines of code
- **Code Quality**: All code must be reusable, clean, and easily readable for beginners
- **Refactoring**: Break down complex components into smaller, reusable parts
- Ensure all components meet WCAG 2.1 AA accessibility standards

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

- **Current**: MongoDB integration maintaining same interface
- **Pattern**: Export const arrays with TypeScript types

### AI Integration

- **Google Cloud Vision AI flows** in `src/ai/flows/` for AI-powered features
- **Server actions pattern**: `'use server'` directive at top of flow files
- **Schema validation**: Input/output schemas using Zod for type safety
- **Current implementation**: `analyze-fridge` flow for ingredient recognition
- **Optimization needed**: Fine-tune prompts, add error handling, implement caching
- **Pattern**: Define prompt → Define flow → Export server action function
- **Testing**: Use Google Cloud Console to test flows before integration

## Development Commands

### Primary Workflows

```bash
bun run dev          # Development server on port 3000 with Next.js
bun run build        # Production build
bun run start        # Production server
bun run lint         # ESLint validation
bun run type-check   # TypeScript validation
```

### File Naming Conventions

- **Pages**: `page.tsx` (App Router)
- **Components**: PascalCase (e.g., `RecipeCard.tsx`)
- **UI Components**: kebab-case (e.g., `button.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)

## Project-Specific Patterns

### Recipe Management

- Recipes are typed with `Recipe` interface from `src/types/recipe.d.ts`
- Dynamic routing: `/recipe/[id]`
- Static generation with `generateStaticParams()`
- Recipe categories and filtering on `/recipe` page

### Meal Planning

- Weekly calendar view for meal organization
- Drag-and-drop interface for recipe assignment
- Automatic grocery list generation
- Saved meal plans for reuse

### User Management

- Google Cloud Authentication integration
- Role-based access control (User/Admin)
- Profile management with settings
- Privacy controls for public/private profiles

### UI Component Usage

- Import shadcn/ui components from `src/components/ui`
- Use Lucide React for consistent iconography
- Skeleton loading states for async content
- Toast notifications via `src/components/ui/toast`
- Ensure all components meet WCAG 2.1 AA accessibility standards

### State Management

- Client components use React hooks for local state
- Authentication state managed in `src/context/authContext.tsx`
- Global user preferences via React Context
- No additional global state management needed

### Image Handling

- Next.js Image component for optimization
- Add "priority" attribute for critical images
- Google Cloud Storage for image uploads in admin and user interface
- Placeholder images: `/placeholder-recipe.jpg` pattern
- `ai-hint` attributes for AI image suggestions

## MongoDB Integration

MongoDB is fully integrated with production-ready features:

- ✅ MongoDB database for users, recipes, meal plans, categories
- ✅ Google Cloud Storage for image uploads
- ✅ Google Cloud Authentication for admin and user access
- ✅ Security rules and data validation
- ✅ Static data fallback for resilience

### Admin Features Implementation

✅ **COMPLETED** - All admin features are fully functional:

**Admin Dashboard** (`src/app/(admin)/admin`):

- ✅ Overview of statistics users, most daved recipes and commisions from cookware
- ✅ User management and Recipe management and moderation
- ✅ Cookware commission tracking
- ✅ Analytics and reporting
- ✅ System settings management
- ✅ Content moderation tools

**Admin Components** (`src/components/manage_*`):

- ✅ `UserManagementForm` - Create/edit user accounts
- ✅ `RecipeManagementList` - Recipe moderation interface
- ✅ `CookwareUploadForm` - Cookware product management
- ✅ `StatisticsEditor` - Analytics dashboard
- ✅ `AdminSidebar` - Navigation for admin functions

**Authentication Flow** (COMPLETED):

- ✅ Google Cloud Authentication integration
- ✅ Protected routes with middleware
- ✅ Login/logout functionality
- ✅ Session management with AuthContext

**Data Management** (COMPLETED):

- ✅ MongoDB Service (`src/lib/db.ts`)
- ✅ CRUD operations with error handling
- ✅ Real-time updates for admin interface
- ✅ Fallback to static data for resilience

## Recent UI Improvements

### Enhanced Recipe Layout

**Wider Content Area**:

- Container width increased from `max-w-4xl` to `max-w-7xl`
- Main content: `flex-1` with responsive growth
- Better content proportions for large monitors

**Improved Filter Positioning**:

- Filter sidebar moved to right side
- Sidebar width increased from `w-64` to `w-80` for better readability
- Fixed sticky positioning: `sticky top-20` (accounts for navbar height)

**Enhanced Responsive Behavior**:

- Mobile/Tablet: Vertical stack (`flex-col`) with `gap-6`
- Desktop: Side-by-side layout (`lg:flex-row`) with `lg:gap-8`
- Better content flow across all screen sizes

**Navbar Collision Fixes**:

- User sidebar: `top-16` with `h-[calc(100vh-4rem)]`
- Admin sidebar: `top-16` with `h-[calc(100vh-4rem)]`
- Recipe headings: `scroll-mt-20` for proper anchor positioning
- Recipe navigation: `sticky top-16` prevents navbar overlap

### Icon System Migration

- ✅ Replaced React Icons with React-Icons
- ✅ Updated all components: Navbar, Footer, Forms, Cards
- ✅ Consistent iconography throughout the application

### Enhanced Meal Planning Features

**Calendar Integration**:

- Weekly meal planning calendar view
- Drag-and-drop recipe assignment
- Visual meal organization interface

**Smart Grocery Lists**:

- Automatic ingredient aggregation
- Quantity calculation and optimization
- Export and sharing capabilities

## Testing Patterns

### Unit Testing Recommendations

**Component Testing** (using Jest + React Testing Library):

```bash
bun add --dev jest @testing-library/react @testing-library/jest-dom
```

**Key areas to test**:

- `RecipeCard` - Recipe display and interaction
- `MealPlanCalendar` - Calendar functionality and drag-drop
- Admin forms - Validation, submission, error states
- AI flows - Input/output validation, error handling

**Test file naming**: `*.test.tsx` alongside components

**Integration Testing**:

- Recipe search and filtering
- Meal plan creation and modification
- User authentication flows
- Admin management operations

**E2E Testing** (Cypress recommended):

- Complete user meal planning workflow
- Admin recipe management workflow
- AI-powered recipe suggestions
- Authentication and authorization

## Common Issues & Solutions

### Styling Problems

- Always check CSS variable definitions in `src/app/globals.css`
- Ensure dark mode variants are defined for both `:root` and `.dark`
- Use `cn` utility instead of manual className concatenation

### Import Paths

- Use `@` alias for `src` directory
- UI components: `@/components/ui/*`
- Types: `@/types/*`
- Utils: `@/lib/*`

### AI Integration Development

- Start Google Cloud Console before testing AI flows
- Use proper Zod schemas for input/output validation
- Server actions require `'use server'` directive
- **Prompt optimization**: Current vision prompt needs fine-tuning for better results
- **Error handling**: Add try-catch blocks and fallback responses
- **Caching**: Implement response caching to reduce AI API calls
- **Testing flow**: Test in Google Cloud Console before integration

### Google Cloud Vision AI Flow Improvements Needed

**Current Issues**:

- Basic prompt lacks context and tone guidance
- No error handling for API failures
- No caching mechanism for repeated requests
- Limited input validation

**Optimization Pattern**:

```typescript
// Enhanced prompt with context
const analyzeImage = async (imageData: string) => {
  try {
    // Check cache first
    const cached = await getCachedResult(imageData);
    if (cached) return cached;

    const response = await vision.textDetection({
      image: { content: imageData }
    });

    // Process and cache successful result
    const result = processVisionResponse(response);
    await cacheResult(imageData, result);

    return result;
  } catch (error) {
    // Fallback response
    return {
      ingredients: [],
      suggestions: ["Unable to analyze image. Please try again."],
    };
  }
};
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

**Timeline: 4 Weeks Total - Focus on Core Features First**

**Week 1:** Foundation & Authentication
1. **Project Setup & Authentication** (`features/01-project-setup.md`) - Foundation setup
2. **User Management System** (`features/02-user-management.md`) - User accounts and profiles

**Week 2:** Core Recipe System
3. **Recipe Management** (`features/06-recipe-management.md`) - Core recipe functionality
4. **Recipe Display & Search** (`features/07-search-filter.md`) - Recipe discovery

**Week 3:** Meal Planning & Key Features
5. **Meal Planning** (`features/09-meal-planning.md`) - Weekly meal organization
6. **Grocery Lists** (`features/10-grocery-lists.md`) - Shopping list generation

**Week 4:** Polish & Advanced Features
7. **AI Integration** (`features/11-ai-integration.md`) - Smart recipe suggestions (if time permits)
8. **Admin Dashboard** (`features/03-admin-foundation.md`) - Basic admin functionality
9. **Testing & Deployment** - Final polish and deployment

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
- **Root level** - Only `README.md` and `FEATURE_ROADMAP.md` should remain at root level

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

- **Implementation docs**: `kebab-case.md` (e.g., `meal-planning-implementation.md`)
- **General docs**: `kebab-case.md` (e.g., `deployment-guide.md`)
- **Feature tracking**: `01-feature-name.md` (e.g., `01-project-setup.md`)

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
- **Production**: Set environment variables in deployment platform (Vercel)
- **Pattern**: Use `NEXT_PUBLIC_` prefix for client-side variables
- **Access**: Import from centralized configuration files rather than direct `process.env` access

### Common Environment Variables

```bash
# Core Application
NEXT_PUBLIC_SITE_URL=https://smartplates.app
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# MongoDB Integration
MONGODB_URI=mongodb://localhost:27017/smartplates
MONGODB_DB=smartplates

# Google Cloud Services
GOOGLE_CLOUD_PROJECT_ID=smartplates-project
GOOGLE_CLOUD_STORAGE_BUCKET=smartplates-storage
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### Deployment Considerations

- **Build Time**: Environment variables are replaced at build time for `NEXT_PUBLIC_*` variables
- **Production Issues**: Always verify environment variables are set in deployment platform
- **Centralized Config**: Use configuration files like `src/config/app.ts` for reliable access
- **Testing**: Test environment variable access in both development and production builds

## Next.js Performance Optimization Guidelines

### Critical Performance Patterns

Langsames Laden in Next.js-Projekten kann verschiedene Gründe haben. Häufig liegt es an einem großen JavaScript-Bundle, langsamer Datenabfrage oder unoptimierten Bildern.

#### 1. JavaScript Bundle Size Optimization

**Problem**: Große JavaScript-Bundle-Größe durch viele Komponenten, Bibliotheken oder Stylesheets.

**Lösungen**:

```tsx
// ✅ Use next/dynamic for code splitting
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Disable SSR for client-only components
});

// Lazy load admin components only when needed
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <div className="animate-pulse">Loading Dashboard...</div>
});

// Conditional imports for role-based components
const ConditionalComponent = dynamic(() => 
  import('@/components/AdminPanel').then(mod => ({ default: mod.AdminPanel })), 
  { ssr: false }
);
```

**Bundle Analysis Commands**:
```bash
# Analyze bundle size
ANALYZE=true bun run build

# Check bundle composition
bun add --dev @next/bundle-analyzer
```

#### 2. Data Fetching Optimization

**Problem**: Langsame Datenabfrage blockiert Server-Side Rendering.

**Lösungen**:

```tsx
// ✅ Use Static Site Generation for static content
export async function generateStaticParams() {
  const recipes = await getPopularRecipes();
  return recipes.map((recipe) => ({ id: recipe.id }));
}

// ✅ Cache API requests
import { unstable_cache } from 'next/cache';

const getCachedRecipes = unstable_cache(
  async () => getRecipes(),
  ['recipes'],
  { revalidate: 60 * 60 } // 1 hour cache
);

// ✅ Use streaming for better UX
import { Suspense } from 'react';

export default function RecipePage() {
  return (
    <div>
      <Suspense fallback={<RecipeSkeleton />}>
        <RecipeContent />
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>
        <RecipeComments />
      </Suspense>
    </div>
  );
}

// ✅ Parallel data fetching
async function getRecipeData(id: string) {
  const [recipe, comments, related] = await Promise.all([
    getRecipe(id),
    getComments(id),
    getRelatedRecipes(id)
  ]);
  return { recipe, comments, related };
}
```

#### 3. Client-Side Hydration Optimization

**Problem**: Langsame Client-Side-Hydration bei komplexen Komponenten.

**Lösungen**:

```tsx
// ✅ Minimize hydration complexity
import { useState, useEffect } from 'react';

// Avoid heavy computations during hydration
function OptimizedComponent() {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    // Heavy operations after hydration
    processHeavyData().then(setData);
  }, []);

  // Simple initial render
  if (!data) return <Skeleton />;
  
  return <ComplexComponent data={data} />;
}

// ✅ Use next/dynamic for client-only components
const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
);

// ✅ Selective hydration for interactive elements
function MealPlanPage() {
  return (
    <div>
      {/* Static content - no hydration needed */}
      <StaticHeader />
      
      {/* Interactive content - selective hydration */}
      <Suspense fallback={<CalendarSkeleton />}>
        <InteractiveCalendar />
      </Suspense>
    </div>
  );
}
```

#### 4. Image Optimization (CRITICAL for SmartPlates)

**Problem**: Unoptimierte Bilder verursachen lange Ladezeiten.

**Lösungen**:

```tsx
// ✅ Always use next/image for recipe images
import Image from 'next/image';

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <div className="recipe-card">
      <Image
        src={recipe.image}
        alt={recipe.title}
        width={400}
        height={300}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="rounded-lg object-cover"
        priority={recipe.featured} // For hero images
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD..." // Base64 placeholder
      />
    </div>
  );
}

// ✅ Lazy loading for recipe galleries
function RecipeGallery({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image, index) => (
        <Image
          key={index}
          src={image}
          alt={`Recipe step ${index + 1}`}
          width={300}
          height={200}
          loading="lazy" // Explicit lazy loading
          className="rounded"
        />
      ))}
    </div>
  );
}

// ✅ Optimize uploaded images before storage
async function optimizeAndUploadImage(file: File) {
  // Client-side compression before upload
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = () => {
    // Resize and compress
    canvas.width = Math.min(800, img.width);
    canvas.height = Math.min(600, img.height);
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        await uploadToCloudStorage(blob);
      }
    }, 'image/webp', 0.8); // WebP format, 80% quality
  };
  
  img.src = URL.createObjectURL(file);
}
```

#### 5. Performance Monitoring & Metrics

```tsx
// ✅ Monitor Core Web Vitals
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics
    console.log(metric);
    
    // Critical metrics for SmartPlates:
    // - LCP (Largest Contentful Paint): Recipe images loading
    // - FID (First Input Delay): Meal planning interactions
    // - CLS (Cumulative Layout Shift): Recipe card layouts
  }
}

// ✅ Performance budgets in next.config.ts
const nextConfig = {
  experimental: {
    optimizeCss: true,
    bundlePagesRouterDependencies: true
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
};
```

#### 6. SmartPlates-Specific Performance Patterns

```tsx
// ✅ Optimize meal planning calendar
function MealPlanCalendar() {
  // Virtual scrolling for large meal plans
  const [visibleWeeks, setVisibleWeeks] = useState(2);
  
  // Debounced drag-and-drop updates
  const debouncedUpdate = useCallback(
    debounce(async (planData) => {
      await updateMealPlan(planData);
    }, 500),
    []
  );

  return (
    <div className="meal-calendar">
      {/* Only render visible weeks */}
      {visibleWeeks.map(week => (
        <WeekView key={week.id} week={week} />
      ))}
    </div>
  );
}

// ✅ Optimize recipe search
function RecipeSearch() {
  const [searchResults, setSearchResults] = useState([]);
  
  // Debounced search with caching
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      const cached = sessionStorage.getItem(`search:${query}`);
      if (cached) {
        setSearchResults(JSON.parse(cached));
        return;
      }
      
      const results = await searchRecipes(query);
      sessionStorage.setItem(`search:${query}`, JSON.stringify(results));
      setSearchResults(results);
    }, 300),
    []
  );

  return (
    <div>
      <SearchInput onChange={debouncedSearch} />
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults results={searchResults} />
      </Suspense>
    </div>
  );
}

// ✅ Optimize admin dashboard
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <AdminSkeleton />,
  ssr: false // Admin dashboard doesn't need SEO
});

// ✅ Optimize AI features
function FridgeAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  
  const analyzeImage = useCallback(async (imageFile: File) => {
    setAnalyzing(true);
    
    try {
      // Compress image before sending to AI
      const compressedImage = await compressImage(imageFile);
      const result = await analyzeWithAI(compressedImage);
      return result;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return (
    <div className="ai-analysis">
      {analyzing ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-r-transparent rounded-full" />
          <span>Analyzing ingredients...</span>
        </div>
      ) : (
        <ImageUpload onUpload={analyzeImage} />
      )}
    </div>
  );
}
```

### Performance Checklist for SmartPlates

#### Before Deployment:
- [ ] Bundle size analysis completed (`ANALYZE=true bun run build`)
- [ ] All recipe images use `next/image` with proper sizing
- [ ] Heavy admin components use `dynamic` imports
- [ ] API routes implement caching where appropriate
- [ ] Core Web Vitals tested on mobile and desktop
- [ ] Meal planning interactions are smooth (< 100ms response)
- [ ] Recipe search is debounced and cached
- [ ] AI features have proper loading states and error handling

#### Production Monitoring:
- [ ] Web Vitals tracking implemented
- [ ] Performance budgets defined
- [ ] Critical user paths tested regularly
- [ ] Image optimization metrics monitored
- [ ] Bundle size increases tracked

## Key Files to Reference

- `src/types/recipe.d.ts` - Core TypeScript definitions
- `src/lib/db.ts` - Database connection and operations
- `src/app/globals.css` - CSS variables and theming
- `postcss.config.mjs` - PostCSS configuration (TailwindCSS setup)
- `src/components/ui/` - UI component implementations
- `features/` - Feature implementation tracking and documentation
- `docs/` - Implementation documentation and enhancement tracking

## SmartPlates Specific Features

### User & Viewer Features

**Authenticated Users**:
- Create and manage personal recipe collections
- Upload custom recipes with images/videos
- Plan weekly meals with drag-and-drop calendar
- Generate automated grocery lists
- Save and reuse meal plans
- Access AI-powered recipe suggestions
- Manage dietary preferences and restrictions

**Viewers (Non-authenticated)**:
- Browse public recipe collection
- View recipe details and instructions
- Use basic search and filter functionality
- Access cookware recommendations
- View meal planning examples


### Meal Planning System

- **Calendar View**: Weekly meal planning with drag-and-drop interface
- **Recipe Integration**: Direct recipe assignment to meal slots
- **Grocery Generation**: Automatic shopping list creation from meal plans
- **Plan Templates**: Save and reuse successful meal plans

### AI-Powered Features

- **Fridge Analysis**: Google Cloud Vision AI analyzes fridge photos
- **Ingredient Recognition**: Identifies available ingredients from images
- **Recipe Suggestions**: AI-powered recipe recommendations based on available ingredients
- **Smart Search**: Text-based AI recipe discovery

### International Market Focus

- **Localization**: Multi-language support based on user location
- **Local Ingredients**: Focus on ingredients available in user's regional supermarkets
- **Regional Affiliate Integration**: Cookware recommendations with local affiliate links (Amazon, IKEA, etc.)
- **International & European Measurements**: Metric system throughout the application
- **Currency & Pricing**: Localized pricing for cookware recommendations

### Revenue Model

- **Affiliate Commissions**: Cookware recommendations with tracking
- **Premium Features**: Advanced meal planning and AI features
- **Recipe Collections**: Curated recipe collections for specific diets
- **Meal Plan Templates**: Pre-made meal plans for different lifestyles

---

This file serves as the central reference for all development patterns, architectural decisions, and implementation guidelines for the SmartPlates project. Keep it updated as the project evolves and new patterns emerge.
