/**
 * MealPlan Model & Types
 * 
 * This model handles weekly meal planning with support for:
 * - Multiple meals per day (breakfast, lunch, dinner, snacks)
 * - Recipe associations (ready for real Recipe integration)
 * - User-specific meal plans
 * - Date-based organization
 */

import mongoose, { Schema, Document, models, model, Model } from 'mongoose';

// ========================================
// TypeScript Interfaces
// ========================================

/**
 * Individual meal slot within a day
 */
export interface MealSlot {
  recipeId?: string; // Reference to Recipe (will be populated later)
  recipeName?: string; // For display purposes and mock data
  servings?: number; // Number of servings planned
  notes?: string; // User notes for this meal
  cookingTime?: number; // In minutes
  prepTime?: number; // In minutes
}

/**
 * All meals for a single day
 */
export interface DayMeals {
  date: Date;
  breakfast: MealSlot[];
  lunch: MealSlot[];
  dinner: MealSlot[];
  snacks: MealSlot[];
  dailyNotes?: string; // Notes for the entire day
}

/**
 * Complete meal plan for a week
 */
export interface IMealPlan {
  userId: string;
  weekStartDate: Date; // Monday of the week
  weekEndDate: Date; // Sunday of the week
  title?: string; // User-defined name for the meal plan
  days: DayMeals[]; // 7 days of meals
  totalCalories?: number; // Calculated total (optional)
  shoppingListGenerated?: boolean; // Has shopping list been created
  isTemplate?: boolean; // Can be used as a template for future weeks
  tags?: string[]; // User tags for organization
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// Mongoose Schema
// ========================================

const MealSlotSchema = new Schema({
  recipeId: {
    type: String,
    required: false, // Optional for mock development
    index: true
  },
  recipeName: {
    type: String,
    required: false,
    trim: true
  },
  servings: {
    type: Number,
    default: 1,
    min: 1,
    max: 20
  },
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  cookingTime: {
    type: Number,
    min: 0,
    max: 480 // 8 hours max
  },
  prepTime: {
    type: Number,
    min: 0,
    max: 240 // 4 hours max
  }
}, { _id: false }); // Disable _id for subdocuments

const DayMealsSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  breakfast: [MealSlotSchema],
  lunch: [MealSlotSchema],
  dinner: [MealSlotSchema],
  snacks: [MealSlotSchema],
  dailyNotes: {
    type: String,
    maxlength: 1000,
    trim: true
  }
}, { _id: false });

const MealPlanSchema = new Schema<IMealPlan>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  weekStartDate: {
    type: Date,
    required: true,
    index: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    maxlength: 100,
    trim: true,
    default: function(this: IMealPlan) {
      const startDate = new Date(this.weekStartDate);
      return `Meal Plan - Week of ${startDate.toLocaleDateString()}`;
    }
  },
  days: {
    type: [DayMealsSchema],
    validate: {
      validator: function(days: DayMeals[]) {
        return days.length === 7; // Must have exactly 7 days
      },
      message: 'A meal plan must contain exactly 7 days'
    }
  },
  totalCalories: {
    type: Number,
    min: 0
  },
  shoppingListGenerated: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ========================================
// Indexes for Performance
// ========================================

MealPlanSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });
MealPlanSchema.index({ userId: 1, isTemplate: 1 });
MealPlanSchema.index({ weekStartDate: 1, weekEndDate: 1 });

// ========================================
// Virtual Fields
// ========================================

