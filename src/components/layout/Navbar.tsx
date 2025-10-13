/**
 * Main Navigation Component for SmartPlates
 * Features responsive design, authentication states, and user profile dropdown
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/authContext';
import { slugify } from '@/lib/utils';
import { Menu, X, ChefHat } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav
      className="navbar-bg shadow-navbar border-b border-border sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href={isAuthenticated ? (isAdmin ? "/admin" : "/user/welcome") : "/"}
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="SmartPlates Home"
            >
              <ChefHat className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-foreground">
                SmartPlates
              </span>
            </Link>
          </div>

          {/* Admin Navigation */}
          {isAdmin ? (
            <>
              {/* Desktop Admin Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4" role="menubar">
                  <Link
                    href="/admin"
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                  </Link>
                  <Link
                    href="/admin/dashboard/manage-users"
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    User Management
                  </Link>
                  <Link
                    href="/admin/dashboard/manage-recipes"
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    Recipe Management
                  </Link>
                  <Link
                    href="/admin/dashboard/manage_cookware_commissions"
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    Commission Management
                  </Link>
                  <Link
                    href="/admin/upload-recipe"
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    Upload Recipe
                  </Link>
                </div>
              </div>

              {/* Admin Authentication & User Menu */}
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                  {/* User Profile Dropdown */}
                  <UserProfileDropdown />

                  {/* Theme Toggle */}
                  <ThemeToggle size="sm" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Desktop Navigation for Non-Admins */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4" role="menubar">
                  {/* Navigation in order: Recipes, Meal Plan, My Recipes, Smart Fridge AI, Cookware, About, Contact */}
                  <Link
                    href="/recipe"
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    Recipes
                  </Link>
                  {/* User Navigation - Meal Plan */}
                  {isAuthenticated && (
                    <Link
                      href={user && user.name ? `/user/${encodeURIComponent(slugify(user.name))}/meal-plan/current` : '/user/meal-plan/current'}
                      className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      role="menuitem"
                      tabIndex={0}
                    >
                      Meal Plan
                    </Link>
                  )}
                  {/* User Navigation - My Recipes */}
                  {isAuthenticated && (
                    <Link
                      href="/user/my-recipe"
                      className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      role="menuitem"
                      tabIndex={0}
                    >
                      My Recipes
                    </Link>
                  )}
                  {/* User Navigation - Smart Fridge AI */}
                  {isAuthenticated && (
                    <Link
                      href="/user/ai_feature"
                      className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      role="menuitem"
                      tabIndex={0}
                    >
                      Smart Fridge AI
                    </Link>
                  )}
                  <Link
                    href="/cookware"
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    Cookware
                  </Link>
                  <Link
                    href="/about"
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    Contact
                  </Link>
                </div>
              </div>

              {/* Authentication & User Menu for Non-Admins */}
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                  {isAuthenticated ? (
                    /* User Profile Dropdown for authenticated users */
                    <UserProfileDropdown />
                  ) : (
                    /* Sign In/Sign Up Buttons for guests */
                    <div className="flex items-center space-x-3">
                      <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border-2 border-primary-700 text-primary-700 hover:bg-accent hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border-2 border-primary-700 text-primary-700 hover:bg-accent hover:border-accent hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-coral-500 dark:hover:border-coral-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}

                  {/* Theme Toggle */}
                  <ThemeToggle size="sm" />
                </div>
              </div>
            </>
          )}

          {/* Mobile menu button */}
          {!isAdmin && (
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle - Mobile */}
              <ThemeToggle size="sm" />

              <Button
                variant="ghost"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Close main menu' : 'Open main menu'}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          )}

          {/* Admin Mobile Menu Button */}
          {isAdmin && (
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle - Mobile */}
              <ThemeToggle size="sm" />

              <Button
                variant="ghost"
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Close admin menu' : 'Open admin menu'}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu - Only for Non-Admins */}
      {isMenuOpen && !isAdmin && (
        <div
          className="md:hidden"
          id="mobile-menu"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-card border-t border-border">
            {/* Mobile Navigation in order: Recipes, Meal Plan, My Recipes, Smart Fridge AI, Cookware, About, Contact */}
            <Link
              href="/recipe"
              className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              Recipes
            </Link>

            {/* User Mobile Navigation - Meal Plan */}
            {isAuthenticated && (
              <Link
                href={user && user.name ? `/user/${encodeURIComponent(slugify(user.name))}/meal-plan/current` : '/user/meal-plan/current'}
                className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={() => setIsMenuOpen(false)}
                role="menuitem"
                tabIndex={0}
              >
                Meal Plan
              </Link>
            )}

            {/* User Mobile Navigation - My Recipes */}
            {isAuthenticated && (
              <Link
                href="/user/my-recipe"
                className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={() => setIsMenuOpen(false)}
                role="menuitem"
                tabIndex={0}
              >
                My Recipes
              </Link>
            )}

            {/* User Mobile Navigation - Smart Fridge AI */}
            {isAuthenticated && (
              <Link
                href="/user/ai_feature"
                className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={() => setIsMenuOpen(false)}
                role="menuitem"
                tabIndex={0}
              >
                Smart Fridge AI
              </Link>
            )}

            <Link
              href="/cookware"
              className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              Cookware
            </Link>
            <Link
              href="/about"
              className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              Contact
            </Link>

            {/* User Mobile Navigation - Dashboard (legacy link if needed) */}
            {isAuthenticated && (
              <Link
                href="/user"
                className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={() => setIsMenuOpen(false)}
                role="menuitem"
                tabIndex={0}
              >
                Dashboard
              </Link>
            )}

            {/* Mobile Authentication */}
            <div className="pt-4 pb-3 border-t border-border">
              <div className="px-2">
                {isAuthenticated ? (
                  <UserProfileDropdown isMobile={true} />
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      href="/login"
                      className="w-full text-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border-2 border-primary-700 text-primary-700 hover:bg-primary-100 hover:text-primary-800 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 shadow-sm hover:shadow-md transform hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="w-full text-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border-2 border-primary-700 text-primary-700 hover:bg-coral-500 hover:border-coral-500 hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-coral-500 dark:hover:border-coral-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 shadow-sm hover:shadow-md transform hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Mobile Menu */}
      {isMenuOpen && isAdmin && (
        <div
          className="md:hidden"
          id="mobile-menu"
          role="menu"
          aria-label="Admin mobile menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-card border-t border-border">
            {/* Admin Mobile Navigation */}
            <Link
              href="/admin"
              className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/dashboard/manage-users"
              className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              User Management
            </Link>
            <Link
              href="/admin/dashboard/manage-recipes"
              className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              Recipe Management
            </Link>
            <Link
              href="/admin/dashboard/manage_cookware_commissions"
              className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              Commission Management
            </Link>

            {/* Mobile Authentication */}
            <div className="pt-4 pb-3 border-t border-border">
              <div className="px-2">
                <UserProfileDropdown isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}