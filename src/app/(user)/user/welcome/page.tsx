import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function WelcomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Mobile-First Responsive */}
      <section
        className="relative pt-20 sm:pt-32 md:pt-40 lg:pt-52 pb-10 sm:pb-12 md:pb-16 lg:pb-20 min-h-[100vh] w-full hero-background flex items-center"
        aria-label="Hero section"
      >
        {/* Overlay for better text readability - Darker on mobile */}
        <div aria-hidden="true"></div>

        <div className="relative w-full max-w-7xl mx-auto">
          <div className="max-w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-900 mb-4 sm:mb-6 drop-shadow-lg leading-tight">
              Smart Meal Planning
              <span className="block text-primary-700">Made Simple</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-800 mb-6 sm:mb-8 drop-shadow-md leading-relaxed max-w-2xl">
              Discover delicious recipes, plan your weekly meals, and get AI-powered cooking suggestions.
              SmartPlates makes home cooking easier and more organized than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/user/ai_feature" className="w-full sm:w-auto">
                <Button
                  className={cn(
                    "w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white",
                    "px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg",
                    "min-h-[48px] sm:min-h-[56px] h-auto rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2",
                    "transition-all duration-200"
                  )}
                  aria-label="Try Fridge AI feature"
                >
                  Try Fridge AI
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/user/my_meal_plan/current" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg",
                    "bg-primary-100/20 backdrop-blur-sm shadow-lg",
                    "border-primary-700 text-primary-900 hover:bg-primary-200 hover:text-primary-900",
                    "min-h-[48px] sm:min-h-[56px] h-auto rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2",
                    "transition-all duration-200"
                  )}
                  aria-label="Plan your meals"
                >
                  Plan Your Meals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

