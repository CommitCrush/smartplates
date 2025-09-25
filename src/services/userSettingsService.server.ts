/**
 * User Settings & Preferences Service
 * 
 * Professional system for managing dietary preferences, privacy controls,
 * and comprehensive user customization
 */

import clientPromise from '@/lib/db';
import { ObjectId, WithId } from 'mongodb';

export interface UserSettings {
  _id?: string;
  userId: string;
  
  // Profile settings
  profile: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    location?: string;
    timezone?: string;
    language: string; // ISO code (en, es, fr, etc.)
    units: 'metric' | 'imperial'; // Measurement units
  };
  
  // Dietary preferences and restrictions
  dietary: {
    allergies: string[]; // Common allergens
    intolerances: string[]; // Food intolerances
    dietType?: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | 'custom';
    customDietName?: string; // For custom diet type
    excludedIngredients: string[]; // Specific ingredients to avoid
    preferredIngredients: string[]; // Ingredients user likes
    spiceLevel: 'mild' | 'medium' | 'hot' | 'very-hot';
    cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  
  // Meal planning preferences
  mealPlanning: {
    defaultServings: number;
    planningHorizon: number; // Days to plan ahead
    preferredMealTimes: {
      breakfast: string; // HH:MM format
      lunch: string;
      dinner: string;
      snack1?: string;
      snack2?: string;
    };
    weekStartsOn: 0 | 1 | 6; // Sunday=0, Monday=1, Saturday=6
    autoGenerateGroceryList: boolean;
    includeLeftovers: boolean;
    batchCookingPreference: boolean;
    budgetPerWeek?: number; // Estimated grocery budget
  };
  
  // Recipe preferences
  recipes: {
    defaultView: 'grid' | 'list' | 'card';
    sortPreference: 'newest' | 'popular' | 'rating' | 'cook-time' | 'difficulty';
    showNutritionInfo: boolean;
    showCookingTips: boolean;
    hideComplexRecipes: boolean; // Based on skill level
    maxCookTime?: number; // Maximum cooking time in minutes
    preferredCuisines: string[];
    bookmarkOrganization: 'categories' | 'tags' | 'date-added';
  };
  
  // Privacy and sharing
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showRecipeHistory: boolean;
    showMealPlans: boolean;
    showCollections: boolean;
    allowMessageFromUsers: boolean;
    shareAnalyticsData: boolean; // For improving recommendations
    emailNotifications: {
      newRecipeSuggestions: boolean;
      mealPlanReminders: boolean;
      groceryListReminders: boolean;
      weeklyNewsletter: boolean;
      systemUpdates: boolean;
    };
    pushNotifications: {
      mealReminders: boolean;
      cookingTimers: boolean;
      groceryReminders: boolean;
    };
  };
  
  // App customization
  interface: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean; // Dense layouts
    showTutorials: boolean;
    defaultLandingPage: 'dashboard' | 'recipes' | 'meal-plans' | 'grocery-lists';
    sidebarExpanded: boolean;
    enableKeyboardShortcuts: boolean;
    animationsEnabled: boolean;
    highContrastMode: boolean; // Accessibility
    fontSize: 'small' | 'medium' | 'large' | 'x-large';
  };
  
  // Smart features
  ai: {
    enableSmartSuggestions: boolean;
    fridgeAnalysisConsent: boolean;
    personalizedRecommendations: boolean;
    autoTagRecipes: boolean;
    suggestMealPlans: boolean;
    improveSearchResults: boolean; // Use personal data for better search
    dataRetentionPeriod: 30 | 90 | 180 | 365; // Days
  };
  
  // Shopping and integrations
  shopping: {
    preferredStores: string[]; // Store names or IDs
    deliveryPreferences: {
      enabled: boolean;
      defaultService?: string;
      defaultAddress?: string;
    };
    couponsAndDeals: boolean;
    priceTracking: boolean;
    organicPreference: 'always' | 'when-available' | 'budget-permitting' | 'never';
    localProducePreference: boolean;
  };
  
  // Data and backup
  data: {
    exportFormat: 'json' | 'csv' | 'pdf';
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    syncAcrossDevices: boolean;
    offlineMode: boolean; // Download recipes for offline use
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
  onboardingCompleted: boolean;
  settingsVersion: number; // For migrations
}

