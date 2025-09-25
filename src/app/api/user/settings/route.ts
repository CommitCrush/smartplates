/**
 * User Settings API Route
 * 
 * Handles user settings retrieval and updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoDBService } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID ist erforderlich' },
        { status: 400 }
      );
    }

    const mongodb = MongoDBService.getInstance();
    await mongodb.connect();
    const db = await mongodb.getDatabase();

    // Get user settings
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { 
        settings: 1, 
        name: 1, 
        email: 1, 
        profileImage: 1,
        createdAt: 1 
      }}
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Return settings with defaults
    const defaultSettings = {
      displayName: user.name || '',
      bio: '',
      location: '',
      website: '',
      profileImage: user.profileImage || '',
      profileVisibility: 'public',
      showEmail: false,
      showRecipeCount: true,
      allowMessaging: true,
      emailNotifications: true,
      recipeRecommendations: true,
      weeklyDigest: false,
      socialInteractions: true,
      defaultRecipeVisibility: 'public',
      preferredMeasurements: 'metric',
      dietaryRestrictions: [],
      favoritesCuisines: [],
      language: 'de',
      timezone: 'Europe/Berlin',
      autoSaveDrafts: true,
    };

    const userSettings = {
      ...defaultSettings,
      ...user.settings,
    };

    return NextResponse.json({
      success: true,
      settings: userSettings,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        memberSince: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Laden der Einstellungen' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, settings } = await request.json();

    if (!userId || !settings) {
      return NextResponse.json(
        { success: false, message: 'User ID und Einstellungen sind erforderlich' },
        { status: 400 }
      );
    }

    const mongodb = MongoDBService.getInstance();
    await mongodb.connect();
    const db = await mongodb.getDatabase();

    // Validate and sanitize settings
    const validatedSettings = {
      displayName: String(settings.displayName || '').trim().slice(0, 100),
      bio: String(settings.bio || '').trim().slice(0, 1000),
      location: String(settings.location || '').trim().slice(0, 100),
      website: String(settings.website || '').trim().slice(0, 200),
      profileImage: String(settings.profileImage || ''),
      profileVisibility: ['public', 'private', 'friends'].includes(settings.profileVisibility) 
        ? settings.profileVisibility : 'public',
      showEmail: Boolean(settings.showEmail),
      showRecipeCount: Boolean(settings.showRecipeCount),
      allowMessaging: Boolean(settings.allowMessaging),
      emailNotifications: Boolean(settings.emailNotifications),
      recipeRecommendations: Boolean(settings.recipeRecommendations),
      weeklyDigest: Boolean(settings.weeklyDigest),
      socialInteractions: Boolean(settings.socialInteractions),
      defaultRecipeVisibility: ['public', 'private'].includes(settings.defaultRecipeVisibility)
        ? settings.defaultRecipeVisibility : 'public',
      preferredMeasurements: ['metric', 'imperial'].includes(settings.preferredMeasurements)
        ? settings.preferredMeasurements : 'metric',
      dietaryRestrictions: Array.isArray(settings.dietaryRestrictions) 
        ? settings.dietaryRestrictions.filter((r: any) => typeof r === 'string').slice(0, 20)
        : [],
      favoritesCuisines: Array.isArray(settings.favoritesCuisines)
        ? settings.favoritesCuisines.filter((c: any) => typeof c === 'string').slice(0, 20)
        : [],
      language: ['de', 'en', 'fr', 'es'].includes(settings.language) ? settings.language : 'de',
      timezone: String(settings.timezone || 'Europe/Berlin'),
      autoSaveDrafts: Boolean(settings.autoSaveDrafts),
    };

    // Update user settings
    const updateResult = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          settings: validatedSettings,
          updatedAt: new Date(),
          // Update user profile fields that might have changed
          name: validatedSettings.displayName || undefined,
          profileImage: validatedSettings.profileImage || undefined,
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Add to user activity
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          activity: {
            type: 'settings_updated',
            timestamp: new Date(),
          }
        } as any
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Einstellungen erfolgreich gespeichert',
      settings: validatedSettings,
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Speichern der Einstellungen' 
      },
      { status: 500 }
    );
  }
}