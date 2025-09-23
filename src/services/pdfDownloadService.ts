/**
 * PDF Download Service
 * 
 * Service for generating and downloading meal plan PDFs
 * Includes weekly calendar view and ingredients list
 */

import jsPDF from 'jspdf';
import type { IMealPlan, DayMeals, MealSlot } from '@/types/meal-planning';

interface IngredientItem {
  name: string;
  amount: string;
  unit: string;
  category: string;
}

export class MealPlanPDFService {
  private static readonly PAGE_MARGIN = 20;
  private static readonly LINE_HEIGHT = 8;
  private static readonly TITLE_HEIGHT = 12;

  /**
   * Generate and download weekly meal plan PDF
   */
  static async downloadWeeklyMealPlan(
    mealPlan: IMealPlan, 
    includeIngredients: boolean = true
  ): Promise<void> {
    const doc = new jsPDF();
    let yPosition = this.PAGE_MARGIN;

    // Add title
    yPosition = this.addTitle(doc, mealPlan, yPosition);

    // Add weekly calendar
    yPosition = this.addWeeklyCalendar(doc, mealPlan, yPosition);

    // Add ingredients list if requested
    if (includeIngredients) {
      yPosition = this.addIngredientsSection(doc, mealPlan, yPosition);
    }

    // Add footer
    this.addFooter(doc);

    // Download the PDF
    const fileName = `meal-plan-${this.formatDateForFilename(mealPlan.weekStartDate)}.pdf`;
    doc.save(fileName);
  }

  /**
   * Add title section to PDF
   */
  private static addTitle(doc: jsPDF, mealPlan: IMealPlan, yPosition: number): number {
    // Main title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = mealPlan.title || `Meal Plan - Week of ${mealPlan.weekStartDate.toLocaleDateString()}`;
    doc.text(title, this.PAGE_MARGIN, yPosition);
    yPosition += this.TITLE_HEIGHT + 5;

    // Date range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const dateRange = `${mealPlan.weekStartDate.toLocaleDateString()} - ${mealPlan.weekEndDate.toLocaleDateString()}`;
    doc.text(dateRange, this.PAGE_MARGIN, yPosition);
    yPosition += this.LINE_HEIGHT + 10;

    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(this.PAGE_MARGIN, yPosition, 190, yPosition);
    yPosition += 15;

    return yPosition;
  }

  /**
   * Add weekly calendar section to PDF
   */
  private static addWeeklyCalendar(doc: jsPDF, mealPlan: IMealPlan, yPosition: number): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Weekly Meal Plan', this.PAGE_MARGIN, yPosition);
    yPosition += this.TITLE_HEIGHT + 5;

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
    const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' };

    // Add each day
    mealPlan.days.forEach((day, dayIndex) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = this.PAGE_MARGIN;
      }

      // Day header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const dayName = dayNames[dayIndex];
      const dateStr = day.date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      doc.text(`${dayName} - ${dateStr}`, this.PAGE_MARGIN, yPosition);
      yPosition += this.LINE_HEIGHT + 3;

