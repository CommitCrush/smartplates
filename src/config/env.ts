/**
 * Environment Configuration and Validation
 * 
 * This file centralizes environment variable access and validates
 * that all required environment variables are present.
 */

/**
 * Required environment variables for the application
 */
const requiredEnvVars = [
  'MONGODB_URL',
  'JWT_SECRET',
] as const;

/**
 * Optional environment variables with default values
 */
const optionalEnvVars = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NEXTAUTH_URL: 'http://localhost:3000',
  DEBUG: 'false',
  LOG_LEVEL: 'info',
  RATE_LIMIT_MAX_REQUESTS: '100',
  RATE_LIMIT_WINDOW_MS: '900000', // 15 minutes
} as const;

/**
 * Validates that all required environment variables are present
 * @throws Error if any required environment variable is missing
 */
export function validateEnvironment(): void {
  const missingVars: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }
}

/**
 * Gets an environment variable with type safety
 * @param key - Environment variable key
 * @returns Environment variable value or undefined
 */
function getEnvVar(key: string): string | undefined {
  return process.env[key];
}

/**
 * Gets an environment variable with a default value
 * @param key - Environment variable key
 * @param defaultValue - Default value if environment variable is not set
 * @returns Environment variable value or default value
 */
function getEnvVarWithDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Application configuration object with all environment variables
 * This provides a centralized place to access all configuration
 */
export const config = {
  // Database
  database: {
    uri: getEnvVar('MONGODB_URL')!,
    name: 'smartplates', // Default database name
  },
  
  // Authentication
  auth: {
    jwtSecret: getEnvVar('JWT_SECRET')!,
    nextAuthSecret: getEnvVar('NEXTAUTH_SECRET'),
    nextAuthUrl: getEnvVarWithDefault('NEXTAUTH_URL', optionalEnvVars.NEXTAUTH_URL),
  },
  
  // Application
  app: {
    env: getEnvVarWithDefault('NODE_ENV', optionalEnvVars.NODE_ENV),
    siteUrl: getEnvVarWithDefault('NEXT_PUBLIC_SITE_URL', optionalEnvVars.NEXT_PUBLIC_SITE_URL),
    debug: getEnvVarWithDefault('DEBUG', optionalEnvVars.DEBUG) === 'true',
    logLevel: getEnvVarWithDefault('LOG_LEVEL', optionalEnvVars.LOG_LEVEL),
  },
  
  // Rate Limiting
  rateLimit: {
    maxRequests: parseInt(getEnvVarWithDefault('RATE_LIMIT_MAX_REQUESTS', optionalEnvVars.RATE_LIMIT_MAX_REQUESTS)),
    windowMs: parseInt(getEnvVarWithDefault('RATE_LIMIT_WINDOW_MS', optionalEnvVars.RATE_LIMIT_WINDOW_MS)),
  },
  
  // Google Cloud (optional for future features)
  googleCloud: {
    projectId: getEnvVar('GOOGLE_CLOUD_PROJECT_ID'),
    storageBucket: getEnvVar('GOOGLE_CLOUD_STORAGE_BUCKET'),
    credentialsPath: getEnvVar('GOOGLE_APPLICATION_CREDENTIALS'),
    clientId: getEnvVar('GOOGLE_CLIENT_ID'),
    clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
  },
  
  // Email (optional for future features)
  email: {
    serviceApiKey: getEnvVar('EMAIL_SERVICE_API_KEY'),
    fromAddress: getEnvVar('EMAIL_FROM'),
  },
  
  // Analytics (optional)
  analytics: {
    googleAnalyticsId: getEnvVar('NEXT_PUBLIC_GA_ID'),
  },
} as const;

/**
 * Utility function to check if we're in development mode
 */
export const isDevelopment = config.app.env === 'development';

/**
 * Utility function to check if we're in production mode
 */
export const isProduction = config.app.env === 'production';

/**
 * Utility function to check if debug mode is enabled
 */
export const isDebugMode = config.app.debug;

// Validate environment on import (only in server-side code)
if (typeof window === 'undefined') {
  try {
    validateEnvironment();
    if (isDevelopment) {
      console.log('✅ Environment validation passed');
    }
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
}
