/**
 * Meal Plan Service
 * 
 * Handles communication between meal planning components and MongoDB backend
 */

import type { IMealPlan } from '@/types/meal-planning';

export class MealPlanService {
  private static baseUrl = '/api/meal-plans';

  /**
   * Get meal plans for a specific user
   */
  static async getMealPlans(weekStart?: string): Promise<IMealPlan[]> {
    try {
      const params = new URLSearchParams();
      if (weekStart) {
        params.append('weekStart', weekStart);
      }

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch meal plans: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }
  }

  /**
   * Get a specific meal plan by ID
   */
  static async getMealPlan(id: string): Promise<IMealPlan | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch meal plan: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      throw error;
    }
  }

  /**
   * Create a new meal plan
   */
  static async createMealPlan(data: {
    weekStartDate: string;
    title?: string;
    isTemplate?: boolean;
    copyFromWeek?: string;
  }): Promise<IMealPlan> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to create meal plan');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing meal plan
   */
  static async updateMealPlan(id: string, data: Partial<IMealPlan>): Promise<IMealPlan> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to update meal plan');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
  }

  /**
   * Delete a meal plan
   */
  static async deleteMealPlan(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to delete meal plan');
      }
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  }

  /**
   * Get meal plan for a specific week, create if it doesn't exist
   */
  static async getOrCreateWeeklyPlan(weekStartDate: Date): Promise<IMealPlan> {
    const weekKey = weekStartDate.toISOString().split('T')[0];
    
    try {
      // First try to get existing meal plan
      const existingPlans = await this.getMealPlans(weekKey);
      
      if (existingPlans && existingPlans.length > 0) {
        return existingPlans[0];
      }

      // If no plan exists, create a new one
      try {
        return await this.createMealPlan({
          weekStartDate: weekKey,
          title: `Week of ${weekStartDate.toLocaleDateString()}`,
        });
      } catch (createError) {
        // If creation fails due to duplicate, try to get the existing plan again
        if (createError instanceof Error && (
          createError.message.includes('already exists') || 
          createError.message.includes('duplicate') ||
          createError.message.includes('one meal plan per week')
        )) {
          console.log('Meal plan already exists, fetching existing one...');
          const retryPlans = await this.getMealPlans(weekKey);
          if (retryPlans && retryPlans.length > 0) {
            return retryPlans[0];
          }
          // If we still can't find it, create a fallback error
          throw new Error('Unable to find or create meal plan for this week');
        }
        // Re-throw other creation errors
        throw createError;
      }
    } catch (error) {
      console.error('Error getting or creating weekly plan:', error);
      throw error;
    }
  }

  /**
   * Save meal plan to backend (debounced for frequent updates)
   */
  private static saveTimeouts = new Map<string, NodeJS.Timeout>();

  static async debouncedSave(mealPlan: IMealPlan, debounceMs = 1000): Promise<void> {
    const planId = mealPlan._id;
    if (!planId) return;

    // Clear existing timeout for this plan
    const existingTimeout = this.saveTimeouts.get(planId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        await this.updateMealPlan(planId, mealPlan);
        console.log('Meal plan auto-saved:', planId);
        this.saveTimeouts.delete(planId);
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Could show user notification here
      }
    }, debounceMs);

    this.saveTimeouts.set(planId, timeout);
  }

  /**
   * Force save immediately (for important operations)
   */
  static async forceSave(mealPlan: IMealPlan): Promise<void> {
    const planId = mealPlan._id;
    if (!planId) return;

    // Clear any pending debounced save
    const existingTimeout = this.saveTimeouts.get(planId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.saveTimeouts.delete(planId);
    }

    // Save immediately
    try {
      await this.updateMealPlan(planId, mealPlan);
      console.log('Meal plan force-saved:', planId);
    } catch (error) {
      console.error('Force save failed:', error);
      throw error;
    }
  }
}