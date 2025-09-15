# SmartPlates Component Patterns

## Überblick

Diese Dokumentation beschreibt die selbst entwickelten Component Patterns in SmartPlates. Diese Patterns gewährleisten Konsistenz, Wiederverwendbarkeit und Wartbarkeit des Codes.

## 🧭 Layout Components

### 1. Navbar Component (`src/components/layout/Navbar.tsx`)

**Zweck**: Hauptnavigation mit Authentifizierung und responsivem Design

#### Pattern-Struktur
```tsx
export default function Navbar() {
  // State Management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Context Integration
  const { user, isAuthenticated, isAdmin, signIn, signOut } = useAuth();
  
  // Effects für Persistenz
  useEffect(() => {
    // Dark Mode Initialisierung
  }, []);
  
  return (
    <nav className="navbar-bg sticky top-0 z-50">
      {/* Desktop Layout */}Outlined below are some popular desktop environments and troubleshooting steps that may help if the keyring is misconfigured.


      {/* Mobile Layout */}
      {/* Mobile Menu */}
    </nav>
  );
}
```

#### Key Patterns
- **State Management**: Lokaler useState für UI-Zustand
- **Context Integration**: useAuth Hook für globalen Auth-Zustand
- **Responsive Design**: `hidden md:block` und `md:hidden` für Layout-Switching
- **Accessibility**: Vollständige ARIA-Labels und Keyboard-Navigation

#### Implementation Details
```tsx
// Logo und Brand Pattern
<div className="flex items-center space-x-4">
  <Link href="/" className="flex items-center space-x-2">
    <ChefHat className="h-8 w-8 text-primary-500" />
    <span className="text-xl font-bold text-foreground">SmartPlates</span>
  </Link>
</div>

// Navigation Link Pattern
<Link
  href="/recipe"
  className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
  role="menuitem"
  tabIndex={0}
>
  Recipes
</Link>

// Mobile Menu Toggle Pattern
<Button
  variant="ghost"
  onClick={toggleMenu}
  className="text-foreground shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  aria-label={isMenuOpen ? 'Close main menu' : 'Open main menu'}
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
>
  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
</Button>
```

#### Responsive Patterns
- **Desktop**: Horizontale Navigation mit Dropdown-Menüs
- **Mobile**: Hamburger-Menü mit Vollbild-Navigation
- **Touch-Optimiert**: Große Touch-Targets (`min-h-[48px]`)

### 2. Footer Component (`src/components/layout/Footer.tsx`)

**Zweck**: Site-weite Fußzeile mit Links und Informationen

#### Pattern-Struktur
```tsx
export default function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Multi-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          {/* Quick Links */}
          {/* Legal Links */}
          {/* Social Media */}
        </div>
      </div>
    </footer>
  );
}
```

#### Key Patterns
- **Grid Layout**: Responsive Grid (`grid-cols-1 md:grid-cols-4`)
- **Link Groups**: Organisierte Navigation-Strukturen
- **Brand Consistency**: Logo und Farbschema-Verwendung

### 3. Sidebar Component (`src/components/layout/Sidebar.tsx`)

**Zweck**: Benutzer-spezifische Seitennavigation

#### Pattern-Struktur
```tsx
export default function Sidebar({ className, ...props }) {
  return (
    <aside className={cn("sidebar-base-classes", className)} {...props}>
      {/* Navigation Groups */}
      {/* User-specific Content */}
    </aside>
  );
}
```

## 📊 Card Components

### 1. InfoCard Component (`src/components/cards/InfoCard.tsx`)

**Zweck**: Wiederverwendbare Informations-Karten

#### Pattern-Struktur
```tsx
interface InfoCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'highlighted' | 'muted';
  className?: string;
}

export default function InfoCard({
  title,
  description,
  icon,
  action,
  variant = 'default',
  className,
  ...props
}: InfoCardProps) {
  return (
    <div
      className={cn(
        // Base Styles
        "bg-card rounded-lg shadow-md border border-border p-4 sm:p-6",
        // Variants
        variant === 'highlighted' && "border-primary-200 bg-primary-50",
        variant === 'muted' && "bg-neutral-50 border-neutral-200",
        // Responsive
        "hover:shadow-lg transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-primary-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm sm:text-base text-foreground-muted mb-4">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-auto">
          {action}
        </div>
      )}
    </div>
  );
}
```

#### Key Patterns
- **Variant System**: Multiple Darstellungsmodi
- **Flexible Content**: Optional Icon, Description, Action
- **Responsive Typography**: Mobile-first Text-Größen
- **TypeScript**: Vollständige Typisierung

