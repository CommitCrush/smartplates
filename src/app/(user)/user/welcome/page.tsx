import { cn } from '@/lib/utils';

export default function WelcomePage() {
  return (
    <main className={cn(
      'flex flex-col items-center justify-center min-h-[60vh] px-4',
      'bg-background text-foreground',
      'pt-16 pb-12 md:pt-24 md:pb-20'
    )}>
      <h1 className={cn(
        'text-4xl md:text-6xl font-extrabold mb-4',
        'text-primary'
      )}>
        Welcome to SmartPlates!
      </h1>
      <p className={cn(
        'text-lg md:text-2xl text-center max-w-2xl mb-8',
        'text-muted-foreground'
      )}>
        Your personal platform for meal planning, recipe discovery, and AI-powered kitchen inspiration. Organize your week, get smart grocery lists, and let our AI suggest recipes based on what’s in your fridge!
      </p>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <a
          href="/user/ai_feature"
          className={cn(
            'px-6 py-3 rounded-lg font-semibold',
            'bg-primary text-white hover:bg-primary-700',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'transition-colors text-center'
          )}
        >
          Try Fridge AI
        </a>
        <a
          href="/user/my_meal_plan/current"
          className={cn(
            'px-6 py-3 rounded-lg font-semibold',
            'bg-coral text-white hover:bg-coral-700',
            'focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2',
            'transition-colors text-center'
          )}
        >
          Plan Your Meals
        </a>
        <a
          href="/user/my-recipe"
          className={cn(
            'px-6 py-3 rounded-lg font-semibold',
            'bg-neutral-900 text-white hover:bg-neutral-700',
            'focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2',
            'transition-colors text-center'
          )}
        >
          Explore Recipes
        </a>
      </div>
      <span className="sr-only">SmartPlates is fully accessible and responsive.</span>
    </main>
  );
}

