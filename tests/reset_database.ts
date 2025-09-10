/**
 * Database Reset Script
 * Bereinigt die SmartPlates Datenbank und entfernt obsolete Indizes
 */

import { connectToDatabase, COLLECTIONS } from '@/lib/db';

async function resetDatabase() {
  console.log('🧹 Resetting SmartPlates database...');
  
  try {
    const db = await connectToDatabase();
    console.log(`✅ Connected to: ${db.databaseName}`);
    
    // 1. Drop alle Collections komplett (entfernt auch alle Indizes)
    const collectionsToReset = [
      COLLECTIONS.USERS,
      COLLECTIONS.RECIPES,
      COLLECTIONS.CATEGORIES,
      COLLECTIONS.MEAL_PLANS,
      COLLECTIONS.GROCERY_LISTS
    ];
    
    for (const collectionName of collectionsToReset) {
      try {
        await db.collection(collectionName).drop();
        console.log(`✅ Dropped collection: ${collectionName}`);
      } catch (error) {
        console.log(`💡 Collection ${collectionName} not found (OK)`);
      }
    }
    
    // 2. Erstelle Collections neu mit korrekten SmartPlates Indizes
    console.log('\n🔧 Creating SmartPlates indexes...');
    
    // Users Collection - entspricht SmartPlates User Interface
    await db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true });
    await db.collection(COLLECTIONS.USERS).createIndex(
      { googleId: 1 }, 
      { unique: true, sparse: true }
    );
    await db.collection(COLLECTIONS.USERS).createIndex({ role: 1 });
    console.log('✅ Users indexes created');
    
    // Recipes Collection
    await db.collection(COLLECTIONS.RECIPES).createIndex({ title: 'text', description: 'text' });
    await db.collection(COLLECTIONS.RECIPES).createIndex({ authorId: 1 });
    await db.collection(COLLECTIONS.RECIPES).createIndex({ categories: 1 });
    await db.collection(COLLECTIONS.RECIPES).createIndex({ isPublic: 1 });
    console.log('✅ Recipes indexes created');
    
    // Categories Collection
    await db.collection(COLLECTIONS.CATEGORIES).createIndex({ name: 1 }, { unique: true });
    await db.collection(COLLECTIONS.CATEGORIES).createIndex({ slug: 1 }, { unique: true });
    console.log('✅ Categories indexes created');
    
    console.log('\n🎉 Database reset complete!');
    console.log('💡 All collections and indexes are now aligned with SmartPlates schema');
    console.log('🚀 You can now run: bun run demo:testutils2');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();