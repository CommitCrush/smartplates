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
import { ChefHat, Brain, Calendar, ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative pt-52 pb-10 min-h-[80vh] bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          imageRendering: 'crisp-edges',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex mb-6">
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Smart Meal Planning
              <span className="block text-primary-300">Made Simple</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 drop-shadow-md">
              Discover delicious recipes, plan your weekly meals, and get AI-powered cooking suggestions. 
              SmartPlates makes home cooking easier and more organized than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 shadow-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/recipe">
                <Button variant="outline" size="lg" className="px-8 py-3 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                  Browse Recipes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Smart Cooking
            </h2>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              From recipe discovery to meal planning, we&apos;ve got your kitchen covered with intelligent features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI Recipe Suggestions */}
            <div className="text-center">
              <div className="bg-primary-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                AI-Powered Suggestions
              </h3>
              <p className="text-foreground-muted">
                Get personalized recipe recommendations based on your ingredients and preferences.
              </p>
            </div>

            {/* Meal Planning */}
            <div className="text-center">
              <div className="bg-coral-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Weekly Meal Planning
              </h3>
              <p className="text-foreground-muted">
                Plan your meals for the week with our intuitive drag-and-drop calendar.
              </p>
            </div>

            {/* Smart Grocery Lists */}
            <div className="text-center">
              <div className="bg-primary-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Smart Grocery Lists
              </h3>
              <p className="text-foreground-muted">
                Automatically generate shopping lists from your meal plans and recipes.
              </p>
            </div>

            {/* Recipe Collections */}
            <div className="text-center">
              <div className="bg-coral-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Recipe Collections
              </h3>
              <p className="text-foreground-muted">
                Save and organize your favorite recipes in personalized collections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Recipes Preview */}
            {/* Recipe Showcase */}
      <section className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Recipes
            </h2>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              Discover popular recipes loved by our community of home cooks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background-card rounded-lg shadow-sm border border-border overflow-hidden transform transition-[transform,shadow,border-color] duration-700 ease-out hover:scale-102 hover:shadow-md hover:border-primary-200 cursor-pointer">
                <div className="p-6">
                  <ChefHat className="h-12 w-12 text-primary-600 mb-4 transition-colors duration-400 ease-out hover:text-coral-500" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Delicious Recipe {i}
                  </h3>
                  <p className="text-foreground-muted mb-4">
                    A wonderful recipe description that makes your mouth water and inspires you to cook.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-subtle">30 min</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-coral-500 fill-current" />
                      <span className="ml-1 text-sm text-foreground-muted">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground-inverse mb-4">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of home cooks who are already making meal planning easier with SmartPlates.
          </p>
          <Link href="/register">
            <Button variant="outline" size="lg" className=" text-foreground-inverse bg-accent hover:bg-accent/70 px-8 py-3">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
