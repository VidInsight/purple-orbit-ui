import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';
import { UserCard } from '@/components/workspace/UserCard';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { Workspace, CreateWorkspaceData } from '@/types/workspace';
import { getWorkspaces, createWorkspace as createWorkspaceUtil, setCurrentWorkspace, saveWorkspaces } from '@/utils/workspaceStorage';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getUserWorkspaces, createWorkspace as createWorkspaceApi } from '@/services/workspaceApi';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useUser } from '@/context/UserContext';
import { getAccessToken, clearAllLocalStorage } from '@/utils/tokenUtils';

const WorkspaceSelection = () => {
  const navigate = useNavigate();
  const { refreshWorkspaces } = useWorkspace();
  const { currentUser } = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate('/login');
    }
  }, [navigate]);

  // Map User type to UserCard format
  const userCardData = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
  } : {
    name: 'User',
    email: '',
    role: 'User',
  };

  // Separate workspaces into owned and joined
  const ownedWorkspaces = workspaces.filter(ws => ws.role === 'owner');
  const joinedWorkspaces = workspaces.filter(ws => ws.role !== 'owner');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      // getUserWorkspaces artık userId'yi token'dan otomatik alıyor
      const response = await getUserWorkspaces();
      console.log('Workspaces API response:', response);

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

      console.log('Sending workspace creation request:', requestData);
      
      const response = await createWorkspaceApi(requestData);

      console.log('Workspace created:', response);

      toast({
        title: 'Workspace Created',
        description: response.message || `${data.name} is ready to use.`,
      });

      setIsModalOpen(false);
      
      // Reload workspaces to get the new one from API
      await loadWorkspaces();
      
      // Wait a bit for state to update, then find and select the new workspace
      setTimeout(() => {
        // Find workspace by slug in the updated state
        const newWorkspace = workspaces.find(ws => ws.slug === data.slug);
        if (newWorkspace) {
          handleWorkspaceSelect(newWorkspace);
        } else if (workspaces.length > 0) {
          // If not found by slug, select the first workspace (should be the newest)
          handleWorkspaceSelect(workspaces[0]);
        }
      }, 500);
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
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        {/* User Card at Top - Enhanced spacing */}
        <div className="mb-12 sm:mb-16">
          <UserCard
            user={userCardData}
            onSettings={handleSettings}
            onLogout={handleLogout}
          />
        </div>

        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Workspaces</h1>
            <p className="text-sm text-muted-foreground mt-1">Select a workspace to continue</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-border hover:border-primary transition-all duration-200 hover:bg-surface/50"
          >
            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
              New Workspace
            </span>
          </button>
        </div>

        {/* Owned Workspaces Section */}
        {ownedWorkspaces.length > 0 && (
          <div className="mb-10">
...
            <div className="space-y-2">
              {ownedWorkspaces.map((workspace, index) => (
                <div
                  key={workspace.id}
                >
                  <WorkspaceCard
                    workspace={workspace}
                    onClick={handleWorkspaceSelect}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Joined Workspaces Section */}
        {joinedWorkspaces.length > 0 && (
          <div className="mb-10">
...
            <div className="space-y-2">
              {joinedWorkspaces.map((workspace, index) => (
                <div
                  key={workspace.id}
                >
                  <WorkspaceCard
                    workspace={workspace}
                    onClick={handleWorkspaceSelect}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading workspaces...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && workspaces.length === 0 && (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No workspaces yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Create your first workspace to get started</p>
            <Button onClick={() => setIsModalOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workspace
            </Button>
          </div>
        )}

        {/* Footer Info - Better spacing and typography */}
        <div className="text-center pt-10 mt-10 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Need help?{' '}
            <a href="#" className="text-primary hover:text-accent font-medium transition-colors inline-flex items-center gap-1">
              View documentation
            </a>
            {' '}or{' '}
            <a href="#" className="text-primary hover:text-accent font-medium transition-colors inline-flex items-center gap-1">
              contact support
            </a>
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
    </div>
  );
};

export default WorkspaceSelection;
