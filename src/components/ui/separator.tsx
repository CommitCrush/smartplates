/**
 * Separator Component
 * 
 * A simple line separator using pure TailwindCSS styling.
 * No shadcn/ui dependencies - pure TailwindCSS implementation.
 */

import * as React from 'react';

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

// Default is horizontal separator
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = '', orientation = 'horizontal', decorative = true, ...props }, ref) => {
    const baseClasses = 'shrink-0 bg-gray-200 dark:bg-gray-700';
    const orientationClasses = orientation === 'horizontal' 
      ? 'h-[1px] w-full' 
      : 'h-full w-[1px]';
    
    const finalClasses = `${baseClasses} ${orientationClasses} ${className}`;

    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={orientation}
        className={finalClasses}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

export { Separator };