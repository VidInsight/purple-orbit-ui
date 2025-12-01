/**
 * User Profile Page
 * Kullanıcı profil bilgilerini görüntüleme ve düzenleme
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Phone, Globe, Save, Loader2 } from 'lucide-react';
import type { User as ApiUser } from '@/types/api';

export const UserProfile = () => {
  const { user: authUser, getToken } = useAuth();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone_number: '',
    country_code: '',
    avatar_url: '',
  });

  useEffect(() => {
    loadUser();
  }, [authUser]);

  const loadUser = async () => {
    if (!authUser?.id) return;

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) return;

      const response = await apiClient.get<ApiUser>(
        API_ENDPOINTS.user.get(authUser.id),
        { token }
      );

      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        surname: response.data.surname || '',
        phone_number: response.data.phone_number || '',
        country_code: response.data.country_code || '',
        avatar_url: response.data.avatar_url || '',
      });
    } catch (error) {
      console.error('Error loading user:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!authUser?.id) return;

    try {
      setIsSaving(true);
      const token = getToken();
      if (!token) return;

      await apiClient.patch(
        API_ENDPOINTS.user.update(authUser.id),
        formData,
        { token }
      );

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });

      // Reload user data
      await loadUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-[1400px] px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null;
  }

  const initials = `${user.name?.[0] || ''}${user.surname?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Profile"
          description="Manage your profile information"
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Profile Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar_url} alt={user.name || user.username} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name} {user.surname}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input value={user.username || ''} disabled />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input value={user.email} disabled />
                  {user.is_email_verified ? (
                    <span className="text-xs text-green-500">Verified</span>
                  ) : (
                    <span className="text-xs text-amber-500">Not verified</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Last Name</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+905551234567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country Code</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="country"
                    value={formData.country_code}
                    onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                    placeholder="TR"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default UserProfile;

