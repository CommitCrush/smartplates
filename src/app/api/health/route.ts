import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getStorageStats } from '@/config/storage';

/**
 * Enhanced Health Check API for Render.com monitoring
 * Checks database connectivity, storage, and environment configuration
 */
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {} as Record<string, any>,
    environment: process.env.NODE_ENV || 'development',
    platform: process.env.RENDER ? 'render' : 'local',
  };

  try {
    // Check database connection
    console.log('🔍 Checking database connection...');
    const db = await connectToDatabase();
    checks.services.database = {
      status: 'connected',
      name: db.databaseName,
      timestamp: new Date().toISOString()
    };
    console.log('✅ Database connection successful');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    checks.services.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
    checks.status = 'unhealthy';
  }

  try {
    // Check storage system
    console.log('🔍 Checking storage system...');
    const storageStats = await getStorageStats();
    checks.services.storage = {
      status: 'available',
      stats: storageStats,
      timestamp: new Date().toISOString()
    };
    console.log('✅ Storage system check successful');

  } catch (error) {
    console.error('❌ Storage system check failed:', error);
    checks.services.storage = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown storage error'
    };
  }

  // Check critical environment variables
  const requiredEnvs = [
    'MONGODB_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET'
  ];

  const optionalEnvs = [
    'OPENAI_API_KEY',
    'SPOONACULAR_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'SENDGRID_API_KEY'
  ];

  const envStatus = {
    required: {} as Record<string, boolean>,
    optional: {} as Record<string, boolean>,
    missing: [] as string[]
  };

  // Check required environment variables
  for (const env of requiredEnvs) {
    const exists = !!process.env[env];
    envStatus.required[env] = exists;
    if (!exists) {
      envStatus.missing.push(env);
      checks.status = 'unhealthy';
    }
  }

  // Check optional environment variables
  for (const env of optionalEnvs) {
    envStatus.optional[env] = !!process.env[env];
  }

  checks.services.environment = {
    status: envStatus.missing.length === 0 ? 'configured' : 'incomplete',
    variables: envStatus
  };

  // Check external services availability (basic)
  checks.services.external = {
    mongodb: checks.services.database.status === 'connected',
    openai: !!process.env.OPENAI_API_KEY,
    spoonacular: !!process.env.SPOONACULAR_API_KEY,
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    sendgrid: !!process.env.SENDGRID_API_KEY,
  };

  // Performance metrics
  checks.services.performance = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version,
  };

  // Return appropriate status code
  const statusCode = checks.status === 'healthy' ? 200 : 503;

  return NextResponse.json(checks, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    }
  });
}

// Also handle HEAD requests for simple health checks
export async function HEAD() {
  try {
    // Quick database ping
    await connectToDatabase();
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}