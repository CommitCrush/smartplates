/**
 * Main Navigation Bar Component
 * Features responsive design, authentication states, and user profile dropdown
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import UserProfileDropdown from './UserProfileDropdown';
import { Menu, X, User, LogOut, Settings, ChefHat, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, signIn, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check initial dark mode state
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Load dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedDarkMode === 'false') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

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

              {/* Authenticated User Navigation */}
              {isAuthenticated && (
                <>
                  <Link
                    href="/user/my_meal_plan/current"
                    className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Meal Plans
                  </Link>
                  <Link
                    href="/user/my-recipe"
                    className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    My Recipes
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
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={toggleMenu}
              className="text-foreground shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label={isMenuOpen ? 'Close main menu' : 'Open main menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
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

            {/* Authenticated Mobile Navigation */}
            {isAuthenticated && (
              <>
                <Link
                  href="/user/my_meal_plan/current"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meal Plans
                </Link>
                <Link
                  href="/user/my-recipe"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Recipes
                </Link>
                <Link
                  href="/user/profile/me"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
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
              {!isAuthenticated ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      signIn('google');
                      setIsMenuOpen(false);
                    }}
                    className="w-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Sign in with Google"
                  >
                    Sign In with Google
                  </Button>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      aria-label="Get started with SmartPlates"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center px-3 py-2">
                    <User className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="text-sm font-medium text-foreground">
                      {user?.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
