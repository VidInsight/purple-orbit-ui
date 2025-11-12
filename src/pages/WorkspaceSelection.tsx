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
      <div className="container mx-auto max-w-4xl px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        {/* User Card at Top - Enhanced spacing */}
        <div className="mb-12 sm:mb-16 animate-fade-in">
          <UserCard
            user={currentUser}
            onSettings={handleSettings}
            onLogout={handleLogout}
          />
        </div>

        {/* Divider with WORKSPACES Label - Better visual weight */}
        <div className="relative mb-10 sm:mb-14 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-6 py-1 text-xs font-bold text-muted-foreground tracking-[0.2em] uppercase">
              Workspaces
            </span>
          </div>
        </div>

        {/* Workspaces Stacked Vertically - Improved spacing */}
        <div className="space-y-3 mb-10">
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

          {/* Create New Workspace Card - Refined design */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: `${0.15 + workspaces.length * 0.05}s` }}
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className={cn(
                'group relative w-full p-5 rounded-lg border-2 border-dashed border-border bg-surface/30',
                'hover:border-primary hover:bg-surface/50 hover:shadow-md transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'flex items-center justify-center gap-3'
              )}
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  Create New Workspace
                </h3>
                <p className="text-xs text-muted-foreground">
                  Start fresh with a new workspace
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Info - Better spacing and typography */}
        <div className="text-center pt-10 mt-10 border-t border-border animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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
