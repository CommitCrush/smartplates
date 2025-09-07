/**
 * MongoDB Database Connection and Utilities
 * 
 * This file handles the connection to MongoDB and provides reusable
 * database utilities for the SmartPlates application.
 * 
 * Clean, beginner-friendly code with proper error handling.
 */

import { MongoClient, Db, Collection, ObjectId, Document } from 'mongodb';
import { config } from '@/config/env';

// MongoDB connection configuration from environment
const MONGODB_URI = config.database.uri;
const DATABASE_NAME = config.database.name;

// Global variables for connection reuse (Next.js optimization)
let client: MongoClient | null = null;
let database: Db | null = null;

/**
 * Connects to MongoDB database
 * Reuses existing connection if available (important for serverless)
 * 
 * @returns Promise<Db> - MongoDB database instance
 */
export async function connectToDatabase(): Promise<Db> {
  try {
    // If we already have a connection, reuse it
    if (database) {
      return database;
    }

    // Create new MongoDB client if needed
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        // Modern MongoDB driver options
        maxPoolSize: 10,              // Maximum number of connections
        serverSelectionTimeoutMS: 5000, // How long to try selecting a server
        socketTimeoutMS: 45000,       // How long to wait for a response
      });
    }

    // Connect to MongoDB
    await client.connect();
    database = client.db(DATABASE_NAME);
    
    console.log(`✅ Connected to MongoDB database: ${DATABASE_NAME}`);
    return database;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Gets a specific collection from the database
 * 
 * @param collectionName - Name of the collection to get
 * @returns Promise<Collection> - MongoDB collection instance
 */
export async function getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
  const db = await connectToDatabase();
  return db.collection<T>(collectionName);
}

/**
 * Collection names as constants to avoid typos
 * Use these throughout the application for consistency
 */
export const COLLECTIONS = {
  USERS: 'users',
  RECIPES: 'recipes',
  CATEGORIES: 'categories',
  MEAL_PLANS: 'mealPlans',
  GROCERY_LISTS: 'groceryLists',
} as const;

/**
 * Utility function to convert string to ObjectId
 * Handles both string IDs and ObjectId instances safely
 * 
 * @param id - String or ObjectId to convert
 * @returns ObjectId instance
 */
export function toObjectId(id: string | ObjectId): ObjectId {
  if (typeof id === 'string') {
    return new ObjectId(id);
  }
  return id;
}

/**
 * Utility function to convert ObjectId to string
 * Useful for API responses and frontend usage
 * 
 * @param id - ObjectId or string to convert
 * @returns String representation of the ID
 */
export function toStringId(id: ObjectId | string): string {
  if (typeof id === 'string') {
    return id;
  }
  return id.toString();
}

/**
 * Validates if a string is a valid MongoDB ObjectId
 * 
 * @param id - String to validate
 * @returns boolean - True if valid ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

/**
 * Database health check function
 * Useful for API health endpoints and debugging
 * 
 * @returns Promise<boolean> - True if database is healthy
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const db = await connectToDatabase();
    // Simple ping to check if database is responsive
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Gracefully closes the database connection
 * Call this when shutting down the application
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null;
      database = null;
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

// Export MongoDB types for convenience
export { ObjectId, type Db, type Collection, type Document };
