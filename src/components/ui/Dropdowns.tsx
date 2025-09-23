/**
 * Dropdown Components
 * 
 * Collection of dropdown/select components using native HTML select with TailwindCSS styling.
 * No shadcn/ui dependencies - pure TailwindCSS implementation.
 */

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
  error?: boolean;
  children?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', placeholder, error = false, children, ...props }, ref) => {
    const baseClasses = 'flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
    
    const borderClasses = error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500';
    
    const finalClasses = `${baseClasses} ${borderClasses} ${className}`;

    return (
      <div className="relative">
        <select
          className={finalClasses}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    );
  }
);

Select.displayName = 'Select';

// Additional dropdown components can be added here:
// - Multiselect
// - ComboBox  
// - SearchableDropdown
// etc.

export { Select };