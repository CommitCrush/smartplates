// /**
//  * Database Reset Script
//  * Bereinigt die SmartPlates Datenbank und entfernt obsolete Indizes
//  */

// import { connectToDatabase, COLLECTIONS } from '@/lib/db';

// async function resetDatabase() {
//   console.log('🧹 Resetting SmartPlates database...');
  
//   try {
//     const db = await connectToDatabase();
//     console.log(`✅ Connected to: ${db.databaseName}`);
    
//     // 1. Drop alle Collections komplett (entfernt auch alle Indizes)
//     const collectionsToReset = [
//       COLLECTIONS.USERS,
//       COLLECTIONS.RECIPES,
//       COLLECTIONS.CATEGORIES,
//       COLLECTIONS.MEAL_PLANS,
//       COLLECTIONS.GROCERY_LISTS
//     ];
    
//     for (const collectionName of collectionsToReset) {
//       try {
//         await db.collection(collectionName).drop();
//         console.log(`✅ Dropped collection: ${collectionName}`);
//       } catch (error) {
//         console.log(`💡 Collection ${collectionName} not found (OK)`);
//       }
//     }
    
//     // 2. Erstelle Collections neu mit korrekten SmartPlates Indizes
//     console.log('\n🔧 Creating SmartPlates indexes...');
    
//     // Users Collection - entspricht SmartPlates User Interface
//     await db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true });
//     // await db.collection(COLLECTIONS.USERS).createIndex(
//     //   { googleId: 1 }, 
//     //   { unique: true, sparse: true }
//     // );

 
//     await db.collection(COLLECTIONS.USERS).createIndex({ role: 1 });
//     console.log('✅ Users indexes created');
    
//     // Recipes Collection
//     await db.collection(COLLECTIONS.RECIPES).createIndex({ title: 'text', description: 'text' });
//     await db.collection(COLLECTIONS.RECIPES).createIndex({ authorId: 1 });
//     await db.collection(COLLECTIONS.RECIPES).createIndex({ categories: 1 });
//     await db.collection(COLLECTIONS.RECIPES).createIndex({ isPublic: 1 });
//     console.log('✅ Recipes indexes created');
    
//     // Categories Collection
//     await db.collection(COLLECTIONS.CATEGORIES).createIndex({ name: 1 }, { unique: true });
//     await db.collection(COLLECTIONS.CATEGORIES).createIndex({ slug: 1 }, { unique: true });
//     console.log('✅ Categories indexes created');
    
//     console.log('\n🎉 Database reset complete!');
//     console.log('💡 All collections and indexes are now aligned with SmartPlates schema');
//     console.log('🚀 You can now run: bun run demo:testutils2');
    
//     process.exit(0);
    
//   } catch (error) {
//     console.error('❌ Database reset failed:', error);
//     process.exit(1);
//   }
// }

// resetDatabase();


/**
 * Forceful Database Reset Script
 * Löscht problematische Indizes mit höheren Berechtigungen
 */

import { connectToDatabase, COLLECTIONS } from '@/lib/db';

async function forceResetDatabase() {
  console.log('🧹 Force Resetting SmartPlates database...');
  
  try {
    const db = await connectToDatabase();
    console.log(`✅ Connected to: ${db.databaseName}`);
    
    // 1. Spezifische Behandlung der Users Collection
    const usersCollection = db.collection(COLLECTIONS.USERS);
    
    // Liste alle existierenden Indizes
    console.log('\n📋 Listing existing indexes...');
    const indexes = await usersCollection.listIndexes().toArray();
    console.log('Current indexes:', indexes.map(idx => idx.name));
    
    // 2. Lösche problematische Indizes einzeln
    const problematicIndexes = ['googleId_1', 'username_1'];
    
    for (const indexName of problematicIndexes) {
      try {
        console.log(`🗑️ Attempting to drop index: ${indexName}`);
        await usersCollection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (error) {
        console.log(`💡 Index ${indexName} not found or already dropped`);
      }
    }
    
    // 3. Lösche alle Dokumente aus Users Collection
    console.log('\n🧹 Clearing users collection data...');
    const deleteResult = await usersCollection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} users`);
    
    // 4. Erstelle korrekten googleId Index
    console.log('\n🔧 Creating correct googleId index...');
    await usersCollection.createIndex(
      { googleId: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: 'googleId_sparse_unique'
      }
    );
    console.log('✅ Created sparse unique googleId index');
    
    // 5. Erstelle Email Index
    await usersCollection.createIndex(
      { email: 1 }, 
      { unique: true }
    );
    console.log('✅ Created email index');
    
    // 6. Prüfe finale Index-Struktur
    console.log('\n📋 Final index structure:');
    const finalIndexes = await usersCollection.listIndexes().toArray();
    finalIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''} ${idx.sparse ? '(sparse)' : ''}`);
    });
    
    console.log('\n🎉 Force reset complete!');
    console.log('🚀 You can now run: bun run demo:testutils2');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Force reset failed:', error);
    console.error('💡 Try using MongoDB Compass to manually delete the googleId_1 index');
    process.exit(1);
  }
}

forceResetDatabase();