import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';
import { UserCard } from '@/components/workspace/UserCard';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { CreateWorkspaceData } from '@/types/workspace';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WorkspaceSelection = () => {
  const navigate = useNavigate();
  const { workspaces, setWorkspace, createWorkspace, isLoading } = useWorkspace();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // User data from auth
  const currentUser = user
    ? {
        name: `${user.name || ''} ${user.surname || ''}`.trim() || user.username || 'User',
        email: user.email || '',
        role: 'User',
      }
    : null;

  // Separate workspaces into owned and joined
  const ownedWorkspaces = workspaces.filter(ws => ws.role === 'owner');
  const joinedWorkspaces = workspaces.filter(ws => ws.role !== 'owner');

  const handleWorkspaceSelect = async (workspace: { id: string; name: string }) => {
    try {
      await setWorkspace(workspace.id);
      toast({
        title: 'Workspace Selected',
        description: `Entering ${workspace.name}...`,
      });
      // Navigate to dashboard page
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Error selecting workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to select workspace',
        variant: 'destructive',
      });
    }
  };

  const handleCreateWorkspace = async (data: CreateWorkspaceData) => {
    setIsCreating(true);
    
    try {
      const newWorkspace = await createWorkspace(data.name, data.slug, data.description);
      setIsModalOpen(false);
      
      toast({
        title: 'Workspace Created',
        description: `${newWorkspace.name} is ready to use.`,
      });
      
      // Auto-select the new workspace
      setTimeout(() => {
        handleWorkspaceSelect(newWorkspace);
      }, 500);
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to create workspace. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        {/* User Card at Top - Enhanced spacing */}
        <div className="mb-12 sm:mb-16">
          <UserCard
            user={currentUser}
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

        {/* Empty State */}
        {workspaces.length === 0 && (
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
