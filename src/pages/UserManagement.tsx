import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveUsersTab } from '@/components/user-management/ActiveUsersTab';
import { PendingInvitationsTab } from '@/components/user-management/PendingInvitationsTab';
import { InviteUserModal } from '@/components/user-management/InviteUserModal';
import { User, PendingInvitation, UserRole, InviteUserData } from '@/types/user';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { WorkspaceMember, Invitation, CreateInvitationRequest } from '@/types/api';

// Role mapping: Frontend role -> Backend role_id (bu mapping backend'den alınabilir)
const ROLE_ID_MAP: Record<UserRole, string> = {
  admin: 'ROL-ADMIN', // Bu değerler backend'den alınmalı
  editor: 'ROL-EDITOR',
  viewer: 'ROL-VIEWER',
};

const ROLE_NAME_MAP: Record<string, UserRole> = {
  'OWNER': 'admin',
  'MEMBER': 'editor',
  'EDITOR': 'editor',
  'VIEWER': 'viewer',
};

const UserManagement = () => {
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const { user: currentAuthUser, getToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = users.find((u) => u.id === currentAuthUser?.id);
  const isAdmin = currentUser?.role === 'admin' || currentWorkspace?.role === 'owner';

  useEffect(() => {
    if (currentWorkspace) {
      loadMembers();
      loadInvitations();
    }
  }, [currentWorkspace]);

  const loadMembers = async () => {
    if (!currentWorkspace) return;

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) return;

      const response = await apiClient.get<{ members: WorkspaceMember[]; total: number }>(
        API_ENDPOINTS.workspaceMember.list(currentWorkspace.id),
        { token }
      );

      // API member'ları app User type'ına dönüştür
      const mappedUsers: User[] = response.data.members.map((member) => ({
        id: member.user_id,
        name: member.user.username, // API'den name gelmiyorsa username kullan
        email: member.user.email,
        avatar: undefined,
        role: ROLE_NAME_MAP[member.role_name] || 'viewer',
        lastActive: new Date().toISOString(), // API'den gelmiyorsa şimdilik
        createdAt: new Date().toISOString(),
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error loading members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workspace members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvitations = async () => {
    if (!currentWorkspace) return;

    try {
      const token = getToken();
      if (!token) return;

      const response = await apiClient.get<{ items: Invitation[] }>(
        API_ENDPOINTS.workspaceInvitation.list(currentWorkspace.id),
        { token }
      );

      // Sadece pending invitation'ları göster
      const pendingInvitations = response.data.items
        .filter((inv) => inv.status === 'PENDING')
        .map((inv) => ({
          id: inv.id,
          email: inv.user_id || 'Unknown', // API'den email gelmiyorsa user_id kullan
          role: 'editor' as UserRole, // role_id'den map edilmeli
          invitedBy: currentAuthUser?.name || 'Unknown',
          sentAt: inv.created_at,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
        }));

      setInvitations(pendingInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!currentWorkspace) return;

    try {
      const token = getToken();
      if (!token) return;

      // Member'ı bul
      const member = users.find((u) => u.id === userId);
      if (!member) return;

      // Member ID'yi bulmak için members listesini tekrar yükle veya state'te tut
      const membersResponse = await apiClient.get<{ members: WorkspaceMember[] }>(
        API_ENDPOINTS.workspaceMember.list(currentWorkspace.id),
        { token }
      );

      const workspaceMember = membersResponse.data.members.find((m) => m.user_id === userId);
      if (!workspaceMember) return;

      // Role ID'yi al (backend'den role mapping alınmalı, şimdilik hardcode)
      const roleId = ROLE_ID_MAP[newRole];

      await apiClient.put(
        API_ENDPOINTS.workspaceMember.updateRole(currentWorkspace.id, workspaceMember.id),
        { role_id: roleId },
        { token }
      );

      // Local state'i güncelle
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );

      toast({
        title: 'Role Updated',
        description: 'User role has been changed successfully.',
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!currentWorkspace) return;

    try {
      const token = getToken();
      if (!token) return;

      const user = users.find((u) => u.id === userId);
      
      await apiClient.delete(
        API_ENDPOINTS.workspaceMember.remove(currentWorkspace.id, userId),
        { token }
      );

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      await refreshWorkspaces(); // Workspace limits'i güncelle

      toast({
        title: 'User Removed',
        description: `${user?.name} has been removed from the workspace.`,
      });
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove user',
        variant: 'destructive',
      });
    }
  };

  const handleInviteSubmit = async (data: InviteUserData) => {
    if (!currentWorkspace) return;

    try {
      const token = getToken();
      if (!token) return;

      // Not: API user_id gerektiriyor
      // Backend'de email ile user bulunup invitation oluşturulmalı
      // Şimdilik email'i user_id olarak gönderiyoruz
      // Backend'de email ile user arama yapılıp user_id bulunmalı
      
      const roleId = ROLE_ID_MAP[data.role];
      
      // Her email için invitation oluştur
      // TODO: Backend'de email ile user bulma endpoint'i eklenmeli
      // veya invitation endpoint'i email'i de kabul etmeli
      const invitationPromises = data.emails.map(async (email) => {
        // Backend'de email ile user bulunup invitation oluşturulmalı
        // Şimdilik email'i user_id olarak gönderiyoruz (backend'de handle edilmeli)
        const request: CreateInvitationRequest = {
          user_id: email, // Backend'de email ile user bulunmalı veya email field'ı eklenmeli
          role_id: roleId,
          message: data.message,
        };

        return apiClient.post<Invitation>(
          API_ENDPOINTS.workspaceInvitation.create(currentWorkspace.id),
          request,
          { token }
        );
      });

      await Promise.all(invitationPromises);

      // Invitations'ı yenile
      await loadInvitations();
      setActiveTab('invitations');

      toast({
        title: 'Invitation Sent',
        description: `Sent ${data.emails.length} invitation${
          data.emails.length > 1 ? 's' : ''
        } successfully.`,
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    // Resend endpoint'i yok, yeni invitation oluşturulmalı veya backend'de resend endpoint'i eklenmeli
    toast({
      title: 'Info',
      description: 'Resend functionality will be available soon.',
    });
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const token = getToken();
      if (!token) return;

      const invitation = invitations.find((inv) => inv.id === invitationId);

      await apiClient.delete(
        API_ENDPOINTS.workspaceInvitation.cancel(invitationId),
        { token }
      );

      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

      toast({
        title: 'Invitation Cancelled',
        description: `Invitation to ${invitation?.email} has been cancelled.`,
      });
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        variant: 'destructive',
      });
    }
  };

  const existingEmails = [
    ...users.map((u) => u.email),
    ...invitations.map((inv) => inv.email),
  ];

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

  if (!currentWorkspace) {
    return null;
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="User Management"
          description="Manage workspace members and permissions"
          actions={
            isAdmin ? (
              <Button variant="primary" onClick={() => setInviteModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Users
              </Button>
            ) : undefined
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
            <TabsTrigger value="users" className="text-sm">
              Active Users <span className="ml-1.5 text-xs text-muted-foreground">({users.length})</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="text-sm">
              Pending <span className="ml-1.5 text-xs text-muted-foreground">({invitations.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <ActiveUsersTab
                users={users}
                currentUserId={currentAuthUser?.id || ''}
                onRoleChange={handleRoleChange}
                onRemoveUser={handleRemoveUser}
              />
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="mt-4">
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <PendingInvitationsTab
                invitations={invitations}
                onResend={handleResendInvitation}
                onCancel={handleCancelInvitation}
              />
            </div>
          </TabsContent>
        </Tabs>

        {isAdmin && (
          <InviteUserModal
            isOpen={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            onSubmit={handleInviteSubmit}
            existingEmails={existingEmails}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default UserManagement;
