/**
 * Footer Component for SmartPlates
 * 
 * Features:
 * - Company information and branding
 * - Navigation links organized by category
 * - Social media links
 * - Legal and contact information
 * - Newsletter signup placeholder
 * - Responsive design
 */

import Link from 'next/link';
import { ChefHat, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-12 sm:px-6 lg:px-8">
        {/* Main Footer Content - Mobile-First Responsive */}
        <div className="py-6 sm:py-10">
          {/* Mobile: Vertical Stack, Desktop: Grid */}
          <div className="space-y-1 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6">
            
            {/* Brand and Description - Mobile Optimized */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" />
                <span className="text-xl sm:text-2xl font-bold text-foreground">SmartPlates</span>
              </div>
              <p className="text-sm sm:text-base text-foreground-muted mb-4 leading-relaxed">
                Smart meal planning and recipe management made easy. Discover new recipes, 
                plan your meals, and get AI-powered cooking suggestions.
              </p>
              
              {/* Social Media - Touch-Friendly - Desktop Only */}
              <div className="hidden md:flex space-x-2 sm:space-x-4">
                <Link 
                  href="#" 
                  className="text-foreground-muted hover:text-primary-500 hover:bg-background p-3 sm:p-2 rounded-lg transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Link>
                <Link 
                  href="#" 
                  className="text-foreground-muted hover:text-primary-500 hover:bg-background p-3 sm:p-2 rounded-lg transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </Link>
                <Link 
                  href="#" 
                  className="text-foreground-muted hover:text-primary-500 hover:bg-background p-3 sm:p-2 rounded-lg transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.324-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.324C5.901 8.247 7.052 7.757 8.349 7.757s2.448.49 3.324 1.297c.806.876 1.297 2.027 1.297 3.324s-.49 2.448-1.297 3.324c-.876.807-2.027 1.297-3.324 1.297z"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Quick Links - Mobile Touch-Optimized */}
            <div className="md:col-span-1">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-border md:hidden"></span>
              </h3>
              <ul className="space-y-0.5 sm:space-y-1">
                <li>
                  <Link 
                    href="/recipe" 
                    className="text-sm sm:text-base text-foreground-muted hover:text-primary-500 hover:bg-background flex items-center px-3 py-2 sm:px-2 sm:py-1 rounded-md transition-colors min-h-[44px] sm:min-h-auto"
                  >
                    Browse Recipes
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/cookware" 
                    className="text-sm sm:text-base text-foreground-muted hover:text-primary-500 hover:bg-background flex items-center px-3 py-2 sm:px-2 sm:py-1 rounded-md transition-colors min-h-[44px] sm:min-h-auto"
                  >
                    Cookware
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="text-sm sm:text-base text-foreground-muted hover:text-primary-500 hover:bg-background flex items-center px-3 py-2 sm:px-2 sm:py-1 rounded-md transition-colors min-h-[44px] sm:min-h-auto"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-sm sm:text-base text-foreground-muted hover:text-primary-500 hover:bg-background flex items-center px-3 py-2 sm:px-2 sm:py-1 rounded-md transition-colors min-h-[44px] sm:min-h-auto"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Features - Mobile Layout */}
            <div className="md:col-span-1">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground relative inline-block">
                Features
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-border md:hidden"></span>
              </h3>
              <ul className="space-y-0.5 sm:space-y-1">
                <li className="text-sm sm:text-base text-foreground-muted py-1">AI Recipe Suggestions</li>
                <li className="text-sm sm:text-base text-foreground-muted py-1">Meal Planning</li>
                <li className="text-sm sm:text-base text-foreground-muted py-1">Grocery Lists</li>
                <li className="text-sm sm:text-base text-foreground-muted py-1">Recipe Collections</li>
                <li className="text-sm sm:text-base text-foreground-muted py-1">Cookware Recommendations</li>
              </ul>
            </div>

            {/* Contact Information - Mobile Enhanced */}
            <div className="md:col-span-2 lg:col-span-1">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground relative inline-block">
                Get in Touch
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-border md:hidden"></span>
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center space-x-3 py-1">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground-muted">hello@smartplates.com</span>
                </div>
                <div className="flex items-center space-x-3 py-1">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground-muted">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 py-1">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground-muted">San Francisco, CA</span>
                </div>
              </div>

              {/* Newsletter Signup - Mobile Optimized */}
              <div className="mt-4">
                <h4 className="text-sm sm:text-base font-semibold mb-1.5 text-foreground">Stay Updated</h4>
                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                  Get the latest recipes and cooking tips delivered to your inbox.
                </p>
                
                {/* Social Media - Mobile Only */}
                <div className="flex md:hidden justify-center space-x-2 mt-3">
                  <Link 
                    href="#" 
                    className="text-foreground-muted hover:text-primary-500 hover:bg-background p-3 rounded-lg transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </Link>
                  <Link 
                    href="#" 
                    className="text-foreground-muted hover:text-primary-500 hover:bg-background p-3 rounded-lg transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </Link>
                  <Link 
                    href="#" 
                    className="text-foreground-muted hover:text-primary-500 hover:bg-background p-3 rounded-lg transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.324-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.324C5.901 8.247 7.052 7.757 8.349 7.757s2.448.49 3.324 1.297c.806.876 1.297 2.027 1.297 3.324s-.49 2.448-1.297 3.324c-.876.807-2.027 1.297-3.324 1.297z"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col items-center md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-2 order-2 md:order-1 mt-6 md:mt-0">
              <span className="text-xs md:text-sm text-foreground-muted text-center md:text-left">
                © {currentYear} SmartPlates. Made with
              </span>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3 md:h-4 md:w-4 text-coral-500" />
                <span className="text-xs md:text-sm text-foreground-muted">
                  for food lovers everywhere.
                </span>
              </div>
            </div>
            
            <div className="flex flex-row space-x-6 order-1 md:order-2 mb-4 md:mb-0">
              <Link 
                href="/privacy" 
                className="text-foreground-muted hover:text-primary-500 hover:bg-background dark:hover:bg-background px-2 py-1 rounded-md transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-foreground-muted hover:text-primary-500 hover:bg-background dark:hover:bg-background px-2 py-1 rounded-md transition-colors text-sm"
              >
                Terms of Service
              </Link>
              <Link 
                href="/cookies" 
                className="text-foreground-muted hover:text-primary-500 hover:bg-background dark:hover:bg-background px-2 py-1 rounded-md transition-colors text-sm"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
