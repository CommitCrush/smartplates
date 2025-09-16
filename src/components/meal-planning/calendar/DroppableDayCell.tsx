/**
 * Drop Zone for Monthly Calendar Day Cells
 * 
 * Enables dropping meals from other days onto calendar day cells
 */

'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import type { MealSlot } from '@/types/meal-planning';

interface DroppableDayCellProps {
  date: Date;
  onDropMeal?: (meal: MealSlot, sourceDate: Date, sourceMealType: string, sourceMealIndex: number, targetDate: Date) => void;
  className?: string;
  children: React.ReactNode;
}

interface DropItem {
  type: string;
  meal: MealSlot;
  sourceDate: Date;
  mealType: string;
  mealIndex: number;
}

export function DroppableDayCell({
  date,
  onDropMeal,
  className,
  children
}: DroppableDayCellProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['monthly-meal', 'meal'],
    drop: (item: DropItem) => {
      if (onDropMeal) {
        onDropMeal(item.meal, item.sourceDate, item.mealType, item.mealIndex, date);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop as any}
      className={`${className} ${isActive ? 'ring-2 ring-primary ring-opacity-50 bg-primary-50' : ''} transition-all`}
    >
      {children}
      {isActive && (
        <div className="absolute inset-0 bg-primary bg-opacity-10 rounded-lg border-2 border-primary border-dashed flex items-center justify-center pointer-events-none">
          <span className="text-xs text-primary font-medium">Drop here</span>
        </div>
      )}
    </div>
  );
}

export default DroppableDayCell;