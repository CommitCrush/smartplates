import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const isDatabaseHealthy = await checkDatabaseConnection();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: isDatabaseHealthy ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV,
    };
    
    return NextResponse.json(health, {
      status: isDatabaseHealthy ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
    }, {
      status: 503
    });
  }
}