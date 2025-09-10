/**
 * API Request and Response Validation Middleware
 * 
 * This file provides utilities for validating API requests and responses
 * consistently across all endpoints in the SmartPlates application.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';

// Standard API response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

/**
 * Validates request body against a Zod schema
 * @param request - NextRequest object
 * @param schema - Zod validation schema
 * @returns Validated data or throws validation error
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      throw new ValidationError('Eingabedaten sind ungültig', validationErrors);
    }
    
    if (error instanceof SyntaxError) {
      throw new ValidationError('Ungültiges JSON-Format in der Anfrage');
    }
    
    throw error;
  }
}

/**
 * Validates query parameters against a Zod schema
 * @param request - NextRequest object
 * @param schema - Zod validation schema
 * @returns Validated query parameters
 */
export function validateQueryParameters<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  try {
    const url = new URL(request.url);
    const queryParams: Record<string, string | number | boolean> = {};
    
    // Convert URLSearchParams to object
    url.searchParams.forEach((value, key) => {
      // Try to parse numbers and booleans
      if (value === 'true') {
        queryParams[key] = true;
      } else if (value === 'false') {
        queryParams[key] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        queryParams[key] = Number(value);
      } else {
        queryParams[key] = value;
      }
    });
    
    return schema.parse(queryParams);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      throw new ValidationError('URL-Parameter sind ungültig', validationErrors);
    }
    
    throw error;
  }
}

/**
 * Validates path parameters (like /api/users/[id])
 * @param params - Parameters object from Next.js
 * @param schema - Zod validation schema
 * @returns Validated path parameters
 */
export function validatePathParameters<T>(
  params: Record<string, string | string[]>,
  schema: ZodSchema<T>
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      throw new ValidationError('URL-Pfad-Parameter sind ungültig', validationErrors);
    }
    
    throw error;
  }
}

/**
 * Creates a standardized success response
 * @param data - Response data
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with standardized format
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }, { status });
}

/**
 * Creates a standardized success response with pagination
 * @param data - Response data array
 * @param pagination - Pagination information
 * @param message - Optional success message
 * @returns NextResponse with standardized format
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    pagination,
    timestamp: new Date().toISOString()
  });
}

/**
 * Creates a standardized error response
 * @param error - Error message or Error object
 * @param status - HTTP status code (default: 400)
 * @param errors - Array of detailed validation errors
 * @returns NextResponse with standardized error format
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 400,
  errors?: Array<{ field: string; message: string }>
): NextResponse<ApiResponse> {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return NextResponse.json({
    success: false,
    error: errorMessage,
    errors,
    timestamp: new Date().toISOString()
  }, { status });
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public readonly validationErrors?: Array<{ field: string; message: string }>;
  
  constructor(
    message: string,
    validationErrors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Middleware wrapper for API routes with validation
 * @param handler - The actual API route handler
 * @param options - Validation options
 * @returns Wrapped handler with error handling
 */
export function withValidation<T = unknown>(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  options?: {
    bodySchema?: ZodSchema<T>;
    querySchema?: ZodSchema<unknown>;
    pathSchema?: ZodSchema<unknown>;
  }
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    try {
      // Validate request body if schema provided
      if (options?.bodySchema && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        const validatedBody = await validateRequestBody(request, options.bodySchema);
        // Attach validated body to request for use in handler
        (request as NextRequest & { validatedBody: T }).validatedBody = validatedBody;
      }
      
      // Validate query parameters if schema provided
      if (options?.querySchema) {
        const validatedQuery = validateQueryParameters(request, options.querySchema);
        (request as NextRequest & { validatedQuery: unknown }).validatedQuery = validatedQuery;
      }
      
      // Call the actual handler
      return await handler(request, ...args);
      
    } catch (error) {
      console.error('API validation error:', error);
      
      if (error instanceof ValidationError) {
        return createErrorResponse(
          error.message,
          400,
          error.validationErrors
        );
      }
      
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return createErrorResponse(
          'Validierungsfehler in der Anfrage',
          400,
          validationErrors
        );
      }
      
      // Handle other errors
      const message = error instanceof Error ? error.message : 'Unbekannter Serverfehler';
      return createErrorResponse(message, 500);
    }
  };
}

/**
 * Helper function to extract validated data from request
 * (to be used inside route handlers that were wrapped with withValidation)
 */
export function getValidatedBody<T>(request: NextRequest): T {
  return (request as NextRequest & { validatedBody: T }).validatedBody;
}

export function getValidatedQuery<T>(request: NextRequest): T {
  return (request as NextRequest & { validatedQuery: T }).validatedQuery;
}

/**
 * Standard pagination parameters validation schema
 */
export const paginationSchema = z.object({
  page: z
    .number()
    .int('Seitenzahl muss eine ganze Zahl sein')
    .positive('Seitenzahl muss positiv sein')
    .default(1),
  limit: z
    .number()
    .int('Limit muss eine ganze Zahl sein')
    .positive('Limit muss positiv sein')
    .max(100, 'Maximal 100 Einträge pro Seite erlaubt')
    .default(10),
  sortBy: z
    .string()
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('asc')
});

/**
 * Standard ID parameter validation schema
 */
export const idParamSchema = z.object({
  id: z
    .string()
    .min(1, 'ID ist erforderlich')
    .regex(/^[0-9a-fA-F]{24}$/, 'ID muss eine gültige MongoDB ObjectId sein')
});

export type PaginationParams = z.infer<typeof paginationSchema>;
export type IdParams = z.infer<typeof idParamSchema>;