### 2. RecipeCard Component (`src/components/recipe/RecipeCard.tsx`)

**Zweck**: Rezept-spezifische Karten mit strukturierten Daten

#### Pattern-Struktur
```tsx
interface RecipeCardProps {
  recipe: Recipe;
  showSaveButton?: boolean;
  onSave?: (recipeId: string) => void;
  className?: string;
}

export default function RecipeCard({
  recipe,
  showSaveButton = false,
  onSave,
  className,
  ...props
}: RecipeCardProps) {
  return (
    <article
      className={cn(
        "bg-card rounded-lg shadow-md border border-border overflow-hidden",
        "hover:shadow-lg hover:scale-102 transition-all duration-300",
        "focus-within:ring-2 focus-within:ring-primary-500",
        className
      )}
      {...props}
    >
      {/* Image Container */}
      <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 relative">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 text-primary-600" />
          </div>
        )}
        {/* Overlay Info */}
        <div className="absolute inset-0 bg-black/20 flex items-end p-4">
          <span className="text-white font-semibold text-sm bg-black/50 px-2 py-1 rounded">
            {recipe.cookTime} min
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          {recipe.title}
        </h3>
        <p className="text-sm sm:text-base text-foreground-muted mb-3 sm:mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        {/* Meta Information */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-foreground-muted">
            ⭐ {recipe.rating} ({recipe.reviewCount} reviews)
          </span>
          <span className="text-xs sm:text-sm font-medium text-primary-600">
            {recipe.category}
          </span>
        </div>
        
        {/* Actions */}
        {showSaveButton && onSave && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSave(recipe.id)}
              className="w-full"
            >
              Save Recipe
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
```

#### Key Patterns
- **Semantic HTML**: `<article>` für SEO und Accessibility
- **Image Optimization**: Next.js Image mit responsive Sizes
- **Conditional Rendering**: Optional Save-Button
- **Hover Effects**: Subtle Scale und Shadow-Änderungen
- **Focus Management**: Focus-within für Keyboard-Navigation

### 3. ProfileCard Component (`src/components/cards/ProfileCard.tsx`)

**Zweck**: Benutzer-Profil Informationen

#### Pattern-Struktur
```tsx
interface ProfileCardProps {
  user: User;
  isEditable?: boolean;
  onEdit?: () => void;
  className?: string;
}

export default function ProfileCard({
  user,
  isEditable = false,
  onEdit,
  className,
  ...props
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-md border border-border p-6",
        "space-y-4",
        className
      )}
      {...props}
    >
      {/* Avatar */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-primary-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
          <p className="text-sm text-foreground-muted">{user.email}</p>
        </div>
        {isEditable && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* User Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {user.recipeCount || 0}
          </div>
          <div className="text-sm text-foreground-muted">Recipes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {user.mealPlanCount || 0}
          </div>
          <div className="text-sm text-foreground-muted">Meal Plans</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {user.savedRecipes || 0}
          </div>
          <div className="text-sm text-foreground-muted">Saved</div>
        </div>
      </div>
    </div>
  );
}
```

## 📝 Form Components

### 1. LoginForm Component (`src/components/forms/LoginForm.tsx`)

**Zweck**: Benutzer-Authentifizierung Interface

#### Pattern-Struktur
```tsx
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export default function LoginForm({
  onSuccess,
  redirectTo = '/',
  className,
  ...props
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn('google');
      onSuccess?.();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-md border border-border p-6 sm:p-8",
        "max-w-md mx-auto",
        className
      )}
      {...props}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
        <p className="text-foreground-muted">Sign in to your SmartPlates account</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-muted border border-error rounded-md">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
      
      <Button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full bg-accent hover:bg-accent/90"
        aria-label="Sign in with Google"
      >
        {isLoading ? (
          <span className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Signing in...
          </span>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              {/* Google Icon SVG */}
            </svg>
            Continue with Google
          </>
        )}
      </Button>
    </div>
  );
}
```

#### Key Patterns
- **Loading States**: UI-Feedback während Async-Operationen
- **Error Handling**: Benutzerfreundliche Fehlermeldungen
- **Accessibility**: Proper Labels und Disabled States
- **Context Integration**: useAuth Hook Usage

### 2. RecipeForm Component (`src/components/forms/RecipeForm.tsx`)

**Zweck**: Rezept-Erstellung und -Bearbeitung

