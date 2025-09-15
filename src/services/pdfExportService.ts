/**
 * PDF Export Service for Meal Plans
 * 
 * Generates PDF documents with meal plans and ingredient lists
 * Uses jsPDF for PDF generation and html2canvas for layout capture
 */

import type { IMealPlan, MealSlot } from '@/types/meal-planning';

// Interface for ingredient aggregation
interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  category: string;
}

// Mock ingredient data for recipes (in real app, this would come from recipe data)
const mockIngredients: Record<string, Ingredient[]> = {
  'Mediterranean Quinoa Bowl': [
    { name: 'Quinoa', amount: '1', unit: 'cup', category: 'Grains' },
    { name: 'Cherry Tomatoes', amount: '1', unit: 'cup', category: 'Vegetables' },
    { name: 'Cucumber', amount: '1', unit: 'medium', category: 'Vegetables' },
    { name: 'Feta Cheese', amount: '100', unit: 'g', category: 'Dairy' },
    { name: 'Olive Oil', amount: '2', unit: 'tbsp', category: 'Oils' }
  ],
  'Creamy Mushroom Risotto': [
    { name: 'Arborio Rice', amount: '1', unit: 'cup', category: 'Grains' },
    { name: 'Mixed Mushrooms', amount: '300', unit: 'g', category: 'Vegetables' },
    { name: 'Vegetable Broth', amount: '4', unit: 'cups', category: 'Pantry' },
    { name: 'Parmesan Cheese', amount: '100', unit: 'g', category: 'Dairy' },
    { name: 'White Wine', amount: '1/2', unit: 'cup', category: 'Pantry' }
  ],
  'Asian Stir-Fry Noodles': [
    { name: 'Rice Noodles', amount: '200', unit: 'g', category: 'Grains' },
    { name: 'Bell Peppers', amount: '2', unit: 'medium', category: 'Vegetables' },
    { name: 'Carrots', amount: '2', unit: 'medium', category: 'Vegetables' },
    { name: 'Soy Sauce', amount: '3', unit: 'tbsp', category: 'Condiments' },
    { name: 'Sesame Oil', amount: '1', unit: 'tbsp', category: 'Oils' }
  ]
};

/**
 * Generate shopping list from meal plan
 */
function generateShoppingList(mealPlan: IMealPlan): Record<string, Ingredient[]> {
  const aggregatedIngredients: Record<string, Ingredient[]> = {};
  
  // Process each day's meals
  mealPlan.days.forEach(day => {
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
      const meals = day[mealType as keyof typeof day] as MealSlot[];
      
      meals.forEach(meal => {
        if (meal.recipeName && mockIngredients[meal.recipeName]) {
          const ingredients = mockIngredients[meal.recipeName];
          
          ingredients.forEach(ingredient => {
            if (!aggregatedIngredients[ingredient.category]) {
              aggregatedIngredients[ingredient.category] = [];
            }
            
            // Check if ingredient already exists in category
            const existingIngredient = aggregatedIngredients[ingredient.category].find(
              item => item.name === ingredient.name
            );
            
            if (existingIngredient) {
              // For simplicity, just increase quantity (in real app, would handle units properly)
              const currentAmount = parseFloat(existingIngredient.amount) || 1;
              const additionalAmount = parseFloat(ingredient.amount) || 1;
              existingIngredient.amount = (currentAmount + additionalAmount * (meal.servings || 1)).toString();
            } else {
              // Add new ingredient with adjusted quantity for servings
              const servings = meal.servings || 1;
              const adjustedAmount = (parseFloat(ingredient.amount) || 1) * servings;
              aggregatedIngredients[ingredient.category].push({
                ...ingredient,
                amount: adjustedAmount.toString()
              });
            }
          });
        }
      });
    });
  });
  
  return aggregatedIngredients;
}

/**
 * Export meal plan as PDF
 */
export async function exportMealPlanToPDF(mealPlan: IMealPlan, options: {
  includeIngredients?: boolean;
  format?: 'A4' | 'Letter';
} = {}) {
  const { includeIngredients = true, format = 'A4' } = options;
  
  try {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format.toLowerCase()
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    let yPosition = margin;
    
    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(mealPlan.title || 'Weekly Meal Plan', margin, yPosition);
    yPosition += 15;
    
    // Date range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const startDate = mealPlan.weekStartDate.toLocaleDateString();
    const endDate = mealPlan.weekEndDate.toLocaleDateString();
    doc.text(`${startDate} - ${endDate}`, margin, yPosition);
    yPosition += 20;
    
    // Days and meals
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    mealPlan.days.forEach((day, dayIndex) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      
      // Day header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(dayNames[dayIndex], margin, yPosition);
      doc.text(day.date.toLocaleDateString(), pageWidth - margin - 40, yPosition);
      yPosition += 10;
      
      // Meal types
      const mealTypes = [
        { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
        { key: 'lunch', label: 'Lunch', emoji: '☀️' },
        { key: 'dinner', label: 'Dinner', emoji: '🌙' },
        { key: 'snacks', label: 'Snacks', emoji: '🍎' }
      ];
      
      mealTypes.forEach(mealType => {
        const meals = day[mealType.key as keyof typeof day] as MealSlot[];
        
        if (meals && meals.length > 0) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${mealType.emoji} ${mealType.label}:`, margin + 5, yPosition);
          yPosition += 6;
          
          meals.forEach(meal => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const mealText = `• ${meal.recipeName || 'Unnamed Recipe'}`;
            const servingsText = meal.servings ? ` (${meal.servings} servings)` : '';
            const timeText = meal.cookingTime ? ` - ${meal.cookingTime} min` : '';
            
            doc.text(mealText + servingsText + timeText, margin + 10, yPosition);
            yPosition += 5;
            
            if (meal.notes) {
              doc.setFontSize(9);
              doc.setTextColor(100, 100, 100);
              doc.text(`  Note: ${meal.notes}`, margin + 10, yPosition);
              doc.setTextColor(0, 0, 0);
              yPosition += 4;
            }
          });
          
          yPosition += 3;
        }
      });
      
      yPosition += 8;
    });
    
    // Add shopping list if requested
    if (includeIngredients) {
      doc.addPage();
      yPosition = margin;
      
      // Shopping list title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Shopping List', margin, yPosition);
      yPosition += 15;
      
      const shoppingList = generateShoppingList(mealPlan);
      
      Object.entries(shoppingList).forEach(([category, ingredients]) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }
        
        // Category header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(category, margin, yPosition);
        yPosition += 8;
        
        // Ingredients
        ingredients.forEach(ingredient => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`• ${ingredient.amount} ${ingredient.unit} ${ingredient.name}`, margin + 5, yPosition);
          yPosition += 5;
        });
        
        yPosition += 5;
      });
    }
    
    // Generate filename
    const dateStr = mealPlan.weekStartDate.toISOString().split('T')[0];
    const filename = `meal-plan-${dateStr}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    return {
      success: true,
      filename,
      message: 'Meal plan exported successfully!'
    };
    
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return {
      success: false,
      error: 'Failed to export meal plan to PDF',
      message: 'Please try again or contact support if the issue persists.'
    };
  }
}

/**
 * Export shopping list only as PDF
 */
export async function exportShoppingListToPDF(mealPlan: IMealPlan) {
  try {
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Shopping List', margin, yPosition);
    yPosition += 10;
    
    // Date range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const startDate = mealPlan.weekStartDate.toLocaleDateString();
    const endDate = mealPlan.weekEndDate.toLocaleDateString();
    doc.text(`For meal plan: ${startDate} - ${endDate}`, margin, yPosition);
    yPosition += 15;
    
    const shoppingList = generateShoppingList(mealPlan);
    
    Object.entries(shoppingList).forEach(([category, ingredients]) => {
      // Category header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(category, margin, yPosition);
      yPosition += 8;
      
      // Ingredients
      ingredients.forEach(ingredient => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`☐ ${ingredient.amount} ${ingredient.unit} ${ingredient.name}`, margin + 5, yPosition);
        yPosition += 6;
      });
      
      yPosition += 5;
    });
    
    const dateStr = mealPlan.weekStartDate.toISOString().split('T')[0];
    doc.save(`shopping-list-${dateStr}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to export shopping list:', error);
    return { success: false, error: 'Failed to export shopping list' };
  }
}