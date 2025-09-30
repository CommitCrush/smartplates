/**
 * Main Navigation Component for SmartPlates
 * Features responsive design, authentication states, and user profile dropdown
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/authContext';
import { Menu, X, ChefHat } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, signIn, signOut } = useAuth();
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
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-foreground">
                SmartPlates
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4" role="menubar">
              {/* Public Navigation */}
              <Link
                href="/recipe"
                className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                role="menuitem"
                tabIndex={0}
              >
                Recipes
              </Link>
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

              {/* User Navigation */}
              {isAuthenticated && (
                <>
                  <Link
                    href="/user"
                    className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/user/my_meal_plan/current"
                    className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    Meal Plans
                  </Link>
                  <Link
                    href="/user/my-recipe"
                    className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    My Recipes
                  </Link>
                  <Link
                    href="/user/ai_feature"
                    className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    role="menuitem"
                    tabIndex={0}
                  >
                    Smart Fridge AI
                  </Link>
                </>
              )}

              {/* Admin Navigation */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Authentication & User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* User Profile Dropdown */}
              <UserProfileDropdown />
              
              {/* Theme Toggle */}
              <ThemeToggle size="sm" />
            </div>
          </div>

          {/* Mobile menu button */}
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
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div 
          className="md:hidden"
          id="mobile-menu"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-card border-t border-border">
            {/* Public Mobile Navigation */}
            <Link
              href="/recipe"
              className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:text-neutral-500 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              Recipes
            </Link>
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

            {/* User Mobile Navigation */}
            {isAuthenticated && (
              <>
                <Link
                  href="/user"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                  tabIndex={0}
                >
                  Dashboard
                </Link>
                <Link
                  href="/user/my_meal_plan/current"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                  tabIndex={0}
                >
                  Meal Plans
                </Link>
                <Link
                  href="/user/my-recipe"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                  tabIndex={0}
                >
                  My Recipes
                </Link>
                <Link
                  href="/user/profile/me"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                  tabIndex={0}
                >
                  Profile
                </Link>
              </>
            )}

            {/* Admin Mobile Navigation */}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

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