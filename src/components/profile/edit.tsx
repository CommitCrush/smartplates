'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { cn } from '@/lib/utils';
import { User, UpdateUserInput } from '@/types/user';

interface ProfileEditProps {
  className?: string;
  onSave?: (userData: UpdateUserInput) => void;
}

export function ProfileEdit({ className, onSave }: ProfileEditProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UpdateUserInput>({
    name: '',
    dietaryRestrictions: [],
    favoriteCategories: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Popular dietary restrictions and categories
  const commonDietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
    'Keto', 'Paleo', 'Low-Carb', 'Halal', 'Kosher'
  ];

  const commonCategories = [
    'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Appetizers',
    'Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'Thai'
  ];

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        dietaryRestrictions: (user as any).dietaryRestrictions || [],
        favoriteCategories: (user as any).favoriteCategories || [],
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCheckboxChange = (field: 'dietaryRestrictions' | 'favoriteCategories', value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      const isChecked = currentArray.includes(value);
      
      return {
        ...prev,
        [field]: isChecked 
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        onSave?.(formData);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile');
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
        <div className="text-gray-500">Please sign in to edit your profile.</div>
      </div>
    );
  }

  return (
    <div className={cn('max-w-2xl mx-auto p-6', className)}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={user.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              placeholder="Email cannot be changed"
            />
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Dietary Restrictions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonDietaryRestrictions.map((restriction) => (
                <label key={restriction} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dietaryRestrictions?.includes(restriction) || false}
                    onChange={() => handleCheckboxChange('dietaryRestrictions', restriction)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{restriction}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Favorite Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Favorite Recipe Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonCategories.map((category) => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.favoriteCategories?.includes(category) || false}
                    onChange={() => handleCheckboxChange('favoriteCategories', category)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                </label>
              ))}
            </div>
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
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}