/**
 * Category Input Validation Schemas
 * 
 * Zod validation schemas for all category-related operations.
 * These schemas ensure category data quality and provide user-friendly error messages in German.
 */

import { z } from 'zod';

/**
 * Schema for creating a new category
 */
export const createCategoryValidation = z.object({
  name: z
    .string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein')
    .trim(),
  description: z
    .string()
    .min(5, 'Beschreibung muss mindestens 5 Zeichen lang sein')
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein')
    .trim()
    .optional(),
  slug: z
    .string()
    .min(2, 'URL-Name (Slug) muss mindestens 2 Zeichen lang sein')
    .max(100, 'URL-Name (Slug) darf maximal 100 Zeichen lang sein')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten')
    .optional(), // wird automatisch aus name generiert wenn nicht angegeben
  parentId: z
    .string()
    .min(1, 'Parent-Kategorie-ID darf nicht leer sein')
    .optional(),
  icon: z
    .string()
    .max(50, 'Icon-Name darf maximal 50 Zeichen lang sein')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Farbe muss ein gültiger Hex-Code sein (z.B. #FF5733)')
    .optional(),
  sortOrder: z
    .number()
    .int('Sortierung muss eine ganze Zahl sein')
    .min(0, 'Sortierung darf nicht negativ sein')
    .max(1000, 'Sortierung darf maximal 1000 sein')
    .default(0),
  isActive: z
    .boolean()
    .default(true),
  metaTitle: z
    .string()
    .max(60, 'Meta-Titel darf maximal 60 Zeichen lang sein (SEO-optimiert)')
    .optional(),
  metaDescription: z
    .string()
    .max(160, 'Meta-Beschreibung darf maximal 160 Zeichen lang sein (SEO-optimiert)')
    .optional()
});

/**
 * Schema for updating an existing category
 */
export const updateCategoryValidation = z.object({
  name: z
    .string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein')
    .trim()
    .optional(),
  description: z
    .string()
    .min(5, 'Beschreibung muss mindestens 5 Zeichen lang sein')
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein')
    .trim()
    .optional(),
  slug: z
    .string()
    .min(2, 'URL-Name (Slug) muss mindestens 2 Zeichen lang sein')
    .max(100, 'URL-Name (Slug) darf maximal 100 Zeichen lang sein')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten')
    .optional(),
  parentId: z
    .string()
    .min(1, 'Parent-Kategorie-ID darf nicht leer sein')
    .nullish(), // kann null sein um parent zu entfernen
  icon: z
    .string()
    .max(50, 'Icon-Name darf maximal 50 Zeichen lang sein')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Farbe muss ein gültiger Hex-Code sein (z.B. #FF5733)')
    .optional(),
  sortOrder: z
    .number()
    .int('Sortierung muss eine ganze Zahl sein')
    .min(0, 'Sortierung darf nicht negativ sein')
    .max(1000, 'Sortierung darf maximal 1000 sein')
    .optional(),
  isActive: z
    .boolean()
    .optional(),
  metaTitle: z
    .string()
    .max(60, 'Meta-Titel darf maximal 60 Zeichen lang sein (SEO-optimiert)')
    .optional(),
  metaDescription: z
    .string()
    .max(160, 'Meta-Beschreibung darf maximal 160 Zeichen lang sein (SEO-optimiert)')
    .optional()
});

/**
 * Schema for category search and filtering
 */
export const categorySearchValidation = z.object({
  query: z
    .string()
    .max(200, 'Suchbegriff darf maximal 200 Zeichen lang sein')
    .optional(),
  parentId: z
    .string()
    .min(1, 'Parent-Kategorie-ID darf nicht leer sein')
    .optional(),
  isActive: z
    .boolean()
    .optional(),
  hasRecipes: z
    .boolean()
    .optional(), // nur Kategorien mit Rezepten anzeigen
  page: z
    .number()
    .int('Seitenzahl muss eine ganze Zahl sein')
    .positive('Seitenzahl muss positiv sein')
    .default(1),
  limit: z
    .number()
    .int('Limit muss eine ganze Zahl sein')
    .positive('Limit muss positiv sein')
    .max(100, 'Maximal 100 Kategorien pro Seite')
    .default(20),
  sortBy: z
    .enum(['name', 'createdAt', 'sortOrder', 'recipeCount'], {
      message: 'Sortierung muss name, createdAt, sortOrder oder recipeCount sein'
    })
    .default('sortOrder'),
  sortOrder: z
    .enum(['asc', 'desc'], {
      message: 'Sortierreihenfolge muss asc oder desc sein'
    })
    .default('asc')
});

/**
 * Schema for bulk category operations
 */
export const bulkCategoryValidation = z.object({
  categoryIds: z
    .array(z.string().min(1, 'Kategorie-ID darf nicht leer sein'))
    .min(1, 'Mindestens eine Kategorie-ID ist erforderlich')
    .max(50, 'Maximal 50 Kategorien können gleichzeitig verarbeitet werden'),
  action: z.enum(['delete', 'activate', 'deactivate', 'reorder'], {
    message: 'Aktion muss delete, activate, deactivate oder reorder sein'
  }),
  newSortOrders: z
    .array(z.number().int().min(0))
    .optional() // nur für reorder action erforderlich
});

/**
 * Schema for category hierarchy operations
 */
export const categoryHierarchyValidation = z.object({
  categoryId: z
    .string()
    .min(1, 'Kategorie-ID ist erforderlich'),
  newParentId: z
    .string()
    .min(1, 'Neue Parent-Kategorie-ID darf nicht leer sein')
    .nullish(), // kann null sein für root-level
  newSortOrder: z
    .number()
    .int('Sortierung muss eine ganze Zahl sein')
    .min(0, 'Sortierung darf nicht negativ sein')
    .optional()
});

/**
 * Schema for category import/export
 */
export const categoryImportValidation = z.object({
  categories: z
    .array(createCategoryValidation.omit({ isActive: true }))
    .min(1, 'Mindestens eine Kategorie zum Importieren erforderlich')
    .max(200, 'Maximal 200 Kategorien können gleichzeitig importiert werden'),
  overwriteExisting: z
    .boolean()
    .default(false),
  preserveHierarchy: z
    .boolean()
    .default(true)
});

// Export types for TypeScript integration
export type CreateCategoryInput = z.infer<typeof createCategoryValidation>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryValidation>;
export type CategorySearchInput = z.infer<typeof categorySearchValidation>;
export type BulkCategoryInput = z.infer<typeof bulkCategoryValidation>;
export type CategoryHierarchyInput = z.infer<typeof categoryHierarchyValidation>;
export type CategoryImportInput = z.infer<typeof categoryImportValidation>;
