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
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <ChefHat className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Smart Meal Planning
              <span className="block text-green-600">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover delicious recipes, plan your weekly meals, and get AI-powered cooking suggestions. 
              SmartPlates makes home cooking easier and more organized than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/recipe">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Browse Recipes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Smart Cooking
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From recipe discovery to meal planning, we&apos;ve got your kitchen covered with intelligent features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI Recipe Suggestions */}
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Suggestions
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized recipe recommendations based on your ingredients and preferences.
              </p>
            </div>

            {/* Meal Planning */}
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Weekly Meal Planning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Plan your meals for the week with our intuitive drag-and-drop calendar.
              </p>
            </div>

            {/* Smart Grocery Lists */}
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Smart Grocery Lists
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically generate shopping lists from your meal plans and recipes.
              </p>
            </div>

            {/* Recipe Collections */}
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Recipe Collections
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Save and organize your favorite recipes in personalized collections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Recipes Preview */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Recipes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover trending recipes loved by our community of home cooks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Recipe Preview Cards - Placeholder */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-green-200 to-emerald-300 dark:from-green-800 dark:to-emerald-900 flex items-center justify-center">
                  <ChefHat className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Delicious Recipe {i}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    A wonderful recipe that&apos;s perfect for any occasion. Easy to make and absolutely delicious.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">30 min</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/recipe">
              <Button variant="outline" size="lg">
                View All Recipes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 dark:bg-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of home cooks who are already making meal planning easier with SmartPlates.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
