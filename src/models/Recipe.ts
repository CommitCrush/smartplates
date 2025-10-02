/**
 * Recipe Database Model for SmartPlates
 *
 * This file defines the Mongoose schema and model for the Recipe collection.
 * It ensures that recipe data is stored in a structured and consistent manner.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import type { Recipe as RecipeType } from '@/types/recipe.d';

// Define the Mongoose document interface, extending the base RecipeType
export interface IRecipe extends RecipeType, Document {
  _id: mongoose.Types.ObjectId;
  id: string; // Mongoose virtual
}

// Define the Mongoose schema for a Recipe
const RecipeSchema: Schema<IRecipe> = new Schema({
  spoonacularId: { type: Number, unique: true, sparse: true }, // Added for Spoonacular recipes
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  summary: { type: String, required: true },
  image: { type: String, default: '/placeholder-recipe.svg' },
  readyInMinutes: { type: Number, required: true, min: 0 },
  servings: { type: Number, required: true, min: 1 },
  
  extendedIngredients: [{
    id: { type: Schema.Types.Mixed, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, required: true },
    notes: { type: String }
  }],
  
  analyzedInstructions: [{
    name: { type: String },
    steps: [{
      number: { type: Number, required: true },
      step: { type: String, required: true }
    }]
  }],
  
  cuisines: [{ type: String }],
  dishTypes: [{ type: String }],
  diets: [{ type: String }],
  
  nutrition: {
    nutrients: [{
      name: String,
      amount: Number,
      unit: String
    }]
  },
  
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingsCount: { type: Number, default: 0, min: 0 },
  likesCount: { type: Number, default: 0, min: 0 },
  
  authorId: { type: String, index: true },
  authorName: { type: String },
  
  isPublished: { type: Boolean, default: true },
  isPending: { type: Boolean, default: false },
  moderationNotes: { type: String, default: '' },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Add an index for full-text search on title and description
RecipeSchema.index({ title: 'text', description: 'text' });

// Create the Mongoose model
const Recipe: Model<IRecipe> = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;
