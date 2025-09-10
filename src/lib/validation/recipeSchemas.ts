/**
 * Recipe Input Validation Schemas
 * 
 * Zod validation schemas for all recipe-related operations.
 * These schemas ensure recipe data quality and provide user-friendly error messages in German.
 */

import { z } from 'zod';

// Recipe difficulty validation
const recipeDifficultySchema = z.enum(['easy', 'medium', 'hard'], {
  message: 'Schwierigkeit muss easy, medium oder hard sein'
});

// Meal type validation
const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert'], {
  message: 'Mahlzeittyp muss breakfast, lunch, dinner, snack oder dessert sein'
});

// Recipe ingredient validation
const recipeIngredientSchema = z.object({
  name: z
    .string()
    .min(1, 'Zutat Name ist erforderlich')
    .max(100, 'Zutat Name darf maximal 100 Zeichen lang sein')
    .trim(),
  quantity: z
    .number()
    .positive('Menge muss positiv sein')
    .max(10000, 'Menge ist zu groß'),
  unit: z
    .string()
    .min(1, 'Einheit ist erforderlich')
    .max(50, 'Einheit darf maximal 50 Zeichen lang sein')
    .trim(),
  notes: z
    .string()
    .max(200, 'Notizen dürfen maximal 200 Zeichen lang sein')
    .optional()
});

// Recipe instruction step validation
const recipeStepSchema = z.object({
  stepNumber: z
    .number()
    .int('Schrittnummer muss eine ganze Zahl sein')
    .positive('Schrittnummer muss positiv sein'),
  instruction: z
    .string()
    .min(5, 'Anweisung muss mindestens 5 Zeichen lang sein')
    .max(1000, 'Anweisung darf maximal 1000 Zeichen lang sein')
    .trim(),
  duration: z
    .number()
    .int('Dauer muss eine ganze Zahl in Minuten sein')
    .positive('Dauer muss positiv sein')
    .max(1440, 'Dauer darf maximal 24 Stunden (1440 Minuten) sein')
    .optional(),
  temperature: z
    .number()
    .int('Temperatur muss eine ganze Zahl sein')
    .min(0, 'Temperatur darf nicht negativ sein')
    .max(500, 'Temperatur darf maximal 500°C sein')
    .optional()
});

// Recipe nutrition validation
const recipeNutritionSchema = z.object({
  calories: z
    .number()
    .int('Kalorien müssen eine ganze Zahl sein')
    .min(0, 'Kalorien dürfen nicht negativ sein')
    .max(10000, 'Kalorien sind zu hoch')
    .optional(),
  protein: z
    .number()
    .min(0, 'Protein darf nicht negativ sein')
    .max(500, 'Proteinwert ist zu hoch')
    .optional(),
  carbs: z
    .number()
    .min(0, 'Kohlenhydrate dürfen nicht negativ sein')
    .max(500, 'Kohlenhydratwert ist zu hoch')
    .optional(),
  fat: z
    .number()
    .min(0, 'Fett darf nicht negativ sein')
    .max(500, 'Fettwert ist zu hoch')
    .optional(),
  fiber: z
    .number()
    .min(0, 'Ballaststoffe dürfen nicht negativ sein')
    .max(100, 'Ballaststoffwert ist zu hoch')
    .optional()
});

/**
 * Schema for creating a new recipe
 */
