/**
 * Category Type Definitions for SmartPlates
 * 
 * This file defines all category-related types used throughout the application.
 * Categories help organize recipes by cuisine, diet, or cooking style.
 */

import { ObjectId } from 'mongodb';

// Main Category interface - represents a recipe category in our database
export interface Category {
  _id?: ObjectId | string;           // MongoDB ObjectId or string
  name: string;                      // Category name (e.g., "Italian", "Vegetarian")
  description?: string;              // Category description
  
  // Visual representation
  icon?: string;                     // Icon name or URL for the category
  color?: string;                    // Color theme for the category
  image?: string;                    // Category banner image
  
  // Category metadata
  isActive: boolean;                 // Whether category is currently active
  sortOrder: number;                 // Display order (lower numbers first)
  
  // Statistics (calculated fields)
  recipeCount?: number;              // Number of recipes in this category
  
  // Timestamps
  createdAt: Date;                   // When category was created
  updatedAt: Date;                   // Last time category was updated
}

// Category creation input (what we need when creating a new category)
export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  image?: string;
  isActive?: boolean;                // Optional, defaults to true
  sortOrder?: number;                // Optional, calculated if not provided
}

// Category update input (what can be updated)
export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Category with recipe count (for admin dashboard)
export interface CategoryWithStats extends Category {
  recipeCount: number;               // Number of recipes in this category
  recentRecipes?: string[];          // Recent recipe titles for preview
}

// Category dropdown option (simplified for forms)
export interface CategoryOption {
  _id: ObjectId | string;
  name: string;
  icon?: string;
}