#### Pattern-Struktur
```tsx
interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export default function RecipeForm({
  recipe,
  onSubmit,
  onCancel,
  className,
  ...props
}: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: recipe?.title || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients || [''],
    instructions: recipe?.instructions || [''],
    cookTime: recipe?.cookTime || 30,
    servings: recipe?.servings || 4,
    category: recipe?.category || '',
    image: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors = validateRecipeForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: 'Failed to save recipe. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-6", className)}
      {...props}
    >
      {/* Form Fields */}
      <FormField
        label="Recipe Title"
        required
        error={errors.title}
      >
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter recipe title"
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
      </FormField>
      
      {/* Dynamic Ingredient List */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Ingredients
        </label>
        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={ingredient}
              onChange={(e) => updateIngredient(index, e.target.value)}
              placeholder="Enter ingredient"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeIngredient(index)}
              disabled={formData.ingredients.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addIngredient}
        >
          Add Ingredient
        </Button>
      </div>
      
      {/* Submit Actions */}
      <div className="flex gap-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : (recipe ? 'Update Recipe' : 'Create Recipe')}
        </Button>
      </div>
    </form>
  );
}
```

#### Key Patterns
- **Form State Management**: Lokaler useState für Form-Daten
- **Dynamic Fields**: Add/Remove-Funktionalität für Listen
- **Validation**: Client-side Validierung mit Error-Display
- **Loading States**: Submit-Button Disabled während Processing

## 🔍 Filter & Search Components

### 1. Filter Component (`src/components/recipe/Filter.tsx`)

**Zweck**: Rezept-Filterung und -Suche

#### Pattern-Struktur
```tsx
interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  className?: string;
}

export default function Filter({
  onFilterChange,
  initialFilters = {},
  className,
  ...props
}: FilterProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);
  
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);
  
  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-md border border-border p-4",
        className
      )}
      {...props}
    >
      {/* Search Input */}
      <div className="mb-4">
        <label htmlFor="search" className="sr-only">Search recipes</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            id="search"
            type="search"
            placeholder="Search recipes..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Filter Toggle for Mobile */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full mb-4"
        aria-expanded={isOpen}
      >
        Filters
        <ChevronDown className={cn(
          "ml-2 h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </Button>
      
      {/* Filter Content */}
      <div className={cn(
        "space-y-4",
        "md:block", // Always visible on desktop
        !isOpen && "hidden md:block" // Hidden on mobile when closed
      )}>
        {/* Category Filter */}
        <FilterSection title="Category">
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(category) || false}
                  onChange={(e) => {
                    const current = filters.categories || [];
                    const updated = e.target.checked
                      ? [...current, category]
                      : current.filter(c => c !== category);
                    updateFilter('categories', updated);
                  }}
                  className="rounded border-border text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-foreground">{category}</span>
              </label>
            ))}
          </div>
        </FilterSection>
        
        {/* Cook Time Filter */}
        <FilterSection title="Cook Time">
          <select
            value={filters.cookTime || ''}
            onChange={(e) => updateFilter('cookTime', e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">Any time</option>
            <option value="15">Under 15 min</option>
            <option value="30">Under 30 min</option>
            <option value="60">Under 1 hour</option>
          </select>
        </FilterSection>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-2">{title}</h3>
      {children}
    </div>
  );
}
```

#### Key Patterns
- **Callback Pattern**: onFilterChange für Parent-State Updates
- **Responsive Design**: Mobile Collapse/Expand Functionality
- **Debounced Search**: Implementiert mit useCallback
- **Compound Components**: FilterSection als Sub-Component

## 🎛️ UI Components (Eigene Implementierungen)

### 1. Buttons Component (`src/components/ui/Buttons.tsx`)

**Zweck**: Custom Button Variants außerhalb shadcn/ui

#### Pattern-Struktur
```tsx
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function CustomButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: CustomButtonProps) {
  const baseClasses = cn(
    // Base
    "inline-flex items-center justify-center gap-2",
    "font-medium rounded-lg transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "touch-manipulation",
    
    // Sizes
    size === 'sm' && "px-3 py-1.5 text-sm min-h-[32px]",
    size === 'md' && "px-4 py-2 text-base min-h-[40px]",
    size === 'lg' && "px-6 py-3 text-lg min-h-[48px] sm:min-h-[56px]",
    
    // Variants
    variant === 'primary' && [
      "bg-primary-600 text-white",
      "hover:bg-primary-700",
      "focus:ring-primary-500",
    ],
    variant === 'secondary' && [
      "bg-transparent border-2 border-primary-600 text-primary-600",
      "hover:bg-primary-600 hover:text-white",
      "focus:ring-primary-500",
    ],
    variant === 'success' && [
      "bg-green-600 text-white",
      "hover:bg-green-700",
      "focus:ring-green-500",
    ],
    variant === 'warning' && [
      "bg-yellow-600 text-white",
      "hover:bg-yellow-700",
      "focus:ring-yellow-500",
    ],
    variant === 'danger' && [
      "bg-red-600 text-white",
      "hover:bg-red-700",
      "focus:ring-red-500",
    ],
    
    className
  );
  
  return (
    <button
      className={baseClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          Loading...
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}
```

