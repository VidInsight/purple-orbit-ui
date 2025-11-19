import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Check,
  X
} from 'lucide-react';

const WorkspaceSettings = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: 'Settings Saved',
      description: 'Workspace settings have been updated successfully.',
    });
    
    setIsSaving(false);
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

  if (!currentWorkspace) {
    return null;
  }

  const planFeatures = [
    { name: 'Team Members', value: `${currentWorkspace?.current_member_count || 0} / ${currentWorkspace?.member_limit || 0}`, available: true },
    { name: 'Workflows', value: `${currentWorkspace?.current_workflow_count || 0} / ${currentWorkspace?.workflow_limit || 0}`, available: true },
    { name: 'Custom Scripts', value: `${currentWorkspace?.current_custom_script_count || 0} / ${currentWorkspace?.custom_script_limit || 0}`, available: true },
    { name: 'Storage', value: `${((currentWorkspace?.current_storage_mb || 0) / 1024).toFixed(1)} / ${((currentWorkspace?.storage_limit_mb || 0) / 1024).toFixed(0)} GB`, available: true },
    { name: 'API Keys', value: `${currentWorkspace?.current_api_key_count || 0} / ${currentWorkspace?.api_key_limit || 0}`, available: true },
    { name: 'Monthly Executions', value: `${(currentWorkspace?.current_month_executions || 0).toLocaleString()} / ${(currentWorkspace?.monthly_execution_limit || 0).toLocaleString()}`, available: true },
    { name: 'Concurrent Executions', value: `${currentWorkspace?.current_month_concurrent_executions || 0} / ${currentWorkspace?.monthly_concurrent_executions || 0}`, available: true },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Workspace Settings"
          description="Manage your workspace configuration and plan"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Workspace Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workspace Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Workspace Information
              </h2>
              <div className="space-y-4">
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
                    rows={3}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>

            {/* Current Plan */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Current Plan
                </h2>
                <Badge variant="default" className="text-sm">
                  Pro Plan
                </Badge>
              </div>

              <div className="space-y-3 mb-6">
                {planFeatures.map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {feature.available ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-foreground">{feature.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {feature.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleUpgrade}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleDowngrade}
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Downgrade Plan
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Support */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Support & Resources
              </h2>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={handleGetHelp}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Get Help
                </Button>

                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={handleCreateTicket}
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>

                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={handleViewDocs}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  Need help with your workspace? Our support team is available 24/7 to assist you with any questions or issues.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WorkspaceSettings;
