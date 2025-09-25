'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UserSettings {
  dietaryRestrictions: string[];
  allergies: string[];
  cuisinePreferences: string[];
  emailNotifications: {
    recipeRecommendations: boolean;
    mealPlanReminders: boolean;
    newFeatures: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showLocation: boolean;
  };
  preferences: {
    defaultServings: number;
    measurementUnit: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'system';
  };
}

const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Lactose-Free', 'Pescetarian',
  'Paleo', 'Keto', 'Low-Carb', 'Halal', 'Kosher'
];

const COMMON_ALLERGIES = [
  'Nuts', 'Peanuts', 'Dairy', 'Eggs', 'Fish', 'Shellfish',
  'Soy', 'Wheat', 'Sesame', 'Sulfites'
];

const CUISINE_PREFERENCES = [
  'Italian', 'Asian', 'Mediterranean', 'Mexican', 'Indian',
  'French', 'German', 'American', 'Greek', 'Turkish'
];

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
    emailNotifications: {
      recipeRecommendations: true,
      mealPlanReminders: true,
      newFeatures: false,
      newsletter: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true
    },
    preferences: {
      defaultServings: 4,
      measurementUnit: 'metric',
      theme: 'system'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserSettings();
    }
  }, [isAuthenticated, user]);

  const fetchUserSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/settings');
      
      if (response.ok) {
        const userSettings = await response.json();
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Settings could not be loaded.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Settings saved successfully!',
          variant: 'default'
        });
      } else {
        throw new Error('Settings update failed');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Settings could not be saved.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addRestriction = (restriction: string) => {
    if (!settings.dietaryRestrictions.includes(restriction)) {
      setSettings(prev => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, restriction]
      }));
    }
  };

  const removeRestriction = (restriction: string) => {
    setSettings(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.filter(r => r !== restriction)
    }));
  };

  const addAllergy = (allergy: string) => {
    if (!settings.allergies.includes(allergy)) {
      setSettings(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }));
    }
  };

  const removeAllergy = (allergy: string) => {
    setSettings(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const addCuisinePreference = (cuisine: string) => {
    if (!settings.cuisinePreferences.includes(cuisine)) {
      setSettings(prev => ({
        ...prev,
        cuisinePreferences: [...prev.cuisinePreferences, cuisine]
      }));
    }
  };

  const removeCuisinePreference = (cuisine: string) => {
    setSettings(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.filter(c => c !== cuisine)
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please sign in to manage your settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>

        {/* Dietary Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Dietary Settings</CardTitle>
            <CardDescription>
              Your dietary habits and restrictions for better recipe recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dietary Restrictions */}
            <div>
              <Label className="text-base font-medium">Dietary Restrictions</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {settings.dietaryRestrictions.map(restriction => (
                  <Badge key={restriction} variant="secondary" className="flex items-center gap-1">
                    {restriction}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeRestriction(restriction)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {DIETARY_RESTRICTIONS
                  .filter(r => !settings.dietaryRestrictions.includes(r))
                  .map(restriction => (
                    <Button
                      key={restriction}
                      variant="outline"
                      size="sm"
                      onClick={() => addRestriction(restriction)}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {restriction}
                    </Button>
                  ))
                }
              </div>
            </div>

            {/* Allergies */}
            <div>
              <Label className="text-base font-medium">Allergies & Intolerances</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {settings.allergies.map(allergy => (
                  <Badge key={allergy} variant="destructive" className="flex items-center gap-1">
                    {allergy}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeAllergy(allergy)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {COMMON_ALLERGIES
                  .filter(a => !settings.allergies.includes(a))
                  .map(allergy => (
                    <Button
                      key={allergy}
                      variant="outline"
                      size="sm"
                      onClick={() => addAllergy(allergy)}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {allergy}
                    </Button>
                  ))
                }
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div>
              <Label className="text-base font-medium">Cuisine Preferences</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {settings.cuisinePreferences.map(cuisine => (
                  <Badge key={cuisine} variant="default" className="flex items-center gap-1">
                    {cuisine}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeCuisinePreference(cuisine)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {CUISINE_PREFERENCES
                  .filter(c => !settings.cuisinePreferences.includes(c))
                  .map(cuisine => (
                    <Button
                      key={cuisine}
                      variant="outline"
                      size="sm"
                      onClick={() => addCuisinePreference(cuisine)}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {cuisine}
                    </Button>
                  ))
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Choose which emails you would like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="recipe-recommendations">Recipe Recommendations</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly personalized recipe suggestions
                </p>
              </div>
              <Switch
                id="recipe-recommendations"
                checked={settings.emailNotifications.recipeRecommendations}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    emailNotifications: {
                      ...prev.emailNotifications,
                      recipeRecommendations: checked
                    }
                  }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="meal-reminders">Essensplan-Erinnerungen</Label>
                <p className="text-sm text-muted-foreground">
                  Erinnerungen für Ihre geplanten Mahlzeiten
                </p>
              </div>
              <Switch
                id="meal-reminders"
                checked={settings.emailNotifications.mealPlanReminders}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    emailNotifications: {
                      ...prev.emailNotifications,
                      mealPlanReminders: checked
                    }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-features">Neue Features</Label>
                <p className="text-sm text-muted-foreground">
                  Informationen über neue SmartPlates Features
                </p>
              </div>
              <Switch
                id="new-features"
                checked={settings.emailNotifications.newFeatures}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    emailNotifications: {
                      ...prev.emailNotifications,
                      newFeatures: checked
                    }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newsletter">Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Monatlicher Newsletter mit Tipps und Trends
                </p>
              </div>
              <Switch
                id="newsletter"
                checked={settings.emailNotifications.newsletter}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    emailNotifications: {
                      ...prev.emailNotifications,
                      newsletter: checked
                    }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Datenschutz</CardTitle>
            <CardDescription>
              Verwalten Sie Ihre Privatsphäre-Einstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Profil-Sichtbarkeit</Label>
                <p className="text-sm text-muted-foreground">
                  Wer kann Ihr Profil sehen?
                </p>
              </div>
              <select 
                value={settings.privacy.profileVisibility}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    privacy: {
                      ...prev.privacy,
                      profileVisibility: e.target.value as 'public' | 'private'
                    }
                  }))
                }
                className="px-3 py-1 border rounded-md"
              >
                <option value="public">Öffentlich</option>
                <option value="private">Privat</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-email">E-Mail anzeigen</Label>
                <p className="text-sm text-muted-foreground">
                  E-Mail-Adresse in Ihrem öffentlichen Profil anzeigen
                </p>
              </div>
              <Switch
                id="show-email"
                checked={settings.privacy.showEmail}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    privacy: {
                      ...prev.privacy,
                      showEmail: checked
                    }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-location">Standort anzeigen</Label>
                <p className="text-sm text-muted-foreground">
                  Ihren Standort in Ihrem öffentlichen Profil anzeigen
                </p>
              </div>
              <Switch
                id="show-location"
                checked={settings.privacy.showLocation}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    privacy: {
                      ...prev.privacy,
                      showLocation: checked
                    }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account-Aktionen</CardTitle>
            <CardDescription>
              Verwalten Sie Ihren SmartPlates Account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Daten exportieren</h4>
                <p className="text-sm text-muted-foreground">
                  Laden Sie alle Ihre SmartPlates Daten herunter
                </p>
              </div>
              <Button variant="outline">
                Daten exportieren
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-red-600">Account löschen</h4>
                <p className="text-sm text-muted-foreground">
                  Permanente Löschung Ihres Accounts und aller Daten
                </p>
              </div>
              <Button variant="destructive">
                Account löschen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