export const createRecipeValidation = z.object({
  title: z
    .string()
    .min(3, 'Titel muss mindestens 3 Zeichen lang sein')
    .max(200, 'Titel darf maximal 200 Zeichen lang sein')
    .trim(),
  description: z
    .string()
    .min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein')
    .max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein')
    .trim(),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, 'Mindestens eine Zutat ist erforderlich')
    .max(50, 'Maximal 50 Zutaten erlaubt'),
  instructions: z
    .array(recipeStepSchema)
    .min(1, 'Mindestens eine Anweisung ist erforderlich')
    .max(50, 'Maximal 50 Anweisungen erlaubt'),
  cookingTime: z
    .number()
    .int('Kochzeit muss eine ganze Zahl in Minuten sein')
    .positive('Kochzeit muss positiv sein')
    .max(1440, 'Kochzeit darf maximal 24 Stunden sein'),
  prepTime: z
    .number()
    .int('Vorbereitungszeit muss eine ganze Zahl in Minuten sein')
    .positive('Vorbereitungszeit muss positiv sein')
    .max(1440, 'Vorbereitungszeit darf maximal 24 Stunden sein')
    .optional(),
  totalTime: z
    .number()
    .int('Gesamtzeit muss eine ganze Zahl in Minuten sein')
    .positive('Gesamtzeit muss positiv sein')
    .max(1440, 'Gesamtzeit darf maximal 24 Stunden sein')
    .optional(),
  servings: z
    .number()
    .int('Portionen müssen eine ganze Zahl sein')
    .positive('Portionen müssen positiv sein')
    .max(100, 'Maximal 100 Portionen erlaubt'),
  difficulty: recipeDifficultySchema,
  mealType: z
    .array(mealTypeSchema)
    .min(1, 'Mindestens ein Mahlzeittyp ist erforderlich')
    .max(5, 'Maximal 5 Mahlzeittypen erlaubt'),
  categoryId: z
    .string()
    .min(1, 'Kategorie ist erforderlich'),
  tags: z
    .array(z.string().min(1, 'Tag darf nicht leer sein'))
    .max(20, 'Maximal 20 Tags erlaubt')
    .optional(),
  imageUrl: z
    .string()
    .url('Bild muss eine gültige URL sein')
    .optional(),
  videoUrl: z
    .string()
    .url('Video muss eine gültige URL sein')
    .optional(),
  nutrition: recipeNutritionSchema.optional(),
  isPublic: z
    .boolean()
    .default(true),
  allergens: z
    .array(z.string().min(1, 'Allergen darf nicht leer sein'))
    .max(20, 'Maximal 20 Allergene erlaubt')
    .optional()
});

/**
 * Schema for updating an existing recipe
 */
export const updateRecipeValidation = createRecipeValidation.partial();

/**
 * Schema for recipe search and filtering
 */
export const recipeSearchValidation = z.object({
  query: z
    .string()
    .max(200, 'Suchbegriff darf maximal 200 Zeichen lang sein')
    .optional(),
  categoryId: z
    .string()
    .min(1, 'Kategorie-ID darf nicht leer sein')
    .optional(),
  difficulty: recipeDifficultySchema.optional(),
  mealType: mealTypeSchema.optional(),
  maxCookingTime: z
    .number()
    .int('Maximale Kochzeit muss eine ganze Zahl sein')
    .positive('Maximale Kochzeit muss positiv sein')
    .optional(),
  maxCalories: z
    .number()
    .int('Maximale Kalorien müssen eine ganze Zahl sein')
    .positive('Maximale Kalorien müssen positiv sein')
    .optional(),
  allergenFree: z
    .array(z.string())
    .optional(),
  page: z
    .number()
    .int('Seitenzahl muss eine ganze Zahl sein')
    .positive('Seitenzahl muss positiv sein')
    .default(1),
  limit: z
    .number()
    .int('Limit muss eine ganze Zahl sein')
    .positive('Limit muss positiv sein')
    .max(100, 'Maximal 100 Rezepte pro Seite')
    .default(10)
});

/**
 * Schema for recipe rating
 */
export const recipeRatingValidation = z.object({
  recipeId: z
    .string()
    .min(1, 'Rezept-ID ist erforderlich'),
  rating: z
    .number()
    .int('Bewertung muss eine ganze Zahl sein')
    .min(1, 'Bewertung muss mindestens 1 sein')
    .max(5, 'Bewertung darf maximal 5 sein'),
  comment: z
    .string()
    .max(500, 'Kommentar darf maximal 500 Zeichen lang sein')
    .optional()
});

/**
 * Schema for bulk recipe operations
 */
export const bulkRecipeValidation = z.object({
  recipeIds: z
    .array(z.string().min(1, 'Rezept-ID darf nicht leer sein'))
    .min(1, 'Mindestens eine Rezept-ID ist erforderlich')
    .max(50, 'Maximal 50 Rezepte können gleichzeitig verarbeitet werden'),
  action: z.enum(['delete', 'publish', 'unpublish', 'feature'], {
    message: 'Aktion muss delete, publish, unpublish oder feature sein'
  })
});

// Export types for TypeScript integration
export type CreateRecipeInput = z.infer<typeof createRecipeValidation>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeValidation>;
export type RecipeSearchInput = z.infer<typeof recipeSearchValidation>;
export type RecipeRatingInput = z.infer<typeof recipeRatingValidation>;
export type BulkRecipeInput = z.infer<typeof bulkRecipeValidation>;
