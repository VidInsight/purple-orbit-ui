import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveUsersTab } from '@/components/user-management/ActiveUsersTab';
import { PendingInvitationsTab } from '@/components/user-management/PendingInvitationsTab';
import { InviteUserModal } from '@/components/user-management/InviteUserModal';
import { User, PendingInvitation, UserRole, InviteUserData } from '@/types/user';
import { UserPlus, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getWorkspaceMembers, WorkspaceMember, inviteUserByEmail, getUserRoles, leaveWorkspace, removeWorkspaceMember } from '@/services/membersApi';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import { LoadingScreen } from '@/components/LoadingScreen';
import { getUserWorkspaces } from '@/services/workspaceApi';
import { saveWorkspaces } from '@/utils/workspaceStorage';

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
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const currentUserId = getUserIdFromToken();
  const currentUser = users.find((u) => u.id === currentUserId);
  const isAdmin = currentUser?.role === 'admin';
  const isOwner = currentWorkspace?.role === 'owner';

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
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'No workspace selected',
        variant: 'destructive',
      });
      return;
    }

    const user = users.find((u) => u.id === userId);
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      await removeWorkspaceMember(currentWorkspace.id, userId);
      
      // Remove user from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      toast({
        title: 'User Removed',
        description: `${user.name} has been removed from the workspace.`,
      });
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove user from workspace',
        variant: 'destructive',
      });
      throw error; // Re-throw so ActiveUsersTab can handle it
    }
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

  const handleLeaveWorkspace = async () => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'No workspace selected',
        variant: 'destructive',
      });
      return;
    }

    if (isOwner) {
      toast({
        title: 'Error',
        description: 'Workspace owners cannot leave their workspace. Please transfer ownership first.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Are you sure you want to leave "${currentWorkspace.name}"? You will need to be invited again to rejoin.`)) {
      return;
    }

    try {
      setIsLeaving(true);
      await leaveWorkspace(currentWorkspace.id);

      // Refresh workspace list
      try {
        const response = await getUserWorkspaces();
        const mappedWorkspaces: any[] = [];

        if (response.data.owned_workspaces && Array.isArray(response.data.owned_workspaces)) {
          response.data.owned_workspaces.forEach((ws: any) => {
            mappedWorkspaces.push({
              id: ws.id || ws.workspace_id,
              name: ws.name || ws.workspace_name || 'Unnamed Workspace',
              slug: ws.slug || ws.workspace_slug || ws.name?.toLowerCase().replace(/\s+/g, '-') || 'workspace',
              description: ws.description || ws.workspace_description,
              icon: ws.icon || ws.workspace_icon,
              memberCount: ws.member_count || ws.memberCount || 0,
              lastAccessed: ws.last_accessed || ws.lastAccessed || new Date().toISOString(),
              createdAt: ws.created_at || ws.createdAt || new Date().toISOString(),
              role: 'owner',
              member_limit: ws.member_limit || 5,
              current_member_count: ws.current_member_count || ws.memberCount || 0,
              workflow_limit: ws.workflow_limit || 50,
              current_workflow_count: ws.current_workflow_count || 0,
              custom_script_limit: ws.custom_script_limit || 25,
              current_custom_script_count: ws.current_custom_script_count || 0,
              storage_limit_mb: ws.storage_limit_mb || 10240,
              current_storage_mb: ws.current_storage_mb || 0,
              api_key_limit: ws.api_key_limit || 10,
              current_api_key_count: ws.current_api_key_count || 0,
              monthly_execution_limit: ws.monthly_execution_limit || 10000,
              current_month_executions: ws.current_month_executions || 0,
              monthly_concurrent_executions: ws.monthly_concurrent_executions || 5,
              current_month_concurrent_executions: ws.current_month_concurrent_executions || 0,
              current_period_start: ws.current_period_start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
              current_period_end: ws.current_period_end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
            });
          });
        }

        if (response.data.memberships && Array.isArray(response.data.memberships)) {
          response.data.memberships.forEach((membership: any) => {
            const ws = membership.workspace || membership;
            mappedWorkspaces.push({
              id: ws.id || ws.workspace_id,
              name: ws.name || ws.workspace_name || 'Unnamed Workspace',
              slug: ws.slug || ws.workspace_slug || ws.name?.toLowerCase().replace(/\s+/g, '-') || 'workspace',
              description: ws.description || ws.workspace_description,
              icon: ws.icon || ws.workspace_icon,
              memberCount: ws.member_count || ws.memberCount || 0,
              lastAccessed: ws.last_accessed || ws.lastAccessed || new Date().toISOString(),
              createdAt: ws.created_at || ws.createdAt || new Date().toISOString(),
              role: membership.role || 'viewer',
              member_limit: ws.member_limit || 5,
              current_member_count: ws.current_member_count || ws.memberCount || 0,
              workflow_limit: ws.workflow_limit || 50,
              current_workflow_count: ws.current_workflow_count || 0,
              custom_script_limit: ws.custom_script_limit || 25,
              current_custom_script_count: ws.current_custom_script_count || 0,
              storage_limit_mb: ws.storage_limit_mb || 10240,
              current_storage_mb: ws.current_storage_mb || 0,
              api_key_limit: ws.api_key_limit || 10,
              current_api_key_count: ws.current_api_key_count || 0,
              monthly_execution_limit: ws.monthly_execution_limit || 10000,
              current_month_executions: ws.current_month_executions || 0,
              monthly_concurrent_executions: ws.monthly_concurrent_executions || 5,
              current_month_concurrent_executions: ws.current_month_concurrent_executions || 0,
              current_period_start: ws.current_period_start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
              current_period_end: ws.current_period_end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
            });
          });
        }

        mappedWorkspaces.sort((a, b) => 
          new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
        );

        saveWorkspaces(mappedWorkspaces);
        refreshWorkspaces();
      } catch (error) {
        console.error('Error refreshing workspaces:', error);
      }

      toast({
        title: 'Left Workspace',
        description: `You have successfully left "${currentWorkspace.name}".`,
      });

      // Navigate to workspace selection
      navigate('/');
    } catch (error) {
      console.error('Error leaving workspace:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to leave workspace',
        variant: 'destructive',
      });
    } finally {
      setIsLeaving(false);
    }
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
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Please select a workspace first</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <PageHeader
          title="User Management"
          description="Manage workspace members and permissions"
          actions={
            <div className="flex gap-2">
              {isAdmin && (
                <Button variant="primary" onClick={() => setInviteModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Users
                </Button>
              )}
              {!isOwner && (
                <Button 
                  variant="outline" 
                  onClick={handleLeaveWorkspace}
                  disabled={isLeaving}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLeaving ? 'Leaving...' : 'Leave Workspace'}
                </Button>
              )}
            </div>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-2 bg-muted/50">
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
                currentUserId={currentUserId || ''}
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
