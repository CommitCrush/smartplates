
'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/context/authContext';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  Settings, 
  ChefHat,
  Calendar,
  BookOpen,
  LogOut,
  ChevronDown,
  Star,
  Users,
  Shield,
  Upload,
  ShoppingCart
} from 'lucide-react';
import { slugify } from '@/lib/utils';

interface UserProfileDropdownProps {
  className?: string;
  isMobile?: boolean;
}

export default function UserProfileDropdown({ className = '', isMobile = false }: UserProfileDropdownProps) {
  const { status, user, isAuthenticated, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
        <Link
          href="/login"
          className={`px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isMobile ? 'w-full text-center' : ''}`}
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors ${isMobile ? 'w-full text-center' : ''}`}
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const userAvatar = user?.image || '/placeholder-avatar.svg';
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  const navigationItems = isAdmin ? [
    {
      icon: User,
      label: 'Profil',
      href: '/admin/profile',
      description: 'Verwalte dein Admin-Profil'
    },
    {
      icon: Shield,
      label: 'Admin Panel',
      href: '/admin',
      description: 'Haupt-Dashboard'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/admin/settings',
      description: 'Account-Einstellungen'
    }
  ] : [
    {
      icon: User,
      label: ' Profile',
      href: '/user/dashboard',
      description: 'Go to your dashboard'
    },
    {
      icon: Upload,
      label: 'Upload Recipe',
      href: '/user/',
      description: 'Upload your recipes'
    },
    {
      icon: ShoppingCart,
      label: 'Shopping List',
      href: user?.name ? `/user/${encodeURIComponent(slugify(user.name))}/user/shopping_list` : '/user/shopping_list',
      description: 'Your meal planning'
    },
    {
      icon: ShoppingCart,
      label: 'Shopping List',
      href: '/user/shopping-list',
      description: 'View your shopping list'
    },
    {
      icon: Star,
      label: 'Saved Plans',
      href: '/user/my_saved_meal_plan',
      description: 'Your saved meal plans'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Mobile-optimized view for authenticated users
  if (isMobile && isAuthenticated) {
    return (
      <div className="space-y-3">
        {/* Mobile User Info */}
        <div className="flex items-center space-x-3 px-3 py-2">
          <Image
            src={userAvatar}
            alt={`${userName}'s avatar`}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-white">
              {userName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {userEmail}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <item.icon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-900 dark:text-white">{item.label}</span>
            </Link>
          ))}
          {isAdmin ? (
            <>
              <Link
                href="/admin/profile"
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900 dark:text-white">Profil</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900 dark:text-white">Admin Panel</span>
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900 dark:text-white">Settings</span>
              </Link>
            </>
          ) : (
            <Link
              href="/user/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="text-gray-900 dark:text-white">Settings</span>
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
          >
            <LogOut className="h-4 w-4 text-gray-500" />
            <span className="text-gray-900 dark:text-white">Sign out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-auto"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          <Image
            src={userAvatar}
            alt={`${userName}'s avatar`}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
          />
          {/* Status indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[100]">
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <Image
                src={userAvatar}
                alt={`${userName}'s avatar`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {userName}
                  </h3>
                  {/* Pro badge example */}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Star className="w-3 h-3 mr-1" />
                    Chef
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {userEmail}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Users className="w-3 h-3 mr-1" />
                  SmartPlates Community
                </div>
              </div>
            </div>
            
          </div>

          {/* Navigation Links */}
          <div className="p-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <item.icon className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            {!isAdmin && (
              <Link
                href="/user/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <Settings className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Settings</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Account preferences</div>
                </div>
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 p-3 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group w-full"
            >
              <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
                  Sign out
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Sign out of your account
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
