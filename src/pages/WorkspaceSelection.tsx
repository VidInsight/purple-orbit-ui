import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';
import { UserCard } from '@/components/workspace/UserCard';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { Workspace, CreateWorkspaceData } from '@/types/workspace';
import { getWorkspaces, createWorkspace as createWorkspaceUtil, setCurrentWorkspace } from '@/utils/workspaceStorage';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const WorkspaceSelection = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Mock user data - in real app this would come from auth
  const currentUser = {
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'Admin',
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = () => {
    const loadedWorkspaces = getWorkspaces();
    // Sort by last accessed
    loadedWorkspaces.sort((a, b) => 
      new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    );
    setWorkspaces(loadedWorkspaces);
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace.id);
    toast({
      title: 'Workspace Selected',
      description: `Entering ${workspace.name}...`,
    });
    // Navigate to dashboard page
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const handleCreateWorkspace = async (data: CreateWorkspaceData) => {
    setIsCreating(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    try {
      const newWorkspace = createWorkspaceUtil(data.name, data.description);
      loadWorkspaces();
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
    toast({
      title: 'Settings',
      description: 'Opening user settings...',
    });
  };

  const handleLogout = () => {
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Main Content */}
      <div className="container mx-auto max-w-3xl px-6 py-8">
        {/* User Card at Top */}
        <div className="mb-8 animate-fade-in">
          <UserCard
            user={currentUser}
            onSettings={handleSettings}
            onLogout={handleLogout}
          />
        </div>

        {/* Divider with WORKSPACES Label */}
        <div className="relative mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm font-semibold text-muted-foreground tracking-wider">
              WORKSPACES
            </span>
          </div>
        </div>

        {/* Workspaces Stacked Vertically */}
        <div className="space-y-4 mb-6">
          {workspaces.map((workspace, index) => (
            <div
              key={workspace.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.15 + index * 0.05}s` }}
            >
              <WorkspaceCard
                workspace={workspace}
                onClick={handleWorkspaceSelect}
              />
            </div>
          ))}

          {/* Create New Workspace Card */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: `${0.15 + workspaces.length * 0.05}s` }}
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className={cn(
                'group relative w-full p-6 rounded-lg border-2 border-dashed border-border bg-surface/50',
                'hover:border-primary hover:bg-surface hover:shadow-lg transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'min-h-[140px] flex flex-col items-center justify-center'
              )}
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                Create New Workspace
              </h3>
              <p className="text-sm text-muted-foreground">
                Start fresh with a new workspace
              </p>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center pt-6 border-t border-border animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-xs text-muted-foreground">
            Need help? Check out our{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              documentation
            </a>
            {' '}or{' '}
            <a href="#" className="text-primary hover:underline font-medium">
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
