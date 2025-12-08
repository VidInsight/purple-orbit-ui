import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Plus, Loader2, Building2, Users, ArrowRight, Settings, LogOut, Sun, Moon } from 'lucide-react';
import type { Workspace } from '@/types/workspace';

const WorkspaceSelection = () => {
  const navigate = useNavigate();
  const { workspaces, setWorkspace, createWorkspace, isLoading } = useWorkspace();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  const ownedWorkspaces = workspaces.filter(ws => ws.role === 'owner');
  const joinedWorkspaces = workspaces.filter(ws => ws.role !== 'owner');

  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const generateSlug = (name: string): string => {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  };

  const handleWorkspaceSelect = async (workspace: Workspace) => {
    try {
      await setWorkspace(workspace.id);
      toast({ title: 'Workspace Selected', description: `Entering ${workspace.name}...` });
      setTimeout(() => navigate('/dashboard'), 500);
    } catch {
      toast({ title: 'Error', description: 'Failed to select workspace', variant: 'destructive' });
    }
  };

  const handleCreateWorkspace = async () => {
    if (!formData.name.trim()) return;
    setIsCreating(true);
    try {
      const newWorkspace = await createWorkspace(formData.name, formData.slug || generateSlug(formData.name), formData.description);
      setIsModalOpen(false);
      setFormData({ name: '', slug: '', description: '' });
      toast({ title: 'Workspace Created', description: `${newWorkspace.name} is ready to use.` });
      setTimeout(() => handleWorkspaceSelect(newWorkspace), 500);
    } catch {
      toast({ title: 'Error', description: 'Failed to create workspace.', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const userName = user ? `${user.name || ''} ${user.surname || ''}`.trim() || user.username || 'User' : 'User';
  const userEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl px-6 py-12 sm:py-16">
        {/* User Card */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(userName)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-foreground">{userName}</h2>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 px-3">
                  {theme === 'dark' ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
                  <span className="text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="h-8 px-3">
                  <Settings className="h-4 w-4 mr-1" />
                  <span className="text-xs">Settings</span>
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 px-3 text-destructive border border-destructive/30 hover:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-1" />
                <span className="text-xs">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Your Workspaces</h1>
            <p className="text-muted-foreground mt-1">Select a workspace to continue</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Workspace</span>
          </Button>
        </div>

        {/* Owned Workspaces */}
        {ownedWorkspaces.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Owned ({ownedWorkspaces.length})</h2>
            </div>
            <div className="space-y-3">
              {ownedWorkspaces.map(ws => (
                <WorkspaceCard key={ws.id} workspace={ws} onClick={handleWorkspaceSelect} />
              ))}
            </div>
          </div>
        )}

        {/* Joined Workspaces */}
        {joinedWorkspaces.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-success" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Joined ({joinedWorkspaces.length})</h2>
            </div>
            <div className="space-y-3">
              {joinedWorkspaces.map(ws => (
                <WorkspaceCard key={ws.id} workspace={ws} onClick={handleWorkspaceSelect} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {workspaces.length === 0 && (
          <div className="text-center py-20">
            <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Plus className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground mb-8">Create your first workspace to get started</p>
            <Button onClick={() => setIsModalOpen(true)} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Your First Workspace
            </Button>
          </div>
        )}
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="Workspace Name"
              placeholder="My Workspace"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
              disabled={isCreating}
            />
            <Input
              label="Slug"
              placeholder="my-workspace"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
              disabled={isCreating}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                placeholder="Describe your workspace..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isCreating}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isCreating}>Cancel</Button>
            <Button onClick={handleCreateWorkspace} loading={isCreating} disabled={!formData.name.trim() || isCreating}>
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const WorkspaceCard = ({ workspace, onClick }: { workspace: Workspace; onClick: (ws: Workspace) => void }) => {
  const getInitials = (name: string) => {
    return name.split(' ').filter(w => w).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'WS';
  };

  return (
    <button
      onClick={() => onClick(workspace)}
      className={cn(
        'group w-full px-5 py-4 rounded-lg border border-border bg-surface',
        'hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5',
        'transition-all duration-300 flex items-center gap-4',
        'focus:outline-none focus:ring-2 focus:ring-primary'
      )}
    >
      <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        <span className="text-lg font-bold text-primary-foreground">{getInitials(workspace.name)}</span>
      </div>
      <div className="flex-1 text-left min-w-0">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">{workspace.name}</h3>
        {workspace.description && <p className="text-sm text-muted-foreground truncate">{workspace.description}</p>}
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 group-hover:bg-primary/15 transition-colors">
        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Enter</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
};

export default WorkspaceSelection;
