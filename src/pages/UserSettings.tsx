/**
 * User Settings Page
 * Güvenlik ayarları, session yönetimi, login history, password history, account deletion
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Shield, Key, History, Trash2, LogOut, Loader2, Monitor, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Session {
  id: string;
  device?: string;
  ip_address?: string;
  location?: string;
  created_at: string;
  last_activity?: string;
  is_current?: boolean;
}

interface LoginHistory {
  id: string;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  created_at: string;
  success: boolean;
}

interface PasswordHistory {
  id: string;
  created_at: string;
}

export const UserSettings = () => {
  const { user, getToken, logout, logoutAll } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('security');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadSessions();
      loadLoginHistory();
      loadPasswordHistory();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) return;

      const response = await apiClient.get<{ sessions: Session[] }>(
        API_ENDPOINTS.user.getSessions(user.id),
        { token }
      );

      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    if (!user?.id) return;

    try {
      const token = getToken();
      if (!token) return;

      const response = await apiClient.get<{ items: LoginHistory[] }>(
        `${API_ENDPOINTS.user.getLoginHistory(user.id)}?limit=50`,
        { token }
      );

      setLoginHistory(response.data.items || []);
    } catch (error) {
      console.error('Error loading login history:', error);
    }
  };

  const loadPasswordHistory = async () => {
    if (!user?.id) return;

    try {
      const token = getToken();
      if (!token) return;

      const response = await apiClient.get<{ items: PasswordHistory[] }>(
        `${API_ENDPOINTS.user.getPasswordHistory(user.id)}?limit=10`,
        { token }
      );

      setPasswordHistory(response.data.items || []);
    } catch (error) {
      console.error('Error loading password history:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user?.id) return;

    try {
      const token = getToken();
      if (!token) return;

      await apiClient.delete(
        API_ENDPOINTS.user.deleteSession(user.id, sessionId),
        { token }
      );

      toast({
        title: 'Session Terminated',
        description: 'The session has been terminated successfully.',
      });

      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to terminate session',
        variant: 'destructive',
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) return;

    try {
      setIsChangingPassword(true);
      const token = getToken();
      if (!token) return;

      await apiClient.put(
        API_ENDPOINTS.user.updatePassword(user.id),
        {
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        },
        { token }
      );

      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully.',
      });

      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!user?.id) return;

    try {
      const token = getToken();
      if (!token) return;

      await apiClient.post(
        API_ENDPOINTS.user.requestDeletion(user.id),
        { reason: deletionReason },
        { token }
      );

      toast({
        title: 'Deletion Requested',
        description: 'Your account deletion has been requested. Your account will be deleted in 30 days unless cancelled.',
      });

      setDeletionReason('');
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast({
        title: 'Error',
        description: 'Failed to request account deletion',
        variant: 'destructive',
      });
    }
  };

  const currentSession = sessions.find((s) => s.is_current);

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Settings"
          description="Manage your account settings and security"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old_password">Current Password</Label>
                  <Input
                    id="old_password"
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Active Sessions
                </CardTitle>
                <CardDescription>Manage your active sessions across different devices</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No active sessions</p>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Monitor className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{session.device || 'Unknown Device'}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {session.ip_address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.ip_address}
                                </span>
                              )}
                              {session.last_activity && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(session.last_activity), 'PPp')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.is_current && (
                            <span className="text-xs text-green-500">Current</span>
                          )}
                          {!session.is_current && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              Terminate
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await logoutAll();
                        navigate('/login');
                      }}
                      className="w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout from All Devices
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Login History
                </CardTitle>
                <CardDescription>Recent login attempts to your account</CardDescription>
              </CardHeader>
              <CardContent>
                {loginHistory.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No login history</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loginHistory.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{format(new Date(entry.created_at), 'PPp')}</TableCell>
                          <TableCell>{entry.ip_address || 'N/A'}</TableCell>
                          <TableCell>{entry.location || 'N/A'}</TableCell>
                          <TableCell>
                            {entry.success ? (
                              <span className="text-green-500">Success</span>
                            ) : (
                              <span className="text-red-500">Failed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password History</CardTitle>
                <CardDescription>Recent password changes</CardDescription>
              </CardHeader>
              <CardContent>
                {passwordHistory.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No password history</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {passwordHistory.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{format(new Date(entry.created_at), 'PPp')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="mt-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deletion_reason">Reason for deletion (optional)</Label>
                  <Input
                    id="deletion_reason"
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    placeholder="Why are you deleting your account?"
                  />
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Request Account Deletion
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will request deletion of your account. Your account will be deleted in 30 days unless you cancel the request. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRequestDeletion} className="bg-destructive">
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default UserSettings;

