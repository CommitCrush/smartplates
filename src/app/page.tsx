/**
 * SmartPlates Homepage
 * 
 * Features:
 * - Hero section with call-to-action
 * - Feature highlights
 * - Recipe showcase
 * - Getting started guide
 */

import Link from 'next/link';
import { ArrowRight, Brain, Calendar, ChefHat, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Layout from '@/components/layout/Layout';


export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section - Mobile-First Responsive */}
      <section 
        className="relative pt-20 sm:pt-32 md:pt-40 lg:pt-52 pb-10 sm:pb-12 md:pb-16 lg:pb-20 min-h-[100vh] w-full bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          imageRendering: 'crisp-edges',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        aria-label="Hero section"
      >
        {/* Overlay for better text readability - Darker on mobile */}
        <div aria-hidden="true"></div>
        
        <div className="relative z-10 pl-2 sm:pl-4 lg:pl-6">
          <div className="max-w-full sm:max-w-2xl lg:max-w-3xl ml-0 mt-20 sm:mt-32 md:mt-40">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-4 sm:mb-6 drop-shadow-lg leading-tight">
              Smart Meal Planning
              <span className="block text-primary-700">Made Simple</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-primary-800 mb-6 sm:mb-8 drop-shadow-md leading-relaxed">
              Discover delicious recipes, plan your weekly meals, and get AI-powered cooking suggestions. 
              SmartPlates makes home cooking easier and more organized than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button 
                  className={cn(
                    "w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white",
                    "px-3 sm:px-8 py-1.5 sm:py-4 text-xs sm:text-lg shadow-lg",
                    "min-h-[32px] sm:min-h-[56px] h-auto rounded-md", 
                    "focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2"
                  )}
                  aria-label="Get started with SmartPlates for free"
                >
                  Get Started Free
                  <ArrowRight className="ml-1 h-3 w-3 sm:ml-2 sm:h-5 sm:w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/recipe" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full sm:w-auto px-3 sm:px-8 py-1.5 sm:py-4 text-xs sm:text-lg",
                    "bg-primary-100/20 backdrop-blur-sm shadow-lg",
                    "border-primary-700 text-primary-900 hover:bg-primary-200 hover:text-primary-900",
                    "min-h-[32px] sm:min-h-[56px] h-auto rounded-md", 
                    "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                  )}
                  aria-label="Browse available recipes"
                >
                  Browse Recipes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile-First Responsive */}
      <section 
        className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background"
        aria-label="Features and benefits"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Everything You Need for Smart Cooking
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-full sm:max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              From recipe discovery to meal planning, we&apos;ve got your kitchen covered with intelligent features.
            </p>
          </div>
          
          {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-8" role="list">
            {/* AI Recipe Suggestions */}
            <div className="text-center p-4 sm:p-0" role="listitem">
              <div 
                className="bg-primary-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg"
                aria-hidden="true"
              >
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                AI-Powered Suggestions
              </h3>
              <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">
                Get personalized recipe recommendations based on your ingredients and preferences.
              </p>
            </div>

            {/* Meal Planning */}
            <div className="text-center p-4 sm:p-0" role="listitem">
              <div 
                className="bg-coral-500 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg"
                aria-hidden="true"
              >
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                Weekly Meal Planning
              </h3>
              <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">
                Plan your meals for the week with our intuitive drag-and-drop calendar.
              </p>
            </div>

            {/* Smart Grocery Lists */}
            <div className="text-center p-4 sm:p-0" role="listitem">
              <div 
                className="bg-primary-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg"
                aria-hidden="true"
              >
                <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                Smart Grocery Lists
              </h3>
              <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">
                Automatically generate shopping lists from your meal plans and recipes.
              </p>
            </div>

            {/* Recipe Collections */}
            <div className="text-center p-4 sm:p-0" role="listitem">
              <div 
                className="bg-coral-500 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg"
                aria-hidden="true"
              >
                <Star className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                Recipe Collections
              </h3>
              <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">
                Save and organize your favorite recipes in personalized collections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Showcase Section - Mobile-First Responsive */}
      <section 
        className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background-secondary"
        aria-label="Featured recipes"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Featured Recipes
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-full sm:max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Discover delicious recipes that will transform your cooking experience.
            </p>
          </div>
          
          {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12" role="list">
            {/* Recipe Card 1 */}
            <div 
              className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-border overflow-hidden"
              role="listitem"
            >
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
                <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 text-primary-600" aria-hidden="true" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm sm:text-base bg-black/50 px-2 py-1 rounded">
                    30 min
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  Mediterranean Quinoa Bowl
                </h3>
                <p className="text-sm sm:text-base text-foreground-muted mb-3 sm:mb-4 line-clamp-2">
                  A healthy and colorful bowl packed with Mediterranean flavors, fresh vegetables, and protein-rich quinoa.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-foreground-muted">⭐ 4.8 (324 reviews)</span>
                  <span className="text-xs sm:text-sm font-medium text-primary-600">Healthy</span>
                </div>
              </div>
            </div>

            {/* Recipe Card 2 */}
            <div 
              className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-border overflow-hidden"
              role="listitem"
            >
              <div className="aspect-video bg-gradient-to-br from-coral-100 to-coral-200 flex items-center justify-center relative">
                <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 text-coral-600" aria-hidden="true" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm sm:text-base bg-black/50 px-2 py-1 rounded">
                    45 min
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  Creamy Mushroom Risotto
                </h3>
                <p className="text-sm sm:text-base text-foreground-muted mb-3 sm:mb-4 line-clamp-2">
                  Rich and creamy Italian risotto with wild mushrooms, parmesan cheese, and fresh herbs.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-foreground-muted">⭐ 4.9 (156 reviews)</span>
                  <span className="text-xs sm:text-sm font-medium text-coral-600">Comfort Food</span>
                </div>
              </div>
            </div>

            {/* Recipe Card 3 */}
            <div 
              className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-border overflow-hidden"
              role="listitem"
            >
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-primary-600" aria-hidden="true" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm sm:text-base bg-black/50 px-2 py-1 rounded">
                    15 min
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  Asian Stir-Fry Noodles
                </h3>
                <p className="text-sm sm:text-base text-foreground-muted mb-3 sm:mb-4 line-clamp-2">
                  Quick and flavorful stir-fried noodles with fresh vegetables and savory Asian sauce.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-foreground-muted">⭐ 4.7 (289 reviews)</span>
                  <span className="text-xs sm:text-sm font-medium text-primary-600">Quick & Easy</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/recipe" 
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4",
                "min-h-[48px] sm:min-h-[56px]",
                "bg-transparent text-primary-600 border-2 border-primary-600",
                "hover:bg-primary-600 hover:text-white",
                "focus:outline-none focus:ring-4 focus:ring-primary-600/30",
                "rounded-lg font-semibold text-base sm:text-lg",
                "transition-all duration-200",
                "touch-manipulation"
              )}
              aria-label="Browse all recipes"
              role="button"
            >
              Browse All Recipes
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link href="/recipe">
              <Button variant="outline" size="lg">
                Alle Rezepte anzeigen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile-First Responsive */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-3 sm:mb-4 leading-tight">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary-700 mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
            Join thousands of home cooks who are already making meal planning easier with SmartPlates.
          </p>
          <Link href="/register">
            <button 
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4",
                "min-h-[48px] sm:min-h-[56px]",
                "text-foreground-inverse bg-accent hover:bg-accent/70",
                "border-2 border-accent hover:border-accent/70",
                "focus:outline-none focus:ring-4 focus:ring-accent/30",
                "rounded-lg font-semibold text-base sm:text-lg shadow-lg",
                "transition-all duration-200",
                "touch-manipulation"
              )}
              aria-label="Start your free trial with SmartPlates"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
