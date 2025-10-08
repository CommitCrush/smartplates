/**
 * Admin Settings Panel
 * 
 * Comprehensive admin interface for managing users, recipes, and system settings
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { EnhancedRecipeUploadForm, type EnhancedRecipeFormData } from '@/components/forms/EnhancedRecipeUploadForm';
import {
  Settings,
  Users,
  User,
  BookOpen,
  Shield,
  Activity,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  totalRecipes: number;
  pendingRecipes: number;
  totalReviews: number;
  reportedContent: number;
  systemUptime: string;
  storageUsed: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  recipesCount: number;
  joinDate: Date;
  lastActive: Date;
  profileImage?: string;
}

interface RecipeData {
  _id: string;
  title: string;
  author: string;
  authorId: string;
  status: 'published' | 'pending' | 'rejected' | 'private';
  visibility: 'public' | 'private';
  likes: number;
  reviews: number;
  averageRating: number;
  createdAt: Date;
  reportCount?: number;
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  maxRecipesPerUser: number;
  maxImageSize: number;
  autoModeration: boolean;
  moderationKeywords: string[];
  emailNotifications: boolean;
  backupFrequency: string;
}

export default function AdminSettingsPage() {
  const { user, status } = useAuth();
  const loading = status === 'loading';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'recipes' | 'upload' | 'reports' | 'system'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'SmartPlates',
    siteDescription: 'Your intelligent cooking platform',
    maintenanceMode: false,
    allowUserRegistration: true,
    requireEmailVerification: true,
    maxRecipesPerUser: 100,
    maxImageSize: 5,
    autoModeration: true,
    moderationKeywords: ['spam', 'fake', 'inappropriate'],
    emailNotifications: true,
    backupFrequency: 'daily',
  });

  const [_isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      window.location.href = '/';
    }
  }, [user, loading]);

  // Load admin data
  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Load all admin data in parallel
      const [statsRes, usersRes, recipesRes, settingsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/recipes'),
        fetch('/api/admin/settings'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }

      if (recipesRes.ok) {
        const recipesData = await recipesRes.json();
        setRecipes(recipesData.recipes);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSystemSettings(settingsData.settings);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user status change
  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    try {
      const response = await fetch('/api/admin/users/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
        setMessage({ type: 'success', text: 'User status updated' });
      } else {
        throw new Error('Error updating user status');
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Error updating user status' });
    }
  };

  // Handle recipe moderation
  const handleRecipeModeration = async (recipeId: string, action: 'approve' | 'reject' | 'remove') => {
    try {
      const response = await fetch('/api/admin/recipes/moderate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, action }),
      });

      if (response.ok) {
        setRecipes(prev => prev.filter(r => r._id !== recipeId));
        setMessage({ type: 'success', text: 'Recipe action completed successfully' });
      } else {
        throw new Error('Error moderating recipe');
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Error moderating recipe' });
    }
  };

  // Save system settings
  const saveSystemSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: systemSettings }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'System settings saved' });
      } else {
        throw new Error('Error saving system settings');
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Error saving system settings' });
    }
  };

  // Handle recipe upload
  const handleRecipeUpload = async (recipeData: EnhancedRecipeFormData) => {
    try {
      const response = await fetch('/api/recipes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recipeData,
          authorId: user?.id, // Admin's ID
          isAdminUpload: true, // Mark as admin upload
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Recipe uploaded successfully' });
        // Refresh recipes list
        loadAdminData();
      } else {
        throw new Error('Error uploading recipe');
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Error uploading recipe' });
    }
  };

  // Filter and search functions
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredRecipes = (recipes || []).filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || recipe.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'upload', label: 'Upload Recipe', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: Shield },
    { id: 'system', label: 'System', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Manage users, recipes and system settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Navigation Sidebar */}
          <Card className="lg:col-span-1 p-4 h-fit">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeTab === tab.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Content Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Users</p>
                        <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                        <p className="text-xs text-green-600">+{stats?.activeUsers || 0} active</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Online</p>
                        <p className="text-2xl font-bold text-green-600">{stats?.onlineUsers || 0}</p>
                        <p className="text-xs text-muted-foreground">Last 24h</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Recipes</p>
                        <p className="text-2xl font-bold">{stats?.totalRecipes || 0}</p>
                        <p className="text-xs text-orange-600">{stats?.pendingRecipes || 0} pending</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-green-500" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reviews</p>
                        <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reports</p>
                        <p className="text-2xl font-bold text-red-600">{stats?.reportedContent || 0}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <p className="text-lg font-semibold">{stats?.systemUptime || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Storage Used</p>
                      <p className="text-lg font-semibold">{stats?.storageUsed || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">System Status</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Online
                      </Badge>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Recipes</th>
                        <th className="text-left p-2">Joined</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((userData, index) => (
                        <tr key={`${userData._id}-${index}`} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{userData.name}</p>
                                <p className="text-sm text-muted-foreground">{userData.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={userData.status === 'active' ? 'default' : 'destructive'}
                            >
                              {userData.status}
                            </Badge>
                          </td>
                          <td className="p-2">{userData.recipesCount}</td>
                          <td className="p-2">
                            {new Date(userData.joinDate).toLocaleDateString('en-US')}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              {userData.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserStatusChange(userData._id, 'suspended')}
                                >
                                  Suspend
                                </Button>
                              )}
                              {userData.status === 'suspended' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserStatusChange(userData._id, 'active')}
                                >
                                  Unsuspend
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUserStatusChange(userData._id, 'banned')}
                              >
                                Ban
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Recipes Tab */}
            {activeTab === 'recipes' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recipe Management</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search recipes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Recipe</th>
                        <th className="text-left p-2">Author</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Rating</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecipes.map((recipe, index) => (
                        <tr key={`${recipe._id}-${index}`} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{recipe.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(recipe.createdAt).toLocaleDateString('en-US')}
                              </p>
                            </div>
                          </td>
                          <td className="p-2">{recipe.author}</td>
                          <td className="p-2">
                            <Badge
                              variant={recipe.status === 'published' ? 'default' : 'secondary'}
                            >
                              {recipe.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{recipe.averageRating.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">
                                ({recipe.reviews})
                              </span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/recipe/${recipe._id}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {recipe.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleRecipeModeration(recipe._id, 'approve')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRecipeModeration(recipe._id, 'reject')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRecipeModeration(recipe._id, 'remove')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Upload Recipe Tab entfernt, Funktion ist jetzt eigene Seite */}

            {/* System Settings Tab */}
            {activeTab === 'system' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">System Settings</h3>

                <div className="space-y-6">
                  {/* Site Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Website Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="siteName">Website Name</Label>
                        <Input
                          id="siteName"
                          value={systemSettings.siteName}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="siteDescription">Website Description</Label>
                        <Input
                          id="siteDescription"
                          value={systemSettings.siteDescription}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Access Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Access Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Lock website for maintenance work
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.maintenanceMode}
                          onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Allow User Registration</Label>
                          <p className="text-sm text-muted-foreground">
                            New users can register
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.allowUserRegistration}
                          onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, allowUserRegistration: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Verification Required</Label>
                          <p className="text-sm text-muted-foreground">
                            Users must confirm their email
                          </p>
                        </div>
                        <Switch
                          checked={systemSettings.requireEmailVerification}
                          onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Content Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxRecipes">Max Recipes per User</Label>
                        <Input
                          id="maxRecipes"
                          type="number"
                          value={systemSettings.maxRecipesPerUser}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, maxRecipesPerUser: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxImageSize">Max Image Size (MB)</Label>
                        <Input
                          id="maxImageSize"
                          type="number"
                          value={systemSettings.maxImageSize}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, maxImageSize: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button onClick={saveSystemSettings} className="w-full">
                    Save Settings
                  </Button>
                </div>
              </Card>
            )}

            {/* Success/Error Messages */}
            {message && (
              <div className={cn(
                "p-4 rounded-lg flex items-center gap-3",
                message.type === 'success' 
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              )}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span>{message.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}