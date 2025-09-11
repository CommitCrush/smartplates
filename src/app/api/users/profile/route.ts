import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase, COLLECTIONS } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();
    
    // Find user profile in database
    const user = await db.collection(COLLECTIONS.USERS).findOne({
      email: session.user.email
    });

    if (!user) {
      // Create basic profile if doesn't exist
      const basicProfile = {
        email: session.user.email,
        name: session.user.name || '',
        profileImage: session.user.image || '',
        bio: '',
        location: '',
        dietaryRestrictions: [],
        joinDate: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const insertResult = await db.collection(COLLECTIONS.USERS).insertOne(basicProfile);
      
      return NextResponse.json({
        id: insertResult.insertedId.toString(),
        ...basicProfile
      });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      profileImage: user.profileImage || session.user.image,
      location: user.location || '',
      dietaryRestrictions: user.dietaryRestrictions || [],
      joinDate: user.joinDate || user.createdAt
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Profils' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, bio, location } = body;

    // Basic validation
    if (!name || name.trim().length < 1) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio darf nicht länger als 500 Zeichen sein' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    
    // Update user profile
    const updateData = {
      name: name.trim(),
      bio: bio?.trim() || '',
      location: location?.trim() || '',
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTIONS.USERS).findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: updateData,
        $setOnInsert: {
          email: session.user.email,
          profileImage: session.user.image || '',
          dietaryRestrictions: [],
          joinDate: new Date().toISOString(),
          createdAt: new Date()
        }
      },
      { 
        upsert: true, 
        returnDocument: 'after' 
      }
    );

    return NextResponse.json({
      id: result?._id?.toString(),
      name: result?.name,
      email: result?.email,
      bio: result?.bio || '',
      profileImage: result?.profileImage || session.user.image,
      location: result?.location || '',
      dietaryRestrictions: result?.dietaryRestrictions || [],
      joinDate: result?.joinDate || result?.createdAt
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Profils' },
      { status: 500 }
    );
  }
}
