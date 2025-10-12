'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Activity, Shield, Eye } from 'lucide-react';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  savedRecipes: number;
  createdRecipes: number;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      setError('Error loading users');
      console.error('Users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <Card className="p-6">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={fetchUsers} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="text-sm text-muted-foreground">
          Total Users: {users.length}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role.toUpperCase()}
                    </Badge>
                    {user.isEmailVerified && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Verified
                      </Badge>
                    )}
                    {user.isActive === false ? (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Deaktiviert</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Aktiv</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* User Stats & Actions */}
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                {/* Stats */}
                <div className="text-center text-sm">
                  <div className="font-semibold text-coral-600">{user.createdRecipes}</div>
                  <div className="text-muted-foreground">Created</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    asChild
                    variant="outline" 
                    size="sm"
                  >
                    <a href={`/admin/dashboard/manage-users/${user.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </a>
                  </Button>
                  
                  {user.role !== 'admin' && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a href={`/admin/dashboard/manage-users/${user.id}/edit`}>
                        Edit
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <Card className="p-12 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
          <p className="text-muted-foreground">
            No users are currently registered in the system.
          </p>
        </Card>
      )}
    </div>
  );
}
