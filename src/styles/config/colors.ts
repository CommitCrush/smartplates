/**
 * SmartPlates Color System
 * 
 * Color palette extracted from design mockups for consistent theming
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0fdf4',   // Very light green
    100: '#dcfce7',  // Light green background
    200: '#bbf7d0',  // Light green
    300: '#86efac',  // Medium light green
    400: '#4ade80',  // Medium green
    500: '#22c55e',  // Primary green (main brand)
    600: '#16a34a',  // Dark green
    700: '#15803d',  // Darker green
    800: '#166534',  // Very dark green
    900: '#14532d',  // Darkest green
  },

  // Coral/Orange Accent (from buttons and highlights)
  coral: {
    50: '#fef7f2',   // Very light coral
    100: '#fef2e7',  // Light coral background
    200: '#fde4cc',  // Light coral
    300: '#fcd0a1',  // Medium light coral
    400: '#fab176',  // Medium coral
    500: '#f97316',  // Primary coral/orange
    600: '#ea580c',  // Dark coral
    700: '#c2410c',  // Darker coral
    800: '#9a3412',  // Very dark coral
    900: '#7c2d12',  // Darkest coral
  },

  // Neutral Grays (from text and backgrounds)
  neutral: {
    50: '#fafafa',   // Almost white
    100: '#f5f5f5',  // Very light gray
    200: '#e5e5e5',  // Light gray
    300: '#d4d4d4',  // Medium light gray
    400: '#a3a3a3',  // Medium gray
    500: '#737373',  // Primary gray (text)
    600: '#525252',  // Dark gray
    700: '#404040',  // Darker gray
    800: '#262626',  // Very dark gray
    900: '#171717',  // Almost black
  },

  // Success/Money Green (from commission cards)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Chart Colors (from dashboard)
  chart: {
    green: '#22c55e',    // Green bars
    red: '#ef4444',      // Red bars  
    blue: '#3b82f6',     // Blue accents
    yellow: '#eab308',   // Yellow highlights
  },

  // Background Colors
  background: {
    primary: '#ffffff',   // White background
    secondary: '#f8fafc', // Very light gray
    card: '#ffffff',      // Card backgrounds
    overlay: 'rgba(0, 0, 0, 0.8)', // Dark overlay
  },

  // Text Colors
  text: {
    primary: '#1f2937',   // Dark gray (primary text)
    secondary: '#6b7280', // Medium gray (secondary text)
    muted: '#9ca3af',     // Light gray (muted text)
    inverse: '#ffffff',   // White text (on dark backgrounds)
  },

  // Border Colors
  border: {
    light: '#e5e7eb',     // Light border
    medium: '#d1d5db',    // Medium border
    dark: '#9ca3af',      // Dark border
  },
} as const;

export type ColorKey = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
