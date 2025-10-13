'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaDownload, FaPrint, FaShoppingCart } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Recipe } from '@/types/recipe';
import { 
  RecipeActionsProps, 
  NormalizedIngredient 
} from '@/types/components';
import { useToast } from '@/components/ui/use-toast';

export function RecipeActions({ recipe, contentRef, currentServings }: RecipeActionsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleDownloadPdf = (): void => {
    if (contentRef.current) {
      html2canvas(contentRef.current).then((canvas: HTMLCanvasElement) => {
        const imgData: string = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth: number = pdf.internal.pageSize.getWidth();
        const pdfHeight: number = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${recipe.title}.pdf`);
      });
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleAddToShoppingList = async (): Promise<void> => {
    try {
      // Try extendedIngredients first (Spoonacular format), then ingredients (Community format)
      let ingredientSource = recipe.extendedIngredients || recipe.ingredients || [];
      
      // If we still don't have ingredients, check if this is a community recipe with nested ingredients
      if (!ingredientSource || ingredientSource.length === 0) {
        // Sometimes community recipes might have nested structure
        if ((recipe as any)?.recipe?.ingredients) {
          ingredientSource = (recipe as any).recipe.ingredients;
        }
      }

      const ingredients: NormalizedIngredient[] = ingredientSource.map((ingredient: any) => {
        // Handle different ingredient formats
        if (typeof ingredient === 'string') {
          // Parse string ingredients like "1 cup flour"
          const parts = ingredient.trim().split(' ');
          const amount = parseFloat(parts[0]) || 1;
          const unit = parts[1] || '';
          const name = parts.slice(2).join(' ') || ingredient;
          
          return {
            name: name,
            quantity: amount,
            unit: unit,
          };
        }
        
        // Handle object ingredients (both Spoonacular and Community formats)
        return {
          name: ingredient.name || ingredient.original || 'Unknown ingredient',
          quantity: ingredient.amount || ingredient.quantity || 1, 
          unit: ingredient.unit || '',
        };
      });

      if (ingredients.length === 0) {
        toast({ 
          title: 'No Ingredients', 
          description: 'This recipe has no ingredients to add.', 
          variant: 'destructive' 
        });
        return;
      }

      const response: Response = await fetch('/api/grocery-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Ingredients added to your shopping list.' });
        const recipeId: string = (recipe.spoonacularId?.toString()) || recipe._id?.toString() || '';
        router.push(`/user/shopping-list?recipeId=${recipeId}&servings=${currentServings}`);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        toast({ 
          title: 'Error', 
          description: 'Failed to add ingredients to shopping list.', 
          variant: 'destructive' 
        });
      }
    } catch (error: unknown) {
      console.error('Error adding to shopping list:', error);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleDownloadPdf}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-3 rounded-full bg-white dark:bg-gray-800 shadow-md"
        title="Download PDF"
        aria-label="Download PDF"
        type="button"
      >
        <FaDownload size={24} />
      </button>
      <button
        onClick={handlePrint}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-3 rounded-full bg-white dark:bg-gray-800 shadow-md"
        title="Print Recipe"
        aria-label="Print Recipe"
        type="button"
      >
        <FaPrint size={24} />
      </button>
      <button
        onClick={handleAddToShoppingList}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-3 rounded-full bg-white dark:bg-gray-800 shadow-md"
        title="Add to Shopping List"
        aria-label="Add to Shopping List"
        type="button"
      >
        <FaShoppingCart size={24} />
      </button>
    </div>
  );
}
