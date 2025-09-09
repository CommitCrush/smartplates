/**
 * User Input Validation Schemas
 * 
 * Zod validation schemas for all user-related operations.
 * These schemas ensure data quality and provide user-friendly error messages in German.
 */

import { z } from 'zod';

// User role validation
const userRoleSchema = z.enum(['user', 'admin', 'viewer'], {
  message: 'Rolle muss user, admin oder viewer sein'
});

// Email validation with custom message
const emailSchema = z
  .string()
  .email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
  .min(1, 'E-Mail-Adresse ist erforderlich')
  .max(255, 'E-Mail-Adresse ist zu lang (maximal 255 Zeichen)');

// Name validation
const nameSchema = z
  .string()
  .min(2, 'Name muss mindestens 2 Zeichen lang sein')
  .max(100, 'Name darf maximal 100 Zeichen lang sein')
  .trim();

// Avatar URL validation
const avatarSchema = z
  .string()
  .url('Avatar muss eine gültige URL sein')
  .optional();

// Google ID validation
const googleIdSchema = z
  .string()
  .min(1, 'Google ID darf nicht leer sein')
  .optional();

// Dietary restrictions validation
const dietaryRestrictionsSchema = z
  .array(z.string().min(1, 'Diätbeschränkung darf nicht leer sein'))
  .max(20, 'Maximal 20 Diätbeschränkungen erlaubt')
  .optional();

// Favorite categories validation
const favoriteCategoriesSchema = z
  .array(z.string().min(1, 'Kategorie-ID darf nicht leer sein'))
  .max(50, 'Maximal 50 Lieblingskategorien erlaubt')
  .optional();

/**
 * Schema for creating a new user account
 */
export const createUserValidation = z.object({
  email: emailSchema,
  name: nameSchema,
  avatar: avatarSchema,
  role: userRoleSchema.default('user'),
  googleId: googleIdSchema,
  dietaryRestrictions: dietaryRestrictionsSchema,
  favoriteCategories: favoriteCategoriesSchema,
});

/**
 * Schema for updating user profile information
 */
export const updateUserValidation = z.object({
  name: nameSchema.optional(),
  avatar: avatarSchema,
  dietaryRestrictions: dietaryRestrictionsSchema,
  favoriteCategories: favoriteCategoriesSchema,
  isEmailVerified: z.boolean().optional(),
}).partial();

/**
 * Schema for user login validation
 */
export const loginUserValidation = z.object({
  email: emailSchema,
  // Note: In real app, you'd have password validation here
  // For Google OAuth, we mainly validate email
});

/**
 * Schema for changing user role (admin operation)
 */
export const changeUserRoleValidation = z.object({
  userId: z.string().min(1, 'Benutzer-ID ist erforderlich'),
  newRole: userRoleSchema,
});

/**
 * Schema for bulk user operations
 */
export const bulkUserValidation = z.object({
  userIds: z
    .array(z.string().min(1, 'Benutzer-ID darf nicht leer sein'))
    .min(1, 'Mindestens eine Benutzer-ID ist erforderlich')
    .max(100, 'Maximal 100 Benutzer können gleichzeitig verarbeitet werden'),
  action: z.enum(['delete', 'activate', 'deactivate'], {
    message: 'Aktion muss delete, activate oder deactivate sein'
  })
});

// Export types for TypeScript integration
export type CreateUserInput = z.infer<typeof createUserValidation>;
export type UpdateUserInput = z.infer<typeof updateUserValidation>;
export type LoginUserInput = z.infer<typeof loginUserValidation>;
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleValidation>;
export type BulkUserInput = z.infer<typeof bulkUserValidation>;
