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
    // Return existing connection if available
    if (database && client) {
      // Verify connection is still alive
      await database.admin().ping();
      return database;
    }

    // Validate environment configuration
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URL environment variable is not defined');
    }

    // Create new MongoDB client with optimized settings
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true, // Retry write operations on failure
      retryReads: true, // Retry read operations on failure
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      compressors: ['zlib'], // Enable compression for better performance
    });

    // Connect to MongoDB with retry logic
    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    
    // Get database instance
    database = client.db(DATABASE_NAME);
    
    console.log(`✅ Connected to MongoDB database: ${DATABASE_NAME}`);
    return database;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    
    // Clean up failed connection
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing failed connection:', closeError);
      }
      client = null;
      database = null;
    }
    
    throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets a specific collection from the database
 * @param collectionName - Name of the collection to retrieve
 * @returns MongoDB Collection instance
 */
export async function getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
  try {
    const db = await connectToDatabase();
    return db.collection<T>(collectionName);
  } catch (error) {
    console.error(`❌ Failed to get collection ${collectionName}:`, error);
    throw error;
  }
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
    if (!ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }
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
 * Database connection check function
 * Useful for API health endpoints and debugging
 * 
 * @returns Promise<boolean> - True if database is working correctly
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const db = await connectToDatabase();
    // Simple ping to check if database is responsive
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database connection check failed:', error);
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

/**
 * Creates database indexes for better performance
 * Should be called during application startup
 */
export async function createIndexes(): Promise<void> {
  try {
    const db = await connectToDatabase();
    
    // User collection indexes
    const usersCollection = db.collection(COLLECTIONS.USERS);
    await usersCollection.createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { googleId: 1 }, unique: true, sparse: true },
      { key: { createdAt: 1 } },
      { key: { role: 1 } }
    ]);

    // Recipe collection indexes
    const recipesCollection = db.collection(COLLECTIONS.RECIPES);
    await recipesCollection.createIndexes([
      { key: { title: 'text', description: 'text' } },
      { key: { authorId: 1 } },
      { key: { categories: 1 } },
      { key: { createdAt: -1 } },
      { key: { isPublic: 1 } },
      { key: { 'nutrition.calories': 1 } },
      { key: { cookingTime: 1 } }
    ]);

    // Category collection indexes
    const categoriesCollection = db.collection(COLLECTIONS.CATEGORIES);
    await categoriesCollection.createIndexes([
      { key: { name: 1 }, unique: true },
      { key: { slug: 1 }, unique: true },
      { key: { parentId: 1 } }
    ]);

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Failed to create database indexes:', error);
    throw error;
  }
}

// Graceful shutdown handling for production
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('🔄 Shutting down gracefully...');
    await closeDatabaseConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down gracefully...');
    await closeDatabaseConnection();
    process.exit(0);
  });
}

// Export MongoDB types for convenience
export { ObjectId, type Db, type Collection, type Document };