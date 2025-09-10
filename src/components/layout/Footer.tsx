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
    <footer className="bg-footer-dark border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <ChefHat className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-footer-light">SmartPlates</span>
            </div>
            <p className="text-footer-light-muted mb-6">
              Smart meal planning and recipe management made easy. Discover new recipes, 
              plan your meals, and get AI-powered cooking suggestions.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Links - Placeholder for future implementation */}
              <Link 
                href="#" 
                className="text-foreground-secondary hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-md transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              <Link 
                href="#" 
                className="text-foreground-secondary hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-md transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </Link>
              <Link 
                href="#" 
                className="text-foreground-secondary hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-md transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.324-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.324C5.901 8.247 7.052 7.757 8.349 7.757s2.448.49 3.324 1.297c.806.876 1.297 2.027 1.297 3.324s-.49 2.448-1.297 3.324c-.876.807-2.027 1.297-3.324 1.297z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-footer-light">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/recipe" 
                  className="text-footer-light-muted hover:text-primary-600 hover:bg-neutral-800 dark:hover:bg-neutral-800 block px-2 py-1 rounded-md transition-colors"
                >
                  Browse Recipes
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookware" 
                  className="text-footer-light-muted hover:text-primary-600 hover:bg-neutral-800 dark:hover:bg-neutral-800 block px-2 py-1 rounded-md transition-colors"
                >
                  Cookware
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-footer-light-muted hover:text-primary-600 hover:bg-neutral-800 dark:hover:bg-neutral-800 block px-2 py-1 rounded-md transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-footer-light-muted hover:text-primary-600 hover:bg-neutral-800 dark:hover:bg-neutral-800 block px-2 py-1 rounded-md transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-footer-light">Features</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-footer-light-muted">AI Recipe Suggestions</span>
              </li>
              <li>
                <span className="text-footer-light-muted">Meal Planning</span>
              </li>
              <li>
                <span className="text-footer-light-muted">Grocery Lists</span>
              </li>
              <li>
                <span className="text-footer-light-muted">Recipe Collections</span>
              </li>
              <li>
                <span className="text-footer-light-muted">Cookware Recommendations</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-footer-light">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-600" />
                <span className="text-footer-light-muted">hello@smartplates.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-600" />
                <span className="text-footer-light-muted">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary-600" />
                <span className="text-footer-light-muted">San Francisco, CA</span>
              </div>
            </div>

            {/* Newsletter Signup Placeholder */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2 text-footer-light">Stay Updated</h4>
              <p className="text-footer-light-muted text-sm">
                Get the latest recipes and cooking tips delivered to your inbox.
              </p>
              {/* Future: Newsletter signup form */}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-footer-light-muted">
                © {currentYear} SmartPlates. Made with
              </span>
              <Heart className="h-4 w-4 text-coral-600" />
              <span className="text-footer-light-muted">
                for food lovers everywhere.
              </span>
            </div>
            
            <div className="flex space-x-6">
              <Link 
                href="/privacy" 
                className="text-footer-light-muted hover:text-primary-600 hover:bg-neutral-800 dark:hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-footer-light-muted hover:text-primary-600 hover:bg-neutral-800 dark:hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors text-sm"
              >
                Terms of Service
              </Link>
              <Link 
                href="/cookies" 
                className="text-footer-light-muted hover:text-primary-600 hover:bg-neutral-800 dark:hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors text-sm"
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
