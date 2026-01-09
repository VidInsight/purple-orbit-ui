import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveUsersTab } from '@/components/user-management/ActiveUsersTab';
import { PendingInvitationsTab } from '@/components/user-management/PendingInvitationsTab';
import { MyInvitationsTab } from '@/components/user-management/MyInvitationsTab';
import { InviteUserModal } from '@/components/user-management/InviteUserModal';
import { User, PendingInvitation, UserRole, InviteUserData } from '@/types/user';
import { UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getWorkspaceMembers, WorkspaceMember, inviteUserByEmail, getUserRoles } from '@/services/membersApi';
import { getUserIdFromToken, getUserData } from '@/utils/tokenUtils';
import { LoadingScreen } from '@/components/LoadingScreen';

// Map API role names to UserRole
const mapRoleNameToUserRole = (roleName: string): UserRole => {
  const normalized = roleName.toLowerCase();
  if (normalized === 'owner' || normalized === 'admin') {
    return 'admin';
  }
  if (normalized === 'editor') {
    return 'editor';
  }
  if (normalized === 'viewer') {
    return 'viewer';
  }
  // Default to viewer if role is unknown
  return 'viewer';
};

// Map API member to User type
const mapMemberToUser = (member: WorkspaceMember): User => {
  return {
    id: member.user_id,
    name: member.user_name,
    email: member.user_email,
    avatar: undefined,
    role: mapRoleNameToUserRole(member.role_name),
    lastActive: member.last_accessed_at,
    createdAt: member.joined_at,
  };
};

const UserManagement = () => {
  const { currentWorkspace } = useWorkspace();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = getUserIdFromToken();
  const currentUser = users.find((u) => u.id === currentUserId);
  const isAdmin = currentUser?.role === 'admin';
  
  // Get current user email from token or user data
  const userData = getUserData();
  const currentUserEmail = currentUser?.email || userData?.email || '';
  
  // Filter invitations for current user
  const myInvitations = invitations.filter((inv) => inv.email.toLowerCase() === currentUserEmail.toLowerCase());

  // Fetch workspace members from API
  useEffect(() => {
    const fetchMembers = async () => {
      if (!currentWorkspace?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getWorkspaceMembers(currentWorkspace.id);
        
        if (response.status === 'success' && response.data.members) {
          const mappedUsers = response.data.members.map(mapMemberToUser);
          setUsers(mappedUsers);
        } else {
          throw new Error(response.message || 'Failed to fetch members');
        }
      } catch (error) {
        console.error('Error fetching workspace members:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load workspace members',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [currentWorkspace?.id]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
    );

    toast({
      title: 'Role Updated',
      description: 'User role has been changed successfully.',
    });
  };

  const handleRemoveUser = async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const user = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    toast({
      title: 'User Removed',
      description: `${user?.name} has been removed from the workspace.`,
    });
  };

  const handleInviteSubmit = async (data: InviteUserData) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'No workspace selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Fetch roles to map role_id to role name
      const rolesResponse = await getUserRoles();
      const roles = rolesResponse.status === 'success' ? rolesResponse.data.items : [];
      const roleMap = new Map(roles.map(r => [r.id, r.name]));

      const invitationPromises = data.emails.map((email) =>
        inviteUserByEmail(currentWorkspace.id, {
          email,
          role_id: data.roleId,
          message: data.message || undefined,
        })
      );

      const responses = await Promise.allSettled(invitationPromises);
      
      const successfulInvitations: PendingInvitation[] = [];
      const failedEmails: string[] = [];

      responses.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const response = result.value;
          if (response.status === 'success' && response.data) {
            const roleName = roleMap.get(response.data.role_id) || 'editor';
            successfulInvitations.push({
              id: response.data.id,
              email: response.data.invitee_email,
              role: mapRoleNameToUserRole(roleName),
              invitedBy: currentUser?.name || 'Unknown',
              sentAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60000).toISOString(), // 7 days
            });
          }
        } else {
          failedEmails.push(data.emails[index]);
        }
      });

      if (successfulInvitations.length > 0) {
        setInvitations((prev) => [...successfulInvitations, ...prev]);
        setActiveTab('invitations');

        toast({
          title: 'Invitation Sent',
          description: `Sent ${successfulInvitations.length} invitation${
            successfulInvitations.length > 1 ? 's' : ''
          } successfully.${failedEmails.length > 0 ? ` Failed to send ${failedEmails.length} invitation(s).` : ''}`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send invitations. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitations',
        variant: 'destructive',
      });
    }
  };

  const handleResendInvitation = (invitationId: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? {
              ...inv,
              sentAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60000).toISOString(),
            }
          : inv
      )
    );

    toast({
      title: 'Invitation Resent',
      description: 'The invitation has been sent again.',
    });
  };

  const handleCancelInvitation = async (invitationId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const invitation = invitations.find((inv) => inv.id === invitationId);
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

    toast({
      title: 'Invitation Cancelled',
      description: `Invitation to ${invitation?.email} has been cancelled.`,
    });
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const invitation = invitations.find((inv) => inv.id === invitationId);
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

    toast({
      title: 'Invitation Accepted',
      description: `You have successfully joined the workspace.`,
    });
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const invitation = invitations.find((inv) => inv.id === invitationId);
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

    toast({
      title: 'Invitation Declined',
      description: `You have declined the workspace invitation.`,
    });
  };

  const existingEmails = [
    ...users.map((u) => u.email),
    ...invitations.map((inv) => inv.email),
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentWorkspace) {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-[1400px] px-6 py-8">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Please select a workspace first</p>
          </div>
        </div>
      </PageLayout>
    );
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
          <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-muted/50">
            <TabsTrigger value="users" className="text-sm">
              Active Users <span className="ml-1.5 text-xs text-muted-foreground">({users.length})</span>
            </TabsTrigger>
            <TabsTrigger value="my-invitations" className="text-sm">
              My Invitations <span className="ml-1.5 text-xs text-muted-foreground">({myInvitations.length})</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="text-sm">
              Pending <span className="ml-1.5 text-xs text-muted-foreground">({invitations.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <ActiveUsersTab
                users={users}
                currentUserId={currentUserId || ''}
                onRoleChange={handleRoleChange}
                onRemoveUser={handleRemoveUser}
              />
            </div>
          </TabsContent>

          <TabsContent value="my-invitations" className="mt-4">
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              {myInvitations.length > 0 ? (
                <MyInvitationsTab
                  invitations={myInvitations}
                  onAccept={handleAcceptInvitation}
                  onDecline={handleDeclineInvitation}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">No invitations found</p>
                </div>
              )}
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
