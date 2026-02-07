import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';
import { UserCard } from '@/components/workspace/UserCard';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { Workspace, CreateWorkspaceData } from '@/types/workspace';
import { getWorkspaces, createWorkspace as createWorkspaceUtil, setCurrentWorkspace, saveWorkspaces } from '@/utils/workspaceStorage';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Crown, Users, LayoutDashboard, Mail, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getUserWorkspaces, createWorkspace as createWorkspaceApi, deleteWorkspace } from '@/services/workspaceApi';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useUser } from '@/context/UserContext';
import { getAccessToken, clearAllLocalStorage, getUserIdFromToken, getUserData } from '@/utils/tokenUtils';
import { MyInvitationsTab } from '@/components/user-management/MyInvitationsTab';
import { PendingInvitation, UserRole } from '@/types/user';
import { getUserPendingInvitations, PendingInvitationItem, acceptInvitation, declineInvitation } from '@/services/membersApi';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';

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

const WorkspaceSelection = () => {
  const navigate = useNavigate();
  const { refreshWorkspaces } = useWorkspace();
  const { currentUser } = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [activeTab, setActiveTab] = useState('workspaces');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate('/login');
    }
  }, [navigate]);

  // Separate workspaces into owned and joined
  const ownedWorkspaces = workspaces.filter(ws => ws.role === 'owner');
  const joinedWorkspaces = workspaces.filter(ws => ws.role !== 'owner');

  // Get current user email from token or user data
  const userData = getUserData();
  const currentUserEmail = currentUser?.email || userData?.email || '';
  
  // Filter invitations for current user (myInvitations are already filtered from API)
  const myInvitations = invitations;

  // Map API invitation to PendingInvitation type
  const mapApiInvitationToPendingInvitation = (apiInv: PendingInvitationItem): PendingInvitation => {
    // Calculate expiration date (7 days from creation)
    const createdAt = new Date(apiInv.created_at);
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      id: apiInv.id,
      email: currentUserEmail, // Current user's email
      role: mapRoleNameToUserRole(apiInv.role_name),
      invitedBy: apiInv.inviter_name,
      sentAt: apiInv.created_at,
      expiresAt: expiresAt.toISOString(),
      workspaceId: apiInv.workspace_id,
      workspaceName: apiInv.workspace_name,
      workspaceSlug: apiInv.workspace_slug,
      message: apiInv.message,
    };
  };

  useEffect(() => {
    loadWorkspaces();
    loadPendingInvitations();
  }, []);

  const loadPendingInvitations = async () => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) return;

      const response = await getUserPendingInvitations(userId);
      
      if (response.status === 'success' && response.data.pending_invitations) {
        const mappedInvitations = response.data.pending_invitations.map(mapApiInvitationToPendingInvitation);
        setInvitations(mappedInvitations);
      }
    } catch (error) {
      console.error('Error loading pending invitations:', error);
      // Don't show error toast for invitations, just log it
    }
  };

  const loadWorkspaces = async (): Promise<Workspace[]> => {
    try {
      setIsLoading(true);
      // getUserWorkspaces artık userId'yi token'dan otomatik alıyor
      const response = await getUserWorkspaces();

      // Map API response to Workspace type
      const mappedWorkspaces: Workspace[] = [];

      // Map owned workspaces
      if (response.data.owned_workspaces && Array.isArray(response.data.owned_workspaces)) {
        response.data.owned_workspaces.forEach((ws: any) => {
          mappedWorkspaces.push({
            id: ws.id || ws.workspace_id || `workspace-${Date.now()}`,
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

      // Map memberships (joined workspaces)
      if (response.data.memberships && Array.isArray(response.data.memberships)) {
        response.data.memberships.forEach((membership: any) => {
          const ws = membership.workspace || membership;
          mappedWorkspaces.push({
            id: ws.id || ws.workspace_id || `workspace-${Date.now()}`,
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

      // Sort by last accessed
      mappedWorkspaces.sort((a, b) => 
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      );

      // Save workspaces to localStorage so WorkspaceContext can access them
      saveWorkspaces(mappedWorkspaces);
      setWorkspaces(mappedWorkspaces);
      return mappedWorkspaces;
    } catch (error) {
      console.error('Error loading workspaces:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load workspaces',
        variant: 'destructive',
      });
      // Fallback to local storage if API fails
      const loadedWorkspaces = getWorkspaces();
      loadedWorkspaces.sort((a, b) => 
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      );
      setWorkspaces(loadedWorkspaces);
      return loadedWorkspaces;
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace.id);
    // Refresh WorkspaceContext to update current workspace
    refreshWorkspaces();
    toast({
      title: 'Workspace Selected',
      description: `Entering ${workspace.name}...`,
    });
    // Navigate to dashboard page
    navigate('/dashboard');
  };

  const handleCreateWorkspace = async (data: CreateWorkspaceData) => {
    setIsCreating(true);
    
    try {
      const requestData: { name: string; slug: string; description?: string } = {
        name: data.name,
        slug: data.slug,
      };
      
      // Only include description if it's not empty
      if (data.description && data.description.trim()) {
        requestData.description = data.description.trim();
      }

      const response = await createWorkspaceApi(requestData);

      toast({
        title: 'Workspace Created',
        description: response.message || `${data.name} is ready to use.`,
      });

      setIsModalOpen(false);
      
      // Reload workspaces to get the new one from API
      const updatedWorkspaces = await loadWorkspaces();
      
      // Find the newly created workspace by slug
      const newWorkspace = updatedWorkspaces.find(ws => ws.slug === data.slug);
      
      if (newWorkspace) {
        // Select and navigate to the new workspace
        handleWorkspaceSelect(newWorkspace);
      } else if (updatedWorkspaces.length > 0) {
        // If not found by slug, select the first workspace (should be the newest)
        handleWorkspaceSelect(updatedWorkspaces[0]);
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create workspace. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSettings = () => {
    toast({
      title: 'Settings',
      description: 'Opening user settings...',
    });
  };

  const handleLogout = () => {
    // Tüm localStorage verilerini temizle
    clearAllLocalStorage();
    
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });
    
    // Navigate to login page
    navigate('/');
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const invitation = invitations.find((inv) => inv.id === invitationId);
      
      await acceptInvitation(invitationId);
      
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

      toast({
        title: 'Invitation Accepted',
        description: invitation?.workspaceName 
          ? `You have successfully joined ${invitation.workspaceName}.`
          : `You have successfully joined the workspace.`,
      });

      // Reload workspaces after accepting invitation
      await loadWorkspaces();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept invitation',
        variant: 'destructive',
      });
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const invitation = invitations.find((inv) => inv.id === invitationId);
      
      await declineInvitation(invitationId);
      
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

      toast({
        title: 'Invitation Declined',
        description: `You have declined the workspace invitation.`,
      });
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to decline invitation',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWorkspace = (workspace: Workspace) => {
    setDeletingWorkspace(workspace);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteWorkspace = async () => {
    if (!deletingWorkspace) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteWorkspace(deletingWorkspace.id);
      
      toast({
        title: 'Workspace Deleted',
        description: `${deletingWorkspace.name} has been deleted successfully.`,
      });

      // Reload workspaces after deletion
      await loadWorkspaces();
      setIsDeleteModalOpen(false);
      setDeletingWorkspace(null);
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete workspace',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background transition-colors duration-200 relative overflow-hidden">
      {/* Animated background: floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,hsl(var(--primary)/0.12),transparent_50%)]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black_40%,transparent_100%)]" />
        <div className="absolute top-1/5 left-1/4 w-[420px] h-[420px] rounded-full bg-primary/[0.08] blur-[100px] animate-orb-float-1" />
        <div className="absolute bottom-1/4 right-1/3 w-[320px] h-[320px] rounded-full bg-primary/[0.07] blur-[90px] animate-orb-float-2" />
        <div className="absolute top-1/2 right-1/4 w-[280px] h-[280px] rounded-full bg-primary/[0.05] blur-[80px] animate-orb-float-3" />
        <div className="absolute bottom-1/3 left-1/3 w-[200px] h-[200px] rounded-full bg-primary/[0.06] blur-[70px] animate-orb-float-1" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-16">
        {/* User card - full width at top */}
        <div className="mb-10 sm:mb-12 animate-fade-in-up">
          <div className="glass rounded-2xl p-1 shadow-lg shadow-primary/5 border-primary/10 tech-glow-line">
            <UserCard
              onSettings={handleSettings}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* Header + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 tech-glow-line">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Workspace</p>
                <p className="text-sm font-semibold text-foreground">Select workspace</p>
              </div>
            </div>
            <div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                Workspaces
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md">Choose a workspace to continue or create a new one.</p>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            className="w-full sm:w-auto shrink-0 shadow-lg shadow-primary/20 hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        </div>

        {/* Tabs - tech underline style */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 h-12 p-1 rounded-xl bg-muted/40 border border-border/50 backdrop-blur-sm">
            <TabsTrigger
              value="workspaces"
              className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border transition-all duration-200"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Workspaces <span className="ml-1 text-xs opacity-80">({workspaces.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-invitations"
              className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border transition-all duration-200"
            >
              <Mail className="h-4 w-4 mr-2" />
              Invitations <span className="ml-1 text-xs opacity-80">({myInvitations.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspaces" className="mt-8 animate-fade-in">
            {/* Owned Workspaces Section */}
            {ownedWorkspaces.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-px flex-1 max-w-12 bg-gradient-to-r from-amber-500/50 to-transparent rounded-full" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/25 tech-glow-line">
                      <Crown className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Owned</h2>
                      <span className="text-xs text-muted-foreground">{ownedWorkspaces.length} workspace{ownedWorkspaces.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-amber-500/30 to-transparent rounded-full" />
                </div>
                <div className="space-y-3">
                  {ownedWorkspaces.map((workspace) => (
                    <WorkspaceCard
                      key={workspace.id}
                      workspace={workspace}
                      onClick={handleWorkspaceSelect}
                      onDelete={handleDeleteWorkspace}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Joined Workspaces Section */}
            {joinedWorkspaces.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-px flex-1 max-w-12 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/25 tech-glow-line">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Member</h2>
                      <span className="text-xs text-muted-foreground">{joinedWorkspaces.length} workspace{joinedWorkspaces.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent rounded-full" />
                </div>
                <div className="space-y-3">
                  {joinedWorkspaces.map((workspace) => (
                    <WorkspaceCard
                      key={workspace.id}
                      workspace={workspace}
                      onClick={handleWorkspaceSelect}
                      onDelete={handleDeleteWorkspace}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl border-2 border-primary/30 border-t-primary animate-spin" />
                  <div className="absolute inset-0 h-12 w-12 rounded-xl bg-primary/5 animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground mt-4 font-medium">Loading workspaces...</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Syncing your teams</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && workspaces.length === 0 && (
              <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] p-12 sm:p-16 text-center tech-glow-line">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                  <Plus className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No workspaces yet</h3>
                <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">Create your first workspace to collaborate and automate workflows.</p>
                <Button onClick={() => setIsModalOpen(true)} size="lg" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-glow-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create workspace
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-invitations" className="mt-8 animate-fade-in">
            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm tech-glow-line">
              {myInvitations.length > 0 ? (
                <MyInvitationsTab
                  invitations={myInvitations}
                  onAccept={handleAcceptInvitation}
                  onDecline={handleDeclineInvitation}
                />
              ) : (
                <div className="text-center py-16 px-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 border border-border/50 mb-4">
                    <Mail className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No pending invitations</p>
                  <p className="text-xs text-muted-foreground">Invitations will appear here when someone invites you.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center pt-8 mt-8 border-t border-border/50 animate-fade-in">
          <p className="text-xs text-muted-foreground">
            <a href="#" className="text-primary/90 hover:text-primary font-medium transition-colors">Docs</a>
            <span className="mx-2 opacity-50">·</span>
            <a href="#" className="text-primary/90 hover:text-primary font-medium transition-colors">Support</a>
          </p>
        </div>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateWorkspace}
        isCreating={isCreating}
      />

      {/* Delete Workspace Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingWorkspace(null);
        }}
        onConfirm={confirmDeleteWorkspace}
        itemName={deletingWorkspace?.name || ''}
        itemType="workspace"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default WorkspaceSelection;
