/**
 * Responsive Design System for SmartPlates
 * 
 * Mobile-First Approach with Progressive Enhancement
 * All base styles are mobile-first, then enhanced for larger screens
 */

/**
 * BREAKPOINT SYSTEM
 * 
 * Following TailwindCSS breakpoint system with mobile-first approach:
 * 
 * Mobile (Default):   0px - 639px    | No prefix needed
 * Small (sm):       640px - 767px    | sm:
 * Medium (md):      768px - 1023px   | md: 
 * Large (lg):      1024px - 1279px   | lg:
 * Extra Large (xl): 1280px - 1535px  | xl:
 * 2X Large (2xl):   1536px+          | 2xl:
 */

export const BREAKPOINTS = {
  // Base (Mobile First) - No prefix
  mobile: {
    min: 0,
    max: 639,
    prefix: '',
    description: 'Mobile devices, portrait orientation',
    examples: ['iPhone SE', 'iPhone 12', 'Samsung Galaxy'],
  },
  
  // Small - Tablets portrait, large phones landscape
  sm: {
    min: 640,
    max: 767,
    prefix: 'sm:',
    description: 'Small tablets and large phones in landscape',
    examples: ['iPad Mini portrait', 'iPhone 12 Pro Max landscape'],
  },
  
  // Medium - Tablets landscape, small laptops
  md: {
    min: 768,
    max: 1023,
    prefix: 'md:',
    description: 'Tablets in landscape, small laptops',
    examples: ['iPad portrait', 'Surface Pro', 'small laptops'],
  },
  
  // Large - Laptops, small desktops
  lg: {
    min: 1024,
    max: 1279,
    prefix: 'lg:',
    description: 'Laptops and small desktop screens',
    examples: ['MacBook Air', '13-15 inch laptops', 'small desktop monitors'],
  },
  
  // Extra Large - Large desktops
  xl: {
    min: 1280,
    max: 1535,
    prefix: 'xl:',
    description: 'Large desktop screens',
    examples: ['MacBook Pro 16"', '24-27 inch monitors', 'iMac'],
  },
  
  // 2X Large - Very large screens
  '2xl': {
    min: 1536,
    max: 'infinite',
    prefix: '2xl:',
    description: 'Very large desktop screens and ultra-wide monitors',
    examples: ['32+ inch monitors', 'ultra-wide monitors', '4K displays'],
  },
}

/**
 * RESPONSIVE LAYOUT PATTERNS
 * 
 * Common responsive patterns used throughout SmartPlates
 */

export const RESPONSIVE_PATTERNS = {
  // Container sizes for different screens
  containers: {
    mobile: 'px-4',                    // 16px padding
    sm: 'sm:px-6',                     // 24px padding
    lg: 'lg:px-8',                     // 32px padding
    maxWidth: 'max-w-7xl mx-auto',     // Centered with max width
  },
  
  // Grid layouts that adapt to screen size
  grids: {
    // 1 column on mobile, 2 on tablet, 3 on desktop, 4 on large screens
    responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    
    // 1 column on mobile, 2 on tablet, 3 on desktop (common pattern)
    features: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    
    // 1 column on mobile, 2 on tablet+
    cards: 'grid-cols-1 md:grid-cols-2',
    
    // 1 column on mobile, 4 on larger screens (navigation)
    navigation: 'grid-cols-1 lg:grid-cols-4',
  },
  
  // Flexbox patterns
  flex: {
    // Stack vertically on mobile, horizontal on tablet+
    stackToRow: 'flex-col md:flex-row',
    
    // Center content with responsive spacing
    centerWithSpacing: 'flex flex-col items-center space-y-4 md:space-y-6 lg:space-y-8',
    
    // Navigation bar responsive behavior
    navbar: 'flex items-center justify-between',
  },
  
  // Typography scaling
  typography: {
    // Hero headlines that scale responsively
    heroTitle: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
    
    // Section headlines
    sectionTitle: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    
    // Body text that's readable on all screens
    bodyText: 'text-base sm:text-lg md:text-xl',
    
    // Small text for captions, etc.
    caption: 'text-sm sm:text-base',
  },
  
  // Spacing that adapts to screen size
  spacing: {
    // Section padding
    sectionPadding: 'py-12 sm:py-16 md:py-20 lg:py-24',
    
    // Element gaps
    elementGap: 'gap-4 sm:gap-6 md:gap-8 lg:gap-12',
    
    // Margin bottom for sections
    sectionMargin: 'mb-8 sm:mb-12 md:mb-16 lg:mb-20',
  },
}

