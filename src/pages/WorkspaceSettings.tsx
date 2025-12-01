import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useWorkspace } from '@/context/WorkspaceContext';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  HelpCircle, 
  Ticket, 
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  Trash2,
  Loader2
} from 'lucide-react';

const WorkspaceSettings = () => {
  const navigate = useNavigate();
  const { currentWorkspace, updateWorkspace, deleteWorkspace, refreshWorkspaces } = useWorkspace();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    if (currentWorkspace) {
      setFormData({
        name: currentWorkspace.name,
        slug: currentWorkspace.slug,
        description: currentWorkspace.description || '',
      });
    }
  }, [currentWorkspace]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData({
      ...formData,
      name: newName,
      slug: generateSlug(newName),
    });
  };

  const handleSave = async () => {
    if (!currentWorkspace) return;

    try {
      setIsSaving(true);
      await updateWorkspace(currentWorkspace.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      });
      
      toast({
        title: 'Settings Saved',
        description: 'Workspace settings have been updated successfully.',
      });
      
      await refreshWorkspaces();
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workspace settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentWorkspace) return;

    try {
      setIsDeleting(true);
      await deleteWorkspace(currentWorkspace.id);
      
      toast({
        title: 'Workspace Deleted',
        description: 'The workspace has been deleted successfully.',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workspace',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpgrade = () => {
    toast({
      title: 'Upgrade Plan',
      description: 'Redirecting to upgrade options...',
    });
  };

  const handleDowngrade = () => {
    toast({
      title: 'Downgrade Plan',
      description: 'Redirecting to downgrade options...',
    });
  };

  const handleGetHelp = () => {
    window.open('https://docs.example.com/help', '_blank');
  };

  const handleCreateTicket = () => {
    toast({
      title: 'Create Support Ticket',
      description: 'Opening support ticket form...',
    });
  };

  const handleViewDocs = () => {
    window.open('https://docs.example.com', '_blank');
  };

  const handleWatchVideos = () => {
    window.open('https://www.youtube.com/example', '_blank');
  };

  const handleLiveChat = () => {
    toast({
      title: 'Live Chat',
      description: 'Connecting to support chat...',
    });
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@example.com';
  };

  if (!currentWorkspace) {
    return null;
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workspace Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your workspace configuration and subscription plan
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Separator />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Workspace Information */}
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Workspace Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Update your workspace details and identifier
                  </p>
                </div>

                <Separator />

                <div className="space-y-5">
                  <Input
                    label="Workspace Name"
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="My Workspace"
                  />

                  <Input
                    label="Workspace Slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    placeholder="my-workspace"
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your workspace..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={isSaving}
                    className="h-12"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>

            {/* Workspace Limits & Quota */}
            {currentWorkspace && (
              <Card className="p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      Workspace Limits & Usage
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Current usage and limits for this workspace
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-medium">
                          {currentWorkspace.current_member_count} / {currentWorkspace.member_limit}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min((currentWorkspace.current_member_count / currentWorkspace.member_limit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Workflows</span>
                        <span className="font-medium">
                          {currentWorkspace.current_workflow_count} / {currentWorkspace.workflow_limit}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min((currentWorkspace.current_workflow_count / currentWorkspace.workflow_limit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Storage</span>
                        <span className="font-medium">
                          {(currentWorkspace.current_storage_mb / 1024).toFixed(2)} GB / {(currentWorkspace.storage_limit_mb / 1024).toFixed(2)} GB
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min((currentWorkspace.current_storage_mb / currentWorkspace.storage_limit_mb) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">API Keys</span>
                        <span className="font-medium">
                          {currentWorkspace.current_api_key_count} / {currentWorkspace.api_key_limit}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min((currentWorkspace.current_api_key_count / currentWorkspace.api_key_limit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Executions</span>
                        <span className="font-medium">
                          {currentWorkspace.current_month_executions} / {currentWorkspace.monthly_execution_limit}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min((currentWorkspace.current_month_executions / currentWorkspace.monthly_execution_limit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Current Plan & Actions */}
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      Subscription Plan
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your plan and billing
                    </p>
                  </div>
                  <Badge variant="default" className="text-sm px-4 py-1.5">
                    {currentWorkspace?.plan_name || 'Freemium'}
                  </Badge>
                </div>

                <Separator />

                {/* Plan Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="primary"
                    onClick={handleUpgrade}
                    className="h-12"
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleDowngrade}
                    className="h-12"
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Downgrade Plan
                  </Button>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            {currentWorkspace?.role === 'owner' && (
              <Card className="p-8 border-destructive">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-destructive mb-1">
                      Danger Zone
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Irreversible and destructive actions
                    </p>
                  </div>

                  <Separator />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="h-12">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Workspace
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the workspace and all its data. This action cannot be undone.
                          All workflows, executions, files, and other workspace data will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Yes, delete workspace'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Support & Help */}
          <div className="lg:col-span-1">
            <Card className="p-8 sticky top-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Support & Help
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Get assistance and access resources
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    className="w-full justify-start h-12"
                    onClick={handleGetHelp}
                  >
                    <HelpCircle className="h-5 w-5 mr-3" />
                    Get Help
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-start h-12"
                    onClick={handleCreateTicket}
                  >
                    <Ticket className="h-5 w-5 mr-3" />
                    Create Support Ticket
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-start h-12"
                    onClick={handleViewDocs}
                  >
                    <BookOpen className="h-5 w-5 mr-3" />
                    Documentation
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-start h-12"
                    onClick={handleWatchVideos}
                  >
                    <Video className="h-5 w-5 mr-3" />
                    Watch Video Tutorials
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-start h-12"
                    onClick={handleLiveChat}
                  >
                    <MessageCircle className="h-5 w-5 mr-3" />
                    Live Chat Support
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-start h-12"
                    onClick={handleEmailSupport}
                  >
                    <Mail className="h-5 w-5 mr-3" />
                    Email Support
                  </Button>
                </div>

                <Separator />

                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Need assistance? Our support team is available 24/7 to help you with any questions or issues you may have.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WorkspaceSettings;
