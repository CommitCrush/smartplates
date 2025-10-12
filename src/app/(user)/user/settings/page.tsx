'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { UpdateUserInput } from '@/types/user';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProfileEdit } from '@/components/profile/edit';

interface UserSettings {
 
  
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







export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UpdateUserInput>({
    name: '',
  });
  const [settings, setSettings] = useState<UserSettings>({
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
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Security form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
    verifyPassword: ''
  });

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
      
      // Save profile data
      const profileResponse = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      // Save settings data
      const settingsResponse = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (profileResponse.ok && settingsResponse.ok) {
        toast({
          title: 'Success',
          description: 'Profile and settings saved successfully!',
          variant: 'default'
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: 'Error',
        description: 'Changes could not be saved.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      const response = await fetch('/api/users/account-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'export' })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create downloadable file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartplates-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Success',
          description: 'Your data has been exported successfully!',
          variant: 'default'
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including recipes, meal plans, and personal information.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'To confirm account deletion, please type "DELETE" in capital letters:'
    );

    if (doubleConfirm !== 'DELETE') {
      toast({
        title: 'Cancelled',
        description: 'Account deletion cancelled.',
        variant: 'default'
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await fetch('/api/users/account-actions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmDelete: true })
      });

      if (response.ok) {
        toast({
          title: 'Account Deleted',
          description: 'Your account has been successfully deleted.',
          variant: 'default'
        });
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        throw new Error('Deletion failed');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordReset = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'New password must be at least 8 characters long.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Password updated successfully! Please sign in again.',
          variant: 'default'
        });
        
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Log out user after 2 seconds
        setTimeout(() => {
          window.location.href = '/api/auth/signout';
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password.',
        variant: 'destructive'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEmailChange = async () => {
    // Validation
    if (!emailData.newEmail || !emailData.verifyPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    if (emailData.newEmail === user?.email) {
      toast({
        title: 'Error',
        description: 'New email must be different from current email.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsChangingEmail(true);

      const response = await fetch('/api/users/change-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          currentPassword: emailData.verifyPassword
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Verification Email Sent',
          description: `A verification email has been sent to ${emailData.newEmail}. Please check your inbox and click the verification link to complete the email change.`,
          variant: 'default'
        });
        
        // In development mode, show the verification URL
        if (result.verificationUrl && process.env.NODE_ENV === 'development') {
          console.log('🔗 Development verification URL:', result.verificationUrl);
          alert(`Development Mode: Copy this URL to verify email change:\n\n${result.verificationUrl}`);
        }
        
        // Clear form
        setEmailData({
          newEmail: '',
          verifyPassword: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Email change failed');
      }
    } catch (error) {
      console.error('Error changing email:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to initiate email change.',
        variant: 'destructive'
      });
    } finally {
      setIsChangingEmail(false);
    }
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
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* User Profile Edit Section */}
        <ProfileEdit 
          formData={profileData}
          onFormDataChange={setProfileData}
        />

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
                <Label htmlFor="meal-reminders">Meal Plan Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for your planned meals
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
                <Label htmlFor="new-features">New Features</Label>
                <p className="text-sm text-muted-foreground">
                  Information about new SmartPlates features
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
                  Monthly newsletter with tips and trends
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

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your account security and login information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password Reset Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-muted-foreground">
                  Update your account password for better security
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <input
                    id="current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter your new password (min. 8 characters)"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your new password"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handlePasswordReset}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                </Button>
              </div>
            </div>

            {/* Email Change Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-medium">Change Email Address</h4>
                <p className="text-sm text-muted-foreground">
                  Update your email address. You will need to verify the new email.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="current-email">Current Email</Label>
                  <input
                    id="current-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-email">New Email Address</Label>
                  <input
                    id="new-email"
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                    placeholder="Enter your new email address"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                
                <div>
                  <Label htmlFor="verify-password">Current Password (for verification)</Label>
                  <input
                    id="verify-password"
                    type="password"
                    value={emailData.verifyPassword}
                    onChange={(e) => setEmailData(prev => ({ ...prev, verifyPassword: e.target.value }))}
                    placeholder="Enter your current password to verify"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleEmailChange}
                  disabled={isChangingEmail}
                >
                  {isChangingEmail ? 'Sending Verification...' : 'Send Verification Email'}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Important:</p>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• A verification email will be sent to your new email address</li>
                  <li>• You must click the verification link to complete the change</li>
                  <li>• You will be logged out and need to sign in with your new email</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Manage your privacy preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Who can see your profile?
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
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-email">Show Email</Label>
                <p className="text-sm text-muted-foreground">
                  Display your email address in your public profile
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
                <Label htmlFor="show-location">Show Location</Label>
                <p className="text-sm text-muted-foreground">
                  Display your location in your public profile
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
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your SmartPlates account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Export Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download all your SmartPlates data
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-red-600">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save All Changes Button */}
        <div className="flex justify-center pt-6">
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            size="lg"
            className="flex items-center gap-2 px-8"
          >
            <Save className="h-5 w-5" />
            {isSaving ? 'Saving All Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
