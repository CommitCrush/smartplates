import { NextResponse } from 'next/server';
import { isDatabaseHealthy, connectToDatabase, COLLECTIONS } from '@/lib/db';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test database connection
    const isHealthy = await isDatabaseHealthy();
    const connectionTime = Date.now() - startTime;
    
    if (!isHealthy) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // Test collection access
    const db = await connectToDatabase();
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      status: 'operational',
      database: {
        connected: true,
        connectionTime: `${connectionTime}ms`,
        collections: collections.map(c => c.name),
        expectedCollections: Object.values(COLLECTIONS)
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseName: db.databaseName
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}