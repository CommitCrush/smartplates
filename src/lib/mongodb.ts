/**
 * MongoDB Connection Utility
 * 
 * Handles database connection for the SmartPlates application
 */

import mongoose from 'mongoose';
import { config } from '@/config/env';

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

// Get the base URI and append the database name
const MONGODB_BASE_URI = process.env.MONGODB_URI || process.env.MONGODB_URL!;
const DATABASE_NAME = config.database.name;

// Ensure the URI includes the database name
const MONGODB_URI = MONGODB_BASE_URI.endsWith('/') 
  ? `${MONGODB_BASE_URI}${DATABASE_NAME}`
  : `${MONGODB_BASE_URI}/${DATABASE_NAME}`;

if (!MONGODB_BASE_URI) {
  throw new Error(
    'Please define the MONGODB_URI or MONGODB_URL environment variable inside .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('[Mongoose] Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    console.log(`[Mongoose] Connecting to URI: ${MONGODB_URI}`);
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('[Mongoose] Connection established');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('[Mongoose] Connection ready');
  } catch (e) {
    cached.promise = null;
    console.error('[Mongoose] Connection failed:', e);
    throw e;
  }

  return cached.conn;
}