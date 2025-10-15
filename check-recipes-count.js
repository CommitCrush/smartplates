import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017/smartplates';

async function checkRecipesCount() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('smartplates');
    
    // List all collections first
    const collections = await db.listCollections().toArray();
    console.log('� Available collections:', collections.map(c => c.name));
    
    // Check all possible recipe collections
    for (const collection of collections) {
      if (collection.name.toLowerCase().includes('recipe')) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`📊 ${collection.name} count:`, count);
        
        if (count > 0) {
          const sample = await db.collection(collection.name).findOne();
          console.log(`Sample from ${collection.name}:`, {
            _id: sample._id,
            title: sample.title || sample.name || 'No title',
            spoonacularId: sample.spoonacularId,
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

checkRecipesCount();