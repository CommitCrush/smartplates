'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { cn } from '@/lib/utils';
import { User, UpdateUserInput } from '@/types/user';
import CloudinaryWidgetUpload from '@/components/ui/CloudinaryWidgetUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Camera, User as UserIcon } from 'lucide-react';

interface ProfileEditProps {
  className?: string;
  onSave?: (userData: UpdateUserInput) => void;
  formData?: UpdateUserInput;
  onFormDataChange?: (data: UpdateUserInput) => void;
}

export function ProfileEdit({ className, onSave, formData: externalFormData, onFormDataChange }: ProfileEditProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [internalFormData, setInternalFormData] = useState<UpdateUserInput>({
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Use external form data if provided, otherwise use internal
  const formData = externalFormData || internalFormData;
  const setFormData = onFormDataChange || setInternalFormData;

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
      };
      setFormData(userData);
      setAvatarUrl(user.image || '');
    }
  }, [user, setFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newData);
  };

  const handleAvatarUpload = async (uploadResult: { public_id: string; secure_url: string; url: string }) => {
    try {
      // Save the uploaded image URL to the user profile in MongoDB
      const response = await fetch('/api/users/profile/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id
        })
      });

      if (response.ok) {
        setAvatarUrl(uploadResult.secure_url);
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully!',
          variant: 'default'
        });
      } else {
        throw new Error('Failed to save profile picture');
      }
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save profile picture.',
        variant: 'destructive'
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Please sign in to edit your profile.</div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="bg-card text-card-foreground rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Profile Information</h3>
            <p className="text-sm text-muted-foreground">
              Update your basic profile information
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={avatarUrl} 
                    alt={formData.name || 'Profile'} 
                  />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                    {formData.name ? (
                      formData.name.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="h-8 w-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute -bottom-2 -right-2">
                  <CloudinaryWidgetUpload
                    onUpload={handleAvatarUpload}
                    onError={(error) => {
                      toast({
                        title: 'Upload Error',
                        description: error,
                        variant: 'destructive'
                      });
                    }}
                    buttonText=""
                    buttonVariant="default"
                    folder="smartplates/profiles"
                    className="h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary/90 flex items-center justify-center"
                  />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                  Click the camera icon to upload a new picture
                </p>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                placeholder="Your current email address"
              />
              <p className="text-xs text-muted-foreground mt-1">
                To change your email address, go to{' '}
                <a 
                  href="/user/settings" 
                  className="text-primary hover:text-primary/80 underline"
                >
                  Account Settings
                </a>
                {' '}→ Security Settings
              </p>
            </div>

            {/* Display messages */}
            {message && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-md text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}