export interface NotificationPreferences {
  email: UserSettings['privacy']['emailNotifications'];
  push: UserSettings['privacy']['pushNotifications'];
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

export interface UserPreferencesUpdate {
  section: keyof Omit<UserSettings, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'settingsVersion'>;
  data: Partial<UserSettings[keyof UserSettings]>;
}

export class UserSettingsService {
  private static COLLECTION_NAME = 'userSettings';
  private static CURRENT_SETTINGS_VERSION = 1;

  /**
   * Get user settings (with defaults if not exists)
   */
  static async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserSettings>(this.COLLECTION_NAME);

      let settings = await collection.findOne({ userId });

      // Create default settings if none exist
      if (!settings) {
        const defaultSettings = await this.createDefaultSettings(userId);
        settings = { ...defaultSettings, _id: defaultSettings._id || '' } as WithId<UserSettings>;
      }

      // Migrate settings if version is outdated
      if (settings && settings.settingsVersion < this.CURRENT_SETTINGS_VERSION) {
        const migratedSettings = await this.migrateSettings(settings);
        settings = { ...migratedSettings, _id: migratedSettings._id || settings._id } as WithId<UserSettings>;
      }

      // Ensure settings exists and has all required properties
      if (!settings) {
        throw new Error('Failed to create or retrieve user settings');
      }

