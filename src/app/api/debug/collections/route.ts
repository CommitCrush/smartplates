/**
 * Debug API to check MongoDB collections and documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase, COLLECTIONS } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const db = await connectToDatabase();
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check each of our expected collections
    const collectionInfo: Record<string, any> = {};
    
    for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        const sampleDocs = await collection.find({}).limit(3).toArray();
        
        collectionInfo[key] = {
          name: collectionName,
          exists: collectionNames.includes(collectionName),
          documentCount: count,
          sampleDocuments: sampleDocs.map(doc => ({
            _id: doc._id,
            title: doc.title || doc.name || doc.email || 'N/A',
            createdAt: doc.createdAt || 'N/A',
            authorType: doc.authorType || 'N/A'
          }))
        };
      } catch (error) {
        collectionInfo[key] = {
          name: collectionName,
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      mongodb: {
        allCollections: collectionNames,
        smartPlatesCollections: collectionInfo
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}