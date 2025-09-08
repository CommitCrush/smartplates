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

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
