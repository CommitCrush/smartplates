'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Calendar
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UserProfilePageProps { 
  params: Promise<{ id: string }>; 
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  dietaryRestrictions?: string[];
  favoriteCategories?: string[];
  createdAt: string;
  isOwner: boolean;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: ''
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/profile/${userId}`);
      
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setEditForm({
          name: profileData.name || '',
          bio: profileData.bio || '',
          location: profileData.location || ''
        });
      } else {
        toast({
          title: 'Fehler',
          description: 'Benutzerprofil konnte nicht geladen werden.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Fehler',
        description: 'Ein Fehler ist beim Laden des Profils aufgetreten.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
        setIsEditing(false);
        toast({
          title: 'Erfolg',
          description: 'Profil erfolgreich aktualisiert!',
        });
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Fehler',
        description: 'Profil konnte nicht aktualisiert werden.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>Benutzerprofil nicht gefunden.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Erzählen Sie etwas über sich..."
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Standort</Label>
                      <Input
                        id="location"
                        placeholder="Ihr Standort"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    {profile.bio && (
                      <p className="text-muted-foreground mt-2">{profile.bio}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {profile.email}
                      </div>
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Mitglied seit {new Date(profile.createdAt).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              {profile.isOwner && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveProfile} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Speichern
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)} 
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Abbrechen
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dietary Restrictions & Preferences */}
        {(profile.dietaryRestrictions?.length || profile.favoriteCategories?.length) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dietary Restrictions */}
            {profile.dietaryRestrictions?.length && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ernährungseinschränkungen</CardTitle>
                  <CardDescription>
                    Besondere Ernährungsformen und Allergien
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.dietaryRestrictions.map((restriction, index) => (
                      <Badge key={index} variant="secondary">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Favorite Categories */}
            {profile.favoriteCategories?.length && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lieblings-Kategorien</CardTitle>
                  <CardDescription>
                    Bevorzugte Rezeptkategorien
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.favoriteCategories.map((category, index) => (
                      <Badge key={index} variant="default">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Profile Actions for Non-Owner */}
        {!profile.isOwner && isAuthenticated && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Möchten Sie mit {profile.name} in Kontakt treten?
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline">
                    Nachricht senden
                  </Button>
                  <Button variant="outline">
                    Rezepte ansehen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Public Profile Notice */}
        {!isAuthenticated && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                <a href="/auth/signin" className="text-primary hover:underline">
                  Melden Sie sich an
                </a>, um mehr Profil-Features zu sehen.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
