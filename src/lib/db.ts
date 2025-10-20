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

// Cache storage for frequently accessed data
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 100000; // 1 minute 40 seconds cache TTL (increased from 40s)
const CONNECTION_CHECK_INTERVAL = 40000; // 40 seconds between connection checks (increased from 20s)

// Track last ping time to reduce unnecessary database pings
let lastPingTime = 0;

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
      // Only log once every 50 requests to reduce console spam
      if (Math.random() < 0.02) {
        console.log('[DB] Using existing MongoDB connection');
      }
      
      try {
        // Only verify connection periodically, not on every call
        const now = Date.now();
        if (now - lastPingTime > CONNECTION_CHECK_INTERVAL) {
          await database.admin().ping();
          lastPingTime = now;
          console.log('[DB] Connection verified successfully');
        }
        return database;
      } catch (error) {
        console.error('[DB] Existing connection failed, reconnecting:', error);
        // Continue to reconnect below
      }
    }

    // Validate environment configuration
    if (!MONGODB_URI) {
      console.error('[DB] MONGODB_URL environment variable is not defined');
      throw new Error('MONGODB_URL environment variable is not defined');
    }

    console.log(`[DB] Creating new MongoClient for URI: ${MONGODB_URI}`);
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
    console.log('[DB] MongoClient connected');
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    lastPingTime = Date.now(); // Record successful ping time
    console.log('[DB] Ping to admin DB successful');
    
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

// Collection instance cache to reduce repeated lookups
const collectionCache = new Map<string, Collection<any>>();

/**
 * Gets a specific collection from the database
 * Uses in-memory cache to avoid repeated lookups
 * 
 * @param collectionName - Name of the collection to retrieve
 * @returns MongoDB Collection instance
 */
