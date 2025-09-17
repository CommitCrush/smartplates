/**
 * Rating Stars Component
 * 
 * Reusable star rating component for display and input.
 */

'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  interactive = false,
  onRatingChange,
  className 
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1",
      interactive && "cursor-pointer",
      className
    )}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= rating;
        const isHalfFilled = starRating - 0.5 <= rating && starRating > rating;

        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              "transition-colors",
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : isHalfFilled
                ? "fill-yellow-200 text-yellow-400"
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700",
              interactive && "hover:fill-yellow-300 hover:text-yellow-400"
            )}
            onClick={() => handleStarClick(starRating)}
          />
        );
      })}
    </div>
  );
}