      return {
        ...settings,
        _id: settings._id?.toString() || '',
        userId: settings.userId || userId,
        profile: settings.profile || {
          displayName: '',
          bio: '',
          avatar: '',
          location: '',
          timezone: '',
          language: 'en',
          units: 'metric' as const
        }
      } as UserSettings;
    } catch (error) {
      console.error('Error getting user settings:', error);
      // Return default settings on error
      return this.getDefaultSettings(userId);
    }
  }

  /**
   * Update user settings (partial updates)
   */
  static async updateUserSettings(
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserSettings>(this.COLLECTION_NAME);

      // Ensure user settings exist
      const existingSettings = await collection.findOne({ userId });
      if (!existingSettings) {
        await this.createDefaultSettings(userId);
      }

      const result = await collection.updateOne(
        { userId },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
            lastActiveAt: new Date()
          }
        }
      );

      return result.matchedCount > 0;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }

  /**
   * Update specific settings section
   */
  static async updateSettingsSection(
    userId: string,
    section: keyof Omit<UserSettings, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'settingsVersion'>,
    data: any
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserSettings>(this.COLLECTION_NAME);

      const updateDoc: any = {
        updatedAt: new Date(),
        lastActiveAt: new Date()
      };
      updateDoc[section] = data;

      const result = await collection.updateOne(
        { userId },
        { $set: updateDoc },
        { upsert: true }
      );

      return result.matchedCount > 0 || result.upsertedCount > 0;
    } catch (error) {
      console.error('Error updating settings section:', error);
      return false;
    }
  }

  /**
   * Reset settings to defaults
   */
  static async resetUserSettings(
    userId: string,
    keepSections?: Array<keyof UserSettings>
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserSettings>(this.COLLECTION_NAME);

      const preservedData: any = {};

      // Preserve specified sections
      if (keepSections && keepSections.length > 0) {
        const existingSettings = await collection.findOne({ userId });
        if (existingSettings) {
          keepSections.forEach(section => {
            if (existingSettings[section]) {
              (preservedData as any)[section] = existingSettings[section];
            }
          });
        }
      }

      const defaultSettings = this.getDefaultSettings(userId);
      const resetSettings = {
        ...defaultSettings,
        ...preservedData,
        createdAt: defaultSettings.createdAt,
        updatedAt: new Date()
      };

      const result = await collection.replaceOne(
        { userId },
        resetSettings,
        { upsert: true }
      );

      return result.matchedCount > 0 || result.upsertedCount > 0;
    } catch (error) {
      console.error('Error resetting user settings:', error);
      return false;
    }
  }

  /**
   * Get user's dietary restrictions for filtering
   */
  static async getDietaryRestrictions(userId: string): Promise<{
    allergies: string[];
    intolerances: string[];
    excludedIngredients: string[];
    dietType?: string;
  }> {
    try {
      const settings = await this.getUserSettings(userId);
      return {
        allergies: settings.dietary.allergies,
        intolerances: settings.dietary.intolerances,
        excludedIngredients: settings.dietary.excludedIngredients,
        dietType: settings.dietary.dietType
      };
    } catch (error) {
      console.error('Error getting dietary restrictions:', error);
      return {
        allergies: [],
        intolerances: [],
        excludedIngredients: []
      };
    }
  }

  /**
   * Get notification preferences
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const settings = await this.getUserSettings(userId);
      return {
        email: settings.privacy.emailNotifications,
        push: settings.privacy.pushNotifications,
        frequency: 'daily', // Default
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        email: {
          newRecipeSuggestions: true,
          mealPlanReminders: true,
          groceryListReminders: true,
          weeklyNewsletter: false,
          systemUpdates: true
        },
        push: {
          mealReminders: true,
          cookingTimers: true,
          groceryReminders: true
        },
        frequency: 'daily',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      };
    }
  }

  /**
   * Complete onboarding process
   */
  static async completeOnboarding(
    userId: string,
    onboardingData: {
      profile: Partial<UserSettings['profile']>;
      dietary: Partial<UserSettings['dietary']>;
      mealPlanning: Partial<UserSettings['mealPlanning']>;
    }
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserSettings>(this.COLLECTION_NAME);

      const defaultSettings = this.getDefaultSettings(userId);

      const onboardedSettings: UserSettings = {
        ...defaultSettings,
        profile: { ...defaultSettings.profile, ...onboardingData.profile },
        dietary: { ...defaultSettings.dietary, ...onboardingData.dietary },
        mealPlanning: { ...defaultSettings.mealPlanning, ...onboardingData.mealPlanning },
        onboardingCompleted: true,
        updatedAt: new Date()
      };

      const result = await collection.replaceOne(
        { userId },
        onboardedSettings,
        { upsert: true }
      );

      return result.matchedCount > 0 || result.upsertedCount > 0;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  }

  /**
   * Export user settings
   */
  static async exportUserSettings(
    userId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<{ data: string; filename: string } | null> {
    try {
      const settings = await this.getUserSettings(userId);

      if (format === 'json') {
        return {
          data: JSON.stringify(settings, null, 2),
          filename: `smartplates-settings-${userId}-${Date.now()}.json`
        };
      } else {
        // CSV format (simplified)
        const csvData = this.settingsToCSV(settings);
        return {
          data: csvData,
          filename: `smartplates-settings-${userId}-${Date.now()}.csv`
        };
      }
    } catch (error) {
      console.error('Error exporting settings:', error);
      return null;
    }
  }

  /**
   * Create default settings for new user
   */
  private static async createDefaultSettings(userId: string): Promise<UserSettings> {
    const defaultSettings = this.getDefaultSettings(userId);

    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserSettings>(this.COLLECTION_NAME);

      await collection.insertOne(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error creating default settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Get default settings object
   */
  private static getDefaultSettings(userId: string): UserSettings {
    return {
      userId,
      profile: {
        language: 'en',
        units: 'metric'
      },
      dietary: {
        allergies: [],
        intolerances: [],
        excludedIngredients: [],
        preferredIngredients: [],
        spiceLevel: 'medium',
        cookingSkillLevel: 'beginner'
      },
      mealPlanning: {
        defaultServings: 4,
        planningHorizon: 7,
        preferredMealTimes: {
          breakfast: '08:00',
          lunch: '12:00',
          dinner: '18:00'
        },
        weekStartsOn: 1, // Monday
        autoGenerateGroceryList: true,
        includeLeftovers: true,
        batchCookingPreference: false
      },
      recipes: {
        defaultView: 'grid',
        sortPreference: 'newest',
        showNutritionInfo: true,
        showCookingTips: true,
        hideComplexRecipes: false,
        preferredCuisines: [],
        bookmarkOrganization: 'categories'
      },
      privacy: {
        profileVisibility: 'public',
        showRecipeHistory: true,
        showMealPlans: false,
        showCollections: true,
        allowMessageFromUsers: true,
        shareAnalyticsData: true,
        emailNotifications: {
          newRecipeSuggestions: true,
          mealPlanReminders: true,
          groceryListReminders: true,
          weeklyNewsletter: false,
          systemUpdates: true
        },
        pushNotifications: {
          mealReminders: true,
          cookingTimers: true,
          groceryReminders: true
        }
      },
      interface: {
        theme: 'light',
        compactMode: false,
        showTutorials: true,
        defaultLandingPage: 'dashboard',
        sidebarExpanded: true,
        enableKeyboardShortcuts: true,
        animationsEnabled: true,
        highContrastMode: false,
        fontSize: 'medium'
      },
      ai: {
        enableSmartSuggestions: true,
        fridgeAnalysisConsent: false,
        personalizedRecommendations: true,
        autoTagRecipes: true,
        suggestMealPlans: true,
        improveSearchResults: true,
        dataRetentionPeriod: 90
      },
      shopping: {
        preferredStores: [],
        deliveryPreferences: {
          enabled: false
        },
        couponsAndDeals: true,
        priceTracking: false,
        organicPreference: 'when-available',
        localProducePreference: true
      },
      data: {
        exportFormat: 'json',
        autoBackup: false,
        backupFrequency: 'weekly',
        syncAcrossDevices: true,
        offlineMode: false
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingCompleted: false,
      settingsVersion: this.CURRENT_SETTINGS_VERSION
    };
  }

  /**
   * Migrate settings to current version
   */
  private static async migrateSettings(settings: UserSettings): Promise<UserSettings> {
    // In future versions, add migration logic here
    const migratedSettings = {
      ...settings,
      settingsVersion: this.CURRENT_SETTINGS_VERSION,
      updatedAt: new Date()
    };

    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserSettings>(this.COLLECTION_NAME);

      await collection.replaceOne(
        { userId: settings.userId },
        migratedSettings
      );
    } catch (error) {
      console.error('Error migrating settings:', error);
    }

    return migratedSettings;
  }

  /**
   * Convert settings to CSV format
   */
  private static settingsToCSV(settings: UserSettings): string {
    const rows = [
      ['Setting', 'Value'],
      ['Language', settings.profile.language],
      ['Units', settings.profile.units],
      ['Diet Type', settings.dietary.dietType || 'None'],
      ['Cooking Skill', settings.dietary.cookingSkillLevel],
      ['Default Servings', settings.mealPlanning.defaultServings.toString()],
      ['Theme', settings.interface.theme],
      ['Notifications Enabled', settings.privacy.emailNotifications.mealPlanReminders.toString()],
      // Add more fields as needed
    ];

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Get settings summary for dashboard
   */
  static async getSettingsSummary(userId: string): Promise<{
    profileCompletion: number;
    dietaryPreferencesSet: boolean;
    notificationsEnabled: boolean;
    privacyLevel: 'open' | 'moderate' | 'private';
  }> {
    try {
      const settings = await this.getUserSettings(userId);

      // Calculate profile completion percentage
      let completionScore = 0;
      const totalFields = 10;

      if (settings.profile.displayName) completionScore++;
      if (settings.profile.bio) completionScore++;
      if (settings.profile.location) completionScore++;
      if (settings.dietary.dietType) completionScore++;
      if (settings.dietary.allergies.length > 0) completionScore++;
      if (settings.dietary.cookingSkillLevel !== 'beginner') completionScore++;
      if (settings.mealPlanning.preferredMealTimes.breakfast) completionScore++;
      if (settings.recipes.preferredCuisines.length > 0) completionScore++;
      if (settings.shopping.preferredStores.length > 0) completionScore++;
      if (settings.onboardingCompleted) completionScore++;

      const profileCompletion = Math.round((completionScore / totalFields) * 100);

      // Check dietary preferences
      const dietaryPreferencesSet = !!(
        settings.dietary.dietType ||
        settings.dietary.allergies.length > 0 ||
        settings.dietary.intolerances.length > 0
      );

      // Check notifications
      const notificationsEnabled = Object.values(settings.privacy.emailNotifications).some(Boolean);

      // Determine privacy level
      let privacyLevel: 'open' | 'moderate' | 'private' = 'moderate';
      if (settings.privacy.profileVisibility === 'private' || !settings.privacy.shareAnalyticsData) {
        privacyLevel = 'private';
      } else if (settings.privacy.profileVisibility === 'public' && settings.privacy.shareAnalyticsData) {
        privacyLevel = 'open';
      }

      return {
        profileCompletion,
        dietaryPreferencesSet,
        notificationsEnabled,
        privacyLevel
      };
    } catch (error) {
      console.error('Error getting settings summary:', error);
      return {
        profileCompletion: 0,
        dietaryPreferencesSet: false,
        notificationsEnabled: true,
        privacyLevel: 'moderate'
      };
    }
  }
}