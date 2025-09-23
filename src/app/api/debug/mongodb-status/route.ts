import { NextResponse } from 'next/server';
import { connectToDatabase, COLLECTIONS, checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const isConnected = await checkDatabaseConnection();
    
    // Verbindungsstatus
    const connectionStatus = {
      connected: isConnected,
      database: db.databaseName,
      connectionString: process.env.MONGODB_URL?.replace(/\/\/.*:.*@/, '//***:***@') // Hide credentials
    };

    // Collections zählen
    const collections = await db.listCollections().toArray();
    
    const collectionStats = [];
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        collectionStats.push({
          name: collection.name,
          count: count
        });
      } catch (error) {
        collectionStats.push({
          name: collection.name,
          count: -1,
          error: 'Count failed'
        });
      }
    }

    // Rezept-spezifische Statistiken
    let recipeStats = {};
    try {
      const recipesCollection = db.collection(COLLECTIONS.RECIPES);
      const recipeCount = await recipesCollection.countDocuments();
      const publishedCount = await recipesCollection.countDocuments({ isPublished: true });
      
      // Kategorien sammeln
      const categoriesAggregation = await recipesCollection.distinct('category');
      
      recipeStats = {
        total: recipeCount,
        published: publishedCount,
        categories: categoriesAggregation.length,
        availableCategories: categoriesAggregation
      };
    } catch (error) {
      recipeStats = { 
        error: 'Recipe stats failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      connection: connectionStatus,
      collections: collectionStats,
      recipes: recipeStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}