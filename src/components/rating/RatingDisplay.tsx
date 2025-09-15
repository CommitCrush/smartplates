/**
 * Rating Display Component
 * 
 * Displays recipe rating with stars and statistics.
 */

'use client';

import React from 'react';
import { RatingStars } from './RatingStars';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating: number;
  ratingCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingDisplay({ 
  rating, 
  ratingCount = 0,
  showCount = true,
  size = 'md',
  className 
}: RatingDisplayProps) {
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RatingStars rating={rating} size={size} />
      
      <div className={cn("flex items-center gap-1", textSizes[size])}>
        <span className="font-medium">
          {rating.toFixed(1)}
        </span>
        
        {showCount && ratingCount > 0 && (
          <span className="text-muted-foreground">
            ({ratingCount.toLocaleString()} {ratingCount === 1 ? 'review' : 'reviews'})
          </span>
        )}
      </div>
    </div>
  );
}
