/**
 * Draggable Meal Item for Monthly Calendar
 * 
 * Small draggable meal preview for use in monthly calendar view
 */

'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import type { MealSlot } from '@/types/meal-planning';

interface DraggableMealItemProps {
  meal: MealSlot;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  mealIndex: number;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
  children: React.ReactNode;
}

interface DragItem {
  type: string;
  meal: MealSlot;
  sourceDate: Date;
  mealType: string;
  mealIndex: number;
}

export function DraggableMealItem({
  meal,
  date,
  mealType,
  mealIndex,
  onEdit,
  onRemove,
  className,
  children
}: DraggableMealItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'monthly-meal',
    item: (): DragItem => ({
      type: 'monthly-meal',
      meal,
      sourceDate: date,
      mealType,
      mealIndex
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={`${className} ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {children}
    </div>
  );
}

export default DraggableMealItem;