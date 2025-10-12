'use client';

import { useTheme } from '@/context/themeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className, showLabel = false, size = 'md' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const buttonSize = {
    sm: 'p-1.5 h-8 w-8',
    md: 'p-2 h-10 w-10',
    lg: 'p-3 h-12 w-12'
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        buttonSize[size],
        "border-2 border-primary-600/20 hover:border-primary-600 hover:bg-primary-50",
        "dark:border-primary-400/20 dark:hover:border-primary-400 dark:hover:bg-primary-900/30",
        "transition-all duration-200 rounded-lg shadow-sm hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2",
        "transform hover:scale-105",
        className
      )}
      aria-label={resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={resolvedTheme === 'dark'}
    >
      {resolvedTheme === 'light' ? (
        <Moon className={cn(iconSize[size], "text-primary-600 dark:text-primary-400")} />
      ) : (
        <Sun className={cn(iconSize[size], "text-primary-600 dark:text-primary-400")} />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium text-primary-600 dark:text-primary-400">
          {resolvedTheme === 'light' ? 'Dark' : 'Light'}
        </span>
      )}
    </Button>
  );
}

// Erweiterte Version mit Dropdown für alle drei Optionen
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex items-center space-x-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('light')}
        className={cn(
          "p-2 rounded-md transition-colors",
          theme === 'light' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
        )}
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
      >
        <Sun className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('dark')}
        className={cn(
          "p-2 rounded-md transition-colors",
          theme === 'dark' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
        )}
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
      >
        <Moon className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('system')}
        className={cn(
          "p-2 rounded-md transition-colors",
          theme === 'system' ? 'bg-white dark:bg-neutral-700 shadow-sm' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
        )}
        aria-label="System mode"
        aria-pressed={theme === 'system'}
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}