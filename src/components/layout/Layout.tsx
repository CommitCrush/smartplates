/**
 * Main Layout Component for SmartPlates
 * 
 * Provides the basic page structure with:
 * - Navigation bar at the top
 * - Main content area
 * - Footer at the bottom
 * - Proper spacing and responsive behavior
 */

import Navbar from './Navbar';
import Footer from './Footer';
import { SKIP_LINK_STYLES } from '@/utils/accessibility';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className={SKIP_LINK_STYLES}
      >
        Skip to main content
      </a>
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main 
        id="main-content"
        className={`flex-1 ${className}`}
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
