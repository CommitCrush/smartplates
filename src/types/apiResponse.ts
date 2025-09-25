/**
 * Structured Error Responses for API Routes
 * Provides consistent error formatting across the application
 */

export enum UploadErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  NO_FILE_PROVIDED = 'NO_FILE_PROVIDED',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CLOUDINARY_CONFIG_MISSING = 'CLOUDINARY_CONFIG_MISSING',
  RECIPE_ID_REQUIRED = 'RECIPE_ID_REQUIRED',
  PUBLIC_ID_REQUIRED = 'PUBLIC_ID_REQUIRED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

export interface StructuredError {
  success: false;
  code: UploadErrorCode;
  message: string;
  details?: string;
  retryAfter?: number; // For rate limiting
}

export interface StructuredSuccess<T = any> {
  success: true;
  data: T;
  message: string;
}

export type APIResponse<T = any> = StructuredSuccess<T> | StructuredError;

export class UploadError extends Error {
  code: UploadErrorCode;
  statusCode: number;
  retryAfter?: number;

  constructor(
    code: UploadErrorCode,
    message: string,
    statusCode: number = 400,
    retryAfter?: number
  ) {
    super(message);
    this.name = 'UploadError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }

  toResponse(): StructuredError {
    return {
      success: false,
      code: this.code,
      message: this.message,
      ...(this.retryAfter && { retryAfter: this.retryAfter })
    };
  }
}

export const createErrorResponse = (
  code: UploadErrorCode,
  message: string,
  statusCode: number = 400,
  details?: string,
  retryAfter?: number
): { response: StructuredError; statusCode: number } => {
  return {
    response: {
      success: false,
      code,
      message,
      ...(details && { details }),
      ...(retryAfter && { retryAfter })
    },
    statusCode
  };
};

export const createSuccessResponse = <T>(
  data: T,
  message: string
): StructuredSuccess<T> => {
  return {
    success: true,
    data,
    message
  };
};