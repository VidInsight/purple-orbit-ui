import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';
import { UserCard } from '@/components/workspace/UserCard';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { CreateWorkspaceData } from '@/types/workspace';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2, Building2, Users } from 'lucide-react';
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
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        {/* User Card at Top */}
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Your Workspaces</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Select a workspace to continue</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Workspace</span>
          </Button>
        </div>

        {/* Owned Workspaces Section */}
        {ownedWorkspaces.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Owned Workspaces
              </h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {ownedWorkspaces.length}
              </span>
            </div>
            <div className="space-y-3">
              {ownedWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onClick={handleWorkspaceSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Joined Workspaces Section */}
        {joinedWorkspaces.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-success" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Joined Workspaces
              </h2>
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                {joinedWorkspaces.length}
              </span>
            </div>
            <div className="space-y-3">
              {joinedWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onClick={handleWorkspaceSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {workspaces.length === 0 && (
          <div className="text-center py-20">
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/25">
                <Plus className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Create your first workspace to start building automation workflows
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)} 
              size="lg"
              className="gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              Create Your First Workspace
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center pt-10 mt-10 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Need help?{' '}
            <a href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
              View documentation
            </a>
            {' '}or{' '}
            <a href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
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