MealPlanSchema.virtual('weekNumber').get(function() {
  const startDate = new Date(this.weekStartDate);
  const oneJan = new Date(startDate.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((startDate.valueOf() - oneJan.valueOf()) / (24 * 60 * 60 * 1000));
  return Math.ceil((startDate.getDay() + 1 + numberOfDays) / 7);
});

// ========================================
// Instance Methods
// ========================================

MealPlanSchema.methods.addMealToDay = function(
  dayIndex: number, 
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', 
  meal: MealSlot
) {
  if (dayIndex < 0 || dayIndex >= 7) {
    throw new Error('Day index must be between 0 and 6');
  }
  
  if (!this.days[dayIndex]) {
    this.days[dayIndex] = {
      date: new Date(this.weekStartDate.getTime() + (dayIndex * 24 * 60 * 60 * 1000)),
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };
  }
  
  this.days[dayIndex][mealType].push(meal);
  this.updatedAt = new Date();
  return this.save();
};

MealPlanSchema.methods.removeMealFromDay = function(
  dayIndex: number, 
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', 
  mealIndex: number
) {
  if (dayIndex < 0 || dayIndex >= 7) {
    throw new Error('Day index must be between 0 and 6');
  }
  
  if (this.days[dayIndex] && this.days[dayIndex][mealType]) {
    this.days[dayIndex][mealType].splice(mealIndex, 1);
    this.updatedAt = new Date();
    return this.save();
  }
  
  throw new Error('Meal not found');
};

MealPlanSchema.methods.getTotalMealsCount = function() {
  return this.days.reduce((total: number, day: DayMeals) => {
    return total + 
      day.breakfast.length + 
      day.lunch.length + 
      day.dinner.length + 
      day.snacks.length;
  }, 0);
};

MealPlanSchema.methods.getDayByDate = function(date: Date) {
  return this.days.find((day: DayMeals) => 
    day.date.toDateString() === date.toDateString()
  );
};

// ========================================
// Static Methods
// ========================================

MealPlanSchema.statics.findByUserAndWeek = function(userId: string, weekStartDate: Date) {
  return this.findOne({ 
    userId, 
    weekStartDate: {
      $gte: weekStartDate,
      $lt: new Date(weekStartDate.getTime() + (7 * 24 * 60 * 60 * 1000))
    }
  });
};

MealPlanSchema.statics.findUserTemplates = function(userId: string) {
  return this.find({ userId, isTemplate: true }).sort({ createdAt: -1 });
};

MealPlanSchema.statics.createWeeklyPlan = function(userId: string, weekStartDate: Date) {
  const weekEndDate = new Date(weekStartDate.getTime() + (6 * 24 * 60 * 60 * 1000));
  
  const days: DayMeals[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStartDate.getTime() + (i * 24 * 60 * 60 * 1000));
    days.push({
      date: dayDate,
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    });
  }
  
  return new this({
    userId,
    weekStartDate,
    weekEndDate,
    days
  });
};

// ========================================
// Pre-save Middleware
// ========================================

MealPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Ensure weekEndDate is calculated correctly
  if (this.weekStartDate && !this.weekEndDate) {
    this.weekEndDate = new Date(this.weekStartDate.getTime() + (6 * 24 * 60 * 60 * 1000));
  }
  
  // Validate that weekStartDate is a Monday
  const dayOfWeek = this.weekStartDate.getDay();
  if (dayOfWeek !== 1) { // Monday = 1
    // Adjust to previous Monday
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    this.weekStartDate = new Date(
      this.weekStartDate.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000)
    );
    this.weekEndDate = new Date(
      this.weekStartDate.getTime() + (6 * 24 * 60 * 60 * 1000)
    );
  }
  
  next();
});

// ========================================
// Model Export
// ========================================

export interface IMealPlanDocument extends IMealPlan, Document {
  addMealToDay(
    dayIndex: number, 
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', 
    meal: MealSlot
  ): Promise<IMealPlanDocument>;
  
  removeMealFromDay(
    dayIndex: number, 
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', 
    mealIndex: number
  ): Promise<IMealPlanDocument>;
  
  getTotalMealsCount(): number;
  getDayByDate(date: Date): DayMeals | undefined;
  weekNumber: number;
}

// Static methods for the model
MealPlanSchema.statics.findByUserAndWeek = function(userId: string, weekStartDate: Date) {
  return this.findOne({ userId, weekStartDate });
};

MealPlanSchema.statics.findUserTemplates = function(userId: string) {
  return this.find({ userId, isTemplate: true });
};

MealPlanSchema.statics.createWeeklyPlan = function(userId: string, weekStartDate: Date) {
  const weekEndDate = new Date(weekStartDate.getTime() + (6 * 24 * 60 * 60 * 1000));
  
  // Create 7 days of dates starting from weekStartDate
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    weekDates.push(date);
  }
  
  return new this({
    userId,
    weekStartDate,
    weekEndDate,
    title: `Week of ${weekStartDate.toLocaleDateString()}`,
    days: weekDates.map((date: Date) => ({
      date,
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    }))
  });
};

const MealPlan = models.MealPlan || model('MealPlan', MealPlanSchema);

export default MealPlan;

// Utility functions moved to @/types/meal-planning.ts for client-side use