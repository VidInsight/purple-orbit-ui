import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCard } from '@/components/workspace/WorkspaceCard';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { Workspace, CreateWorkspaceData } from '@/types/workspace';
import { getWorkspaces, createWorkspace as createWorkspaceUtil, setCurrentWorkspace } from '@/utils/workspaceStorage';
import { Button } from '@/components/ui/Button';
import { Workflow, Plus, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/context/ThemeContext';

const WorkspaceSelection = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-6">
            <Workflow className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Select a Workspace
          </h1>
          <p className="text-muted-foreground">
            Choose a workspace to continue or create a new one
          </p>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onClick={handleWorkspaceSelect}
            />
          ))}

          {/* Create New Workspace Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              'group relative w-full p-6 rounded-lg border-2 border-dashed border-border bg-surface/50',
              'hover:border-primary hover:bg-surface hover:shadow-lg hover:scale-[1.02]',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'min-h-[200px] flex flex-col items-center justify-center'
            )}
          >
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              Create Workspace
            </h3>
            <p className="text-sm text-muted-foreground">
              Start a new workspace
            </p>
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Check out our{' '}
            <a href="#" className="text-primary hover:underline">
              documentation
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
