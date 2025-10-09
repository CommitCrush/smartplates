'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  maxRecipesPerUser: number;
  maxImageSize: number;
  autoModeration: boolean;
  emailNotifications: boolean;
}

export default function AdminSystemSettingsPage() {
  const { user, status } = useAuth();
  const loading = status === 'loading';
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'SmartPlates',
    siteDescription: 'Your intelligent cooking platform',
    maintenanceMode: false,
    allowUserRegistration: true,
    maxRecipesPerUser: 100,
    maxImageSize: 5,
    autoModeration: true,
    emailNotifications: true,
  });

  const [message, setMessage] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      window.location.href = '/';
    }
  }, [user, loading]);

  const saveSystemSettings = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: systemSettings }),
      });

      if (response.ok) {
        setMessage('Settings saved successfully');
      } else {
        setMessage('Error saving settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
          <p className="text-gray-600">Manage system configuration and preferences</p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">
            {message}
          </div>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">System Configuration</h3>

          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Website Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName" className="text-sm font-medium">Site Name</Label>
                  <Input
                    id="siteName"
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription" className="text-sm font-medium">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={systemSettings.siteDescription}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">User Management</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Allow User Registration</Label>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.allowUserRegistration}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, allowUserRegistration: e.target.checked }))}
                    className="h-4 w-4 text-green-600 rounded"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxRecipesPerUser" className="text-sm font-medium">Max Recipes Per User</Label>
                  <Input
                    id="maxRecipesPerUser"
                    type="number"
                    value={systemSettings.maxRecipesPerUser}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxRecipesPerUser: parseInt(e.target.value) || 0 }))}
                    className="mt-1 max-w-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Content Settings</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxImageSize" className="text-sm font-medium">Max Image Size (MB)</Label>
                  <Input
                    id="maxImageSize"
                    type="number"
                    value={systemSettings.maxImageSize}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxImageSize: parseInt(e.target.value) || 0 }))}
                    className="mt-1 max-w-xs"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Auto Moderation</Label>
                    <p className="text-sm text-gray-500">Automatically moderate content</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.autoModeration}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, autoModeration: e.target.checked }))}
                    className="h-4 w-4 text-green-600 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">System Features</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Put site in maintenance mode</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                    className="h-4 w-4 text-green-600 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Enable email notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.emailNotifications}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="h-4 w-4 text-green-600 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button 
                onClick={saveSystemSettings} 
                disabled={saving}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
