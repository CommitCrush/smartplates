/**
 * Recipe Detail Modal Component
 * 
 * Simple modal to display recipe details in meal planning
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { MealSlot } from '@/types/meal-planning';

interface RecipeDetailModalProps {
  isOpen: boolean;
  meal: MealSlot | null;
  onClose: () => void;
}

export function RecipeDetailModal({ isOpen, meal, onClose }: RecipeDetailModalProps) {
  if (!meal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {meal.recipeName || 'Recipe Details'}
            <DialogClose asChild>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {meal.image && (
            <img 
              src={meal.image} 
              alt={meal.recipeName || 'Recipe'} 
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          
          {meal.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{meal.notes}</p>
            </div>
          )}
          
          {meal.servings && (
            <div>
              <h4 className="font-medium mb-2">Servings</h4>
              <p className="text-sm">{meal.servings}</p>
            </div>
          )}
          
          {meal.cookingTime && (
            <div>
              <h4 className="font-medium mb-2">Cooking Time</h4>
              <p className="text-sm">{meal.cookingTime} minutes</p>
            </div>
          )}
          
          {meal.prepTime && (
            <div>
              <h4 className="font-medium mb-2">Prep Time</h4>
              <p className="text-sm">{meal.prepTime} minutes</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}