export async function getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
  try {
    // Check if collection is already cached
    if (collectionCache.has(collectionName)) {
      // Reduce logging for frequent collection accesses
      if (Math.random() < 0.05) {
        console.log(`[DB] Using cached collection: ${collectionName}`);
      }
      return collectionCache.get(collectionName) as Collection<T>;
    }

    const db = await connectToDatabase();
    console.log(`[DB] Getting collection: ${collectionName}`);
    const collection = db.collection<T>(collectionName);
    
    if (!collection) {
      console.error(`[DB] Collection not found: ${collectionName}`);
    } else {
      // Cache the collection instance for future use
      collectionCache.set(collectionName, collection);
    }
    
    return collection;
  } catch (error) {
    console.error(`❌ Failed to get collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Gets a cached query result or performs the query and caches the result
 * @param cacheKey - Unique key for the query
 * @param queryFn - Function to perform the query if cache miss
 * @param ttl - Time to live in milliseconds (defaults to CACHE_TTL)
 * @returns Query result
 */
export async function getCachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const now = Date.now();
  const cached = queryCache.get(cacheKey);
  
  if (cached && now - cached.timestamp < ttl) {
    if (Math.random() < 0.1) {
      console.log(`[DB] Cache hit for: ${cacheKey}`);
    }
    return cached.data as T;
  }
  
  console.log(`[DB] Cache miss for: ${cacheKey}`);
  const result = await queryFn();
  queryCache.set(cacheKey, { data: result, timestamp: now });
  return result;
}

/**
 * Invalidates a specific cache key or all cache if no key provided
 * @param cacheKey - Optional key to invalidate specific cache entry
 */
export function invalidateCache(cacheKey?: string): void {
  if (cacheKey) {
    queryCache.delete(cacheKey);
    console.log(`[DB] Cache invalidated for: ${cacheKey}`);
  } else {
    queryCache.clear();
    console.log('[DB] All cache invalidated');
  }
}

/**
 * Collection names as constants to avoid typos
 * Use these throughout the application for consistency
 */
export const COLLECTIONS = {
  USERS: 'users',
  ADMINS: 'admins',
  RECIPES: 'recipes',
  USER_RECIPES: 'userRecipes',
  CATEGORIES: 'categories',
  MEAL_PLANS: 'mealplans',
  GROCERY_LISTS: 'grocerylists',
  SAVED_GROCERY_LISTS: 'savedgrocerylists', // Added for saved lists
  FAVORITES: 'favorites', // Added for favorite recipes
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
      // Skip logging for recipe names that aren't valid IDs
      if (!id.includes(' ')) {
        console.error(`Invalid ObjectId format: ${id}`);
      }
      throw new Error(`Invalid ObjectId format: ${id}`);
    }
    return new ObjectId(id);
  }
  return id;
}

/**
 * Safely tries to convert a string to ObjectId
 * Returns null instead of throwing if invalid
 * 
 * @param id - String to convert
 * @returns ObjectId or null if invalid
 */
export function toObjectIdSafe(id: string | ObjectId | undefined | null): ObjectId | null {
  if (!id) return null;
  
  try {
    return toObjectId(id);
  } catch {
    // Silently handle any conversion errors and return null
    return null;
  }
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
    lastPingTime = Date.now(); // Update last ping time
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
      collectionCache.clear(); // Clear collection cache
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
    
    // Favorites collection indexes
    const favoritesCollection = db.collection(COLLECTIONS.FAVORITES);
    await favoritesCollection.createIndexes([
      { key: { userId: 1 } },
      { key: { recipeId: 1 } },
      { key: { userId: 1, recipeId: 1 }, unique: true }
    ]);

    // Meal plans indexes
    const mealPlansCollection = db.collection(COLLECTIONS.MEAL_PLANS);
    await mealPlansCollection.createIndexes([
      { key: { userId: 1 } },
      { key: { weekStartDate: 1 } },
      { key: { userId: 1, weekStartDate: 1 }, unique: true }
    ]);

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Failed to create database indexes:', error);
    throw error;
  }
}

/**
 * Performs paginated queries on MongoDB collections
 * Optimized for performance with large datasets
 * 
 * @param collectionName - Name of the collection to query
 * @param query - MongoDB query filter
 * @param options - Pagination options
 * @returns Promise with paginated results and metadata
 */
export async function findWithPagination<T extends Document = Document>(
  collectionName: string,
  query: Document = {},
  options: {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    projection?: Document;
    cacheKey?: string; // Optional cache key for results
    cacheTtl?: number; // Optional cache TTL override
  } = {}
): Promise<{
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> {
  try {
    // Use cache if a cache key is provided
    if (options.cacheKey) {
      return await getCachedQuery(
        options.cacheKey,
        async () => await performPaginatedQuery<T>(collectionName, query, options),
        options.cacheTtl
      );
    }
    
    // Otherwise perform the query directly
    return await performPaginatedQuery<T>(collectionName, query, options);
  } catch (error) {
    console.error(`❌ Pagination query failed for ${collectionName}:`, error);
    throw new Error(`Failed to execute paginated query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Internal function to perform paginated queries
 */
async function performPaginatedQuery<T extends Document = Document>(
  collectionName: string,
  query: Document = {},
  options: {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    projection?: Document;
  } = {}
): Promise<{
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> {
  const collection = await getCollection<T>(collectionName);
  
  // Default pagination values
  const page = Math.max(1, options.page || 1); // Ensure page is at least 1
  const limit = Math.max(1, Math.min(options.limit || 10, 100)); // Between 1 and 100
  const skip = (page - 1) * limit;
  
  // Execute count query and data query in parallel for better performance
  const [total, docs] = await Promise.all([
    // Use countDocuments for accurate total matching the filter
    collection.countDocuments(query),
    // Fetch the page of documents with optional projection and sorting
    collection
      .find(query, { projection: options.projection ?? {} })
      .sort(options.sort ?? { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));
  const pagination = {
    total,
    page,
    limit,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1
  };

  return {
    data: docs as T[],
    pagination
  };
}

// Prevent connection closing in development
// This should be removed for production builds
if (process.env.NODE_ENV === 'development') {
  // Override the process listeners to prevent unnecessary connection closing
  const originalListeners = process.listeners('SIGTERM');
  process.removeAllListeners('SIGTERM');
  
  process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received in development - keeping connection open');
    // Call original listeners except our own
    for (const listener of originalListeners) {
      if (!listener.toString().includes('closeDatabaseConnection')) {
        listener();
      }
    }
  });
} else {
  // Graceful shutdown handling for production only
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

// Create a client promise for compatibility
const clientPromise = (async () => {
  if (!client) {
    await connectToDatabase();
  }
  return client!;
})();

// Export MongoDB types for convenience
export { ObjectId, type Db, type Collection, type Document };

// Default export for client promise compatibility
export default clientPromise;
