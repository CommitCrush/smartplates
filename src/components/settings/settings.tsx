'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { cn } from '@/lib/utils';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  profileVisibility: 'public' | 'private';
  autoSave: boolean;
}

interface UserSettingsProps {
  className?: string;
}

export function UserSettings({ className }: UserSettingsProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    language: 'en',
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: 'public',
    autoSave: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'it', label: 'Italiano' },
  ];

  // Load user settings
  useEffect(() => {
    loadUserSettings();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/users/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        
        // Apply theme change immediately
        if (settings.theme !== 'system') {
          document.documentElement.classList.toggle('dark', settings.theme === 'dark');
        } else {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          document.documentElement.classList.toggle('dark', mediaQuery.matches);
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save settings');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Please sign in to access settings.</div>
      </div>
    );
  }

  return (
    <div className={cn('max-w-2xl mx-auto p-6', className)}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <label key={theme} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={settings.theme === theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Notifications
            </label>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Privacy
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Profile Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['public', 'private'] as const).map((visibility) => (
                    <label key={visibility} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value={visibility}
                        checked={settings.profileVisibility === visibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{visibility}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* App Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              App Preferences
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Auto-save recipes</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically save your progress when editing recipes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </label>
          </div>

          {/* Messages */}
          {message && (
            <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}