      // Meals for this day
      mealTypes.forEach(mealType => {
        const meals = day[mealType];
        if (meals && meals.length > 0) {
          // Meal type header
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const mealLabel = `${mealIcons[mealType]} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
          doc.text(mealLabel, this.PAGE_MARGIN + 10, yPosition);
          yPosition += this.LINE_HEIGHT;

          // Meal items
          doc.setFont('helvetica', 'normal');
          meals.forEach(meal => {
            const mealText = this.formatMealForPDF(meal);
            doc.text(`• ${mealText}`, this.PAGE_MARGIN + 20, yPosition);
            yPosition += this.LINE_HEIGHT;
          });
          yPosition += 2;
        }
      });

      // Day notes
      if (day.dailyNotes) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(`Notes: ${day.dailyNotes}`, this.PAGE_MARGIN + 10, yPosition);
        yPosition += this.LINE_HEIGHT;
      }

      yPosition += 8; // Space between days
    });

    return yPosition + 10;
  }

  /**
   * Add ingredients section to PDF
   */
  private static addIngredientsSection(doc: jsPDF, mealPlan: IMealPlan, yPosition: number): number {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = this.PAGE_MARGIN;
    }

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Shopping List', this.PAGE_MARGIN, yPosition);
    yPosition += this.TITLE_HEIGHT + 5;

    // Generate ingredients list
    const ingredients = this.generateIngredientsFromMealPlan(mealPlan);
    const categorizedIngredients = this.categorizeIngredients(ingredients);

    // Add ingredients by category
    Object.entries(categorizedIngredients).forEach(([category, items]) => {
      if (items.length === 0) return;

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = this.PAGE_MARGIN;
      }

      // Category header
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(category, this.PAGE_MARGIN, yPosition);
      yPosition += this.LINE_HEIGHT + 2;

      // Category items
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      items.forEach(ingredient => {
        const ingredientText = `• ${ingredient.name}${ingredient.amount ? ` - ${ingredient.amount} ${ingredient.unit}` : ''}`;
        doc.text(ingredientText, this.PAGE_MARGIN + 10, yPosition);
        yPosition += this.LINE_HEIGHT;
      });
      yPosition += 5;
    });

    return yPosition;
  }

  /**
   * Add footer to PDF
   */
  private static addFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      
      // Page number
      doc.text(`Page ${i} of ${pageCount}`, 180, 285);
      
      // Generated timestamp
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, this.PAGE_MARGIN, 285);
      
      // SmartPlates branding
      doc.text('Created with SmartPlates', 95, 285);
    }
  }

  /**
   * Format meal for PDF display
   */
  private static formatMealForPDF(meal: MealSlot): string {
    let text = meal.recipeName || 'Unnamed Recipe';
    
    if (meal.servings && meal.servings > 1) {
      text += ` (${meal.servings} servings)`;
    }
    
    const totalTime = (meal.cookingTime || 0) + (meal.prepTime || 0);
    if (totalTime > 0) {
      text += ` - ${totalTime} min`;
    }
    
    if (meal.notes) {
      text += ` | ${meal.notes}`;
    }
    
    return text;
  }

  /**
   * Generate ingredients from meal plan
   */
  private static generateIngredientsFromMealPlan(mealPlan: IMealPlan): IngredientItem[] {
    const ingredients: IngredientItem[] = [];
    
    // This is a mock implementation
    // In a real app, you would extract ingredients from actual recipes
    mealPlan.days.forEach(day => {
      const allMeals = [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snacks];
      
      allMeals.forEach(meal => {
        if (meal.recipeName) {
          // Mock ingredients based on recipe name
          const mockIngredients = this.getMockIngredients(meal.recipeName, meal.servings || 1);
          ingredients.push(...mockIngredients);
        }
      });
    });

    // Combine similar ingredients
    return this.consolidateIngredients(ingredients);
  }

  /**
   * Get mock ingredients for a recipe (in real app, this would come from recipe data)
   */
  private static getMockIngredients(recipeName: string, servings: number): IngredientItem[] {
    const baseIngredients: Record<string, IngredientItem[]> = {
      'Grilled Chicken Salad': [
        { name: 'Chicken Breast', amount: (200 * servings).toString(), unit: 'g', category: 'Meat & Poultry' },
        { name: 'Mixed Greens', amount: (100 * servings).toString(), unit: 'g', category: 'Vegetables' },
        { name: 'Cherry Tomatoes', amount: (150 * servings).toString(), unit: 'g', category: 'Vegetables' },
        { name: 'Olive Oil', amount: (2 * servings).toString(), unit: 'tbsp', category: 'Oils & Condiments' }
      ],
      'Pasta Primavera': [
        { name: 'Pasta', amount: (100 * servings).toString(), unit: 'g', category: 'Pantry Staples' },
        { name: 'Bell Peppers', amount: (1 * servings).toString(), unit: 'piece', category: 'Vegetables' },
        { name: 'Zucchini', amount: (1 * servings).toString(), unit: 'piece', category: 'Vegetables' },
        { name: 'Parmesan Cheese', amount: (50 * servings).toString(), unit: 'g', category: 'Dairy' }
      ]
    };

    return baseIngredients[recipeName] || [
      { name: `Ingredients for ${recipeName}`, amount: '', unit: '', category: 'Other' }
    ];
  }

  /**
   * Consolidate similar ingredients
   */
  private static consolidateIngredients(ingredients: IngredientItem[]): IngredientItem[] {
    const consolidated: Record<string, IngredientItem> = {};
    
    ingredients.forEach(ingredient => {
      const key = `${ingredient.name}-${ingredient.unit}`;
      
      if (consolidated[key]) {
        // Add amounts if they're numeric
        const existingAmount = parseFloat(consolidated[key].amount) || 0;
        const newAmount = parseFloat(ingredient.amount) || 0;
        consolidated[key].amount = (existingAmount + newAmount).toString();
      } else {
        consolidated[key] = { ...ingredient };
      }
    });
    
    return Object.values(consolidated);
  }

  /**
   * Categorize ingredients
   */
  private static categorizeIngredients(ingredients: IngredientItem[]): Record<string, IngredientItem[]> {
    const categories: Record<string, IngredientItem[]> = {
      'Meat & Poultry': [],
      'Dairy': [],
      'Vegetables': [],
      'Fruits': [],
      'Pantry Staples': [],
      'Oils & Condiments': [],
      'Other': []
    };

    ingredients.forEach(ingredient => {
      const category = ingredient.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(ingredient);
    });

    // Sort items within each category
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return categories;
  }

  /**
   * Format date for filename
   */
  private static formatDateForFilename(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}