/**
 * Token Generation Utility
 * Generates secure tokens for authentication sessions
 */

import crypto from 'crypto';

/**
 * Generate a secure random token for user sessions
 * @param userId - The user ID to include in the token
 * @returns A secure base64 encoded token
 */
export function generateToken(userId: string): string {
  // Create a timestamp for token expiry tracking
  const timestamp = Date.now();
  
  // Generate random bytes for additional security
  const randomBytes = crypto.randomBytes(32);
  
  // Combine user ID, timestamp, and random data
  const tokenData = `${userId}:${timestamp}:${randomBytes.toString('hex')}`;
  
  // Return base64 encoded token
  return Buffer.from(tokenData).toString('base64');
}

/**
 * Generate a simple session ID
 * @returns A random session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Verify if a token is valid (basic validation)
 * @param token - The token to verify
 * @returns Object with validity and decoded data
 */
export function verifyToken(token: string): { 
  valid: boolean; 
  userId?: string; 
  timestamp?: number; 
} {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 3) {
      return { valid: false };
    }
    
    const [userId, timestampStr] = parts;
    const timestamp = parseInt(timestampStr, 10);
    
    // Check if token is expired (30 days)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - timestamp > thirtyDaysInMs;
    
    if (isExpired) {
      return { valid: false };
    }
    
    return {
      valid: true,
      userId,
      timestamp
    };
  } catch (error) {
    return { valid: false };
  }
}