/**
 * MOBILE-FIRST RESPONSIVE UTILITIES
 * 
 * Helper functions and classes for responsive design
 */

export const RESPONSIVE_UTILITIES = {
  // Hide/show elements at different breakpoints
  visibility: {
    mobileOnly: 'block md:hidden',
    tabletUp: 'hidden md:block',
    desktopUp: 'hidden lg:block',
    largeScreenUp: 'hidden xl:block',
  },
  
  // Image responsive behavior
  images: {
    responsive: 'w-full h-auto',
    cover: 'object-cover',
    contain: 'object-contain',
    centerCrop: 'object-cover object-center',
  },
  
  // Button sizes for different screens
  buttons: {
    responsive: 'px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4',
    mobileOptimized: 'w-full sm:w-auto',
  },
  
  // Form elements responsive
  forms: {
    input: 'w-full px-3 py-2 sm:px-4 sm:py-3',
    inputGroup: 'space-y-4 sm:space-y-6',
  },
}

/**
 * PERFORMANCE CONSIDERATIONS
 * 
 * Guidelines for responsive images and content loading
 */

export const PERFORMANCE_GUIDELINES = {
  // Image optimization
  images: {
    // Use Next.js Image component with responsive props
    nextImageProps: {
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      priority: false, // Set to true for above-the-fold images
    },
    
    // Responsive image breakpoints
    srcSet: {
      mobile: '640w',
      tablet: '768w', 
      desktop: '1024w',
      large: '1280w',
      xlarge: '1920w',
    },
  },
  
  // Loading strategies
  loading: {
    aboveFold: 'eager',
    belowFold: 'lazy',
  },
}

/**
 * ACCESSIBILITY CONSIDERATIONS FOR RESPONSIVE DESIGN
 * 
 * Ensuring responsive design doesn't break accessibility
 */

export const RESPONSIVE_ACCESSIBILITY = {
  // Touch targets - minimum 44px on mobile
  touchTargets: {
    minimum: 'min-h-[44px] min-w-[44px]',
    recommended: 'min-h-[48px] min-w-[48px]',
    comfortable: 'min-h-[56px] min-w-[56px]',
  },
  
  // Focus indicators scale with content
  focus: {
    mobile: 'focus:ring-2 focus:ring-offset-1',
    desktop: 'focus:ring-2 focus:ring-offset-2',
  },
  
  // Text remains readable at all sizes
  readability: {
    minTextSize: 'text-base', // Never smaller than 16px on mobile
    lineHeight: 'leading-relaxed', // Generous line height for readability
    contrast: 'WCAG AA compliant at all screen sizes',
  },
}

/**
 * TESTING GUIDELINES
 * 
 * How to test responsive design effectively
 */

export const TESTING_GUIDELINES = {
  // Device categories to test
  testDevices: [
    // Mobile
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 384, height: 854 },
    
    // Tablet
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    
    // Desktop
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Large Desktop', width: 2560, height: 1440 },
  ],
  
  // What to test at each breakpoint
  testChecklist: [
    'Navigation collapses correctly',
    'Text remains readable',
    'Images scale properly',
    'Touch targets are adequate (44px minimum)',
    'Content doesn\'t overflow horizontally',
    'Vertical spacing is appropriate',
    'Call-to-action buttons are prominent',
    'Forms are easy to fill out',
  ],
}
