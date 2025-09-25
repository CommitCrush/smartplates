'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';
import { Button } from '@/components/ui/button';
import { ThemeSelector } from '@/components/ui/theme-toggle';
import { User, Mail, Bell, Shield, Palette, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserSettingsProps {
  className?: string;
}

export function UserSettings({ className }: UserSettingsProps) {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    dietaryRestrictions: user?.dietaryRestrictions || [],
    notifications: {
      email: user?.notifications?.email ?? true,
      push: user?.notifications?.push ?? true,
      mealReminders: user?.notifications?.mealReminders ?? true,
      weeklyPlanning: user?.notifications?.weeklyPlanning ?? true,
    },
    privacy: {
      profilePublic: user?.privacy?.profilePublic ?? false,
      recipesPublic: user?.privacy?.recipesPublic ?? true,
      mealPlansPublic: user?.privacy?.mealPlansPublic ?? false,
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Settings updated successfully!');
    } catch (error) {
      setMessage('Failed to update settings. Please try again.');
      console.error('Settings update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Paleo',
    'Low-Carb',
    'Nut-Free'
  ];

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      <div className="bg-background-card rounded-lg shadow-md border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Settings</h1>
          <p className="text-foreground-muted">
            Manage your account preferences and customize your SmartPlates experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Profile Section */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
          </section>

          {/* Theme Settings */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-foreground">Theme Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Choose your preferred theme
                </label>
                <ThemeSelector className="max-w-xs" />
                <p className="text-xs text-foreground-muted mt-2">
                  Select light or dark theme, or use system setting to match your device preferences
                </p>
              </div>
            </div>
          </section>

          {/* Dietary Restrictions */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-foreground">Dietary Preferences</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Select your dietary restrictions and preferences
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {dietaryOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dietaryRestrictions.includes(option)}
                      onChange={(e) => {
                        const newRestrictions = e.target.checked
                          ? [...formData.dietaryRestrictions, option]
                          : formData.dietaryRestrictions.filter(r => r !== option);
                        handleInputChange('dietaryRestrictions', newRestrictions);
                      }}
                      className="rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Email Notifications</label>
                  <p className="text-xs text-foreground-muted">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications.email}
                    onChange={(e) => handleNestedInputChange('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Push Notifications</label>
                  <p className="text-xs text-foreground-muted">Receive push notifications in your browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications.push}
                    onChange={(e) => handleNestedInputChange('notifications', 'push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Meal Reminders</label>
                  <p className="text-xs text-foreground-muted">Get reminded about upcoming meals</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications.mealReminders}
                    onChange={(e) => handleNestedInputChange('notifications', 'mealReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Weekly Planning</label>
                  <p className="text-xs text-foreground-muted">Weekly meal planning reminders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications.weeklyPlanning}
                    onChange={(e) => handleNestedInputChange('notifications', 'weeklyPlanning', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Privacy Settings */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-foreground">Privacy Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Public Profile</label>
                  <p className="text-xs text-foreground-muted">Make your profile visible to other users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacy.profilePublic}
                    onChange={(e) => handleNestedInputChange('privacy', 'profilePublic', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Public Recipes</label>
                  <p className="text-xs text-foreground-muted">Allow others to view your created recipes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacy.recipesPublic}
                    onChange={(e) => handleNestedInputChange('privacy', 'recipesPublic', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Public Meal Plans</label>
                  <p className="text-xs text-foreground-muted">Share your meal plans with the community</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacy.mealPlansPublic}
                    onChange={(e) => handleNestedInputChange('privacy', 'mealPlansPublic', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Status Message */}
          {message && (
            <div className={cn(
              "p-3 rounded-md text-sm",
              message.includes('successfully') 
                ? "bg-primary-100 text-primary-800 border border-primary-200" 
                : "bg-coral-100 text-coral-800 border border-coral-200"
            )}>
              {message}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-r-transparent rounded-full" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserSettings;