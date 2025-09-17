/**
 * Recipe Card Skeleton Component
 * 
 * Loading placeholder for recipe cards.
 * Matches the structure of RecipeCard for smooth loading experience.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RecipeCardSkeletonProps {
  className?: string;
}

export function RecipeCardSkeleton({ className }: RecipeCardSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] bg-muted animate-pulse">
        {/* Difficulty Badge Skeleton */}
        <div className="absolute top-3 left-3">
          <div className="h-6 w-16 bg-white/20 rounded-md animate-pulse" />
        </div>
        
        {/* Rating Badge Skeleton */}
        <div className="absolute top-3 right-3">
          <div className="h-6 w-12 bg-white/20 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <CardContent className="p-4">
        {/* Title Skeleton */}
        <div className="h-6 bg-muted rounded-md mb-2 animate-pulse" />
        <div className="h-6 bg-muted rounded-md mb-3 w-3/4 animate-pulse" />

        {/* Description Skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-muted rounded-md animate-pulse" />
          <div className="h-4 bg-muted rounded-md w-2/3 animate-pulse" />
        </div>

        {/* Meta Information Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Time Skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-8 bg-muted rounded animate-pulse" />
            </div>
            
            {/* Servings Skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Difficulty Icon Skeleton */}
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>

      {/* Footer Skeleton */}
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          {/* Author Skeleton */}
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />

          {/* Tags Skeleton */}
          <div className="flex gap-1">
            <div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
            <div className="h-5 w-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
