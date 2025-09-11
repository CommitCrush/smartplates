/**
 * Main'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
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
  }, []); Component for SmartPlates
 * 
 * Features:
 * - Responsive navigation with mobile menu
 * - Authentication-based navigation (authenticated vs. public)
 * - Role-based menu items (admin, user, viewer)
 * - Google OAuth sign-in/sign-out
 * - Logo and branding
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
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
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-foreground">
                SmartPlates
              </span>
            </Link>
            
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </Button>
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

              {/* Authenticated User Navigation */}
              {isAuthenticated && (
                <>
                  <Link
                    href="/user/meal-plans"
                    className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Meal Plans
                  </Link>
                  <Link
                    href="/user/my-recipes"
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
            <div className="ml-4 flex items-center md:ml-6">
              {!isAuthenticated ? (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => signIn('google')}
                    className="text-sm bg-accent hover:bg-accent/70 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Sign in with Google"
                  >
                    Sign In
                  </Button>
                  
                  <Link href="/register">
                    <Button 
                      variant="outline" 
                      className="text-sm bg-accent hover:bg-accent/70 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      aria-label="Get started with SmartPlates"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* User Profile Link */}
                  <Link
                    href="/user/profile"
                    className="flex items-center space-x-2 text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </Link>
                  
                  {/* Settings */}
                  <Link
                    href="/user/settings"
                    className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-md transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                  
                  {/* Sign Out */}
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="text-foreground hover:text-coral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button and dark mode toggle */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </Button>
            
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

            {/* Authenticated Mobile Navigation */}
            {isAuthenticated && (
              <>
                <Link
                  href="/user/meal-plans"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meal Plans
                </Link>
                <Link
                  href="/user/my-recipes"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Recipes
                </Link>
                <Link
                  href="/user/profile"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/user/settings"
                  className="text-foreground hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
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