### 2. Inputs Component (`src/components/ui/Inputs.tsx`)

**Zweck**: Custom Input Variants mit Labels und Validation

#### Pattern-Struktur
```tsx
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
}

export function FormField({
  label,
  children,
  error,
  required = false,
  helpText,
  className,
  ...props
}: FormFieldProps) {
  const id = useId();
  
  return (
    <div className={cn("space-y-1", className)} {...props}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-describedby': error ? `${id}-error` : helpText ? `${id}-help` : undefined,
        'aria-invalid': error ? 'true' : 'false',
      })}
      
      {helpText && !error && (
        <p id={`${id}-help`} className="text-xs text-foreground-muted">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={`${id}-error`} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
}

export function TextInput({
  variant = 'default',
  className,
  ...props
}: TextInputProps) {
  return (
    <input
      className={cn(
        // Base
        "w-full px-3 py-2 sm:px-4 sm:py-3",
        "border rounded-md",
        "bg-background text-foreground",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        
        // Variants
        variant === 'default' && [
          "border-border",
          "focus:border-primary-500 focus:ring-primary-500",
        ],
        variant === 'error' && [
          "border-error",
          "focus:border-error focus:ring-error",
        ],
        variant === 'success' && [
          "border-green-500",
          "focus:border-green-500 focus:ring-green-500",
        ],
        
        className
      )}
      {...props}
    />
  );
}
```

### 3. Dropdowns Component (`src/components/ui/Dropdowns.tsx`)

**Zweck**: Custom Dropdown und Select Components

#### Pattern-Struktur
```tsx
interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  align = 'left',
  className,
  ...props
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);
  
  return (
    <div ref={dropdownRef} className={cn("relative", className)} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="w-full"
      >
        {trigger}
      </button>
      
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full sm:w-auto",
            "bg-card border border-border rounded-md shadow-lg",
            "py-1 max-h-60 overflow-auto",
            align === 'right' && "right-0",
            align === 'left' && "left-0"
          )}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function DropdownItem({
  children,
  className,
  ...props
}: DropdownItemProps) {
  return (
    <button
      className={cn(
        "w-full text-left px-4 py-2 text-sm",
        "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-800",
        "transition-colors duration-150",
        className
      )}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
}
```

## 🔄 Custom Hooks

### 1. useLocalStorage Hook

**Zweck**: Persistent Local Storage mit React State Sync

```tsx
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);
  
  return [storedValue, setValue];
}
```

### 2. useDebounce Hook

**Zweck**: Debouncing für Search und Input Fields

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
```

## 📋 Best Practices

### 1. Component Structure

```tsx
// 1. Imports (External -> Internal -> Types)
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentProps } from './types';

// 2. Interface Definition
interface ComponentProps {
  // Props definition
}

// 3. Component Implementation
export default function Component({
  prop1,
  prop2,
  className,
  ...props
}: ComponentProps) {
  // 4. State & Hooks
  const [state, setState] = useState(initialValue);
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 6. Event Handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // 7. Render
  return (
    <element
      className={cn("base-classes", "responsive-classes", className)}
      {...props}
    >
      {/* Component content */}
    </element>
  );
}
```

### 2. TypeScript Patterns

- **Props Interfaces**: Explizite Definition aller Props
- **Generic Components**: Verwendung von Generics für flexible Components
- **Ref Forwarding**: Proper ref handling mit forwardRef
- **Event Handlers**: Typisierte Event-Handler

### 3. Accessibility Patterns

- **Semantic HTML**: Verwendung korrekter HTML-Elemente
- **ARIA Labels**: Vollständige ARIA-Attribute
- **Keyboard Navigation**: Tab-Order und Keyboard-Events
- **Focus Management**: Proper Focus-Handling bei Interactions

### 4. Performance Patterns

- **React.memo**: Für Component Memoization
- **useCallback**: Für Event-Handler Stabilität
- **useMemo**: Für teure Berechnungen
- **Code Splitting**: Lazy Loading für große Components

---

Diese Component Patterns gewährleisten konsistente, wartbare und zugängliche Komponenten in der SmartPlates-Anwendung.
