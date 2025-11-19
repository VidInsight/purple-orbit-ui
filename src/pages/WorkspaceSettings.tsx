import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Users,
  Workflow,
  Code,
  Database,
  Key,
  Activity,
  Zap
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

  const quotaItems = [
    { 
      icon: Users, 
      label: 'Team Members', 
      current: currentWorkspace?.current_member_count || 0, 
      limit: currentWorkspace?.member_limit || 0,
      color: 'text-primary'
    },
    { 
      icon: Workflow, 
      label: 'Workflows', 
      current: currentWorkspace?.current_workflow_count || 0, 
      limit: currentWorkspace?.workflow_limit || 0,
      color: 'text-primary'
    },
    { 
      icon: Code, 
      label: 'Custom Scripts', 
      current: currentWorkspace?.current_custom_script_count || 0, 
      limit: currentWorkspace?.custom_script_limit || 0,
      color: 'text-primary'
    },
    { 
      icon: Database, 
      label: 'Storage', 
      current: ((currentWorkspace?.current_storage_mb || 0) / 1024).toFixed(1), 
      limit: ((currentWorkspace?.storage_limit_mb || 0) / 1024).toFixed(0),
      unit: 'GB',
      color: 'text-primary'
    },
    { 
      icon: Key, 
      label: 'API Keys', 
      current: currentWorkspace?.current_api_key_count || 0, 
      limit: currentWorkspace?.api_key_limit || 0,
      color: 'text-primary'
    },
    { 
      icon: Activity, 
      label: 'Monthly Executions', 
      current: (currentWorkspace?.current_month_executions || 0).toLocaleString(), 
      limit: (currentWorkspace?.monthly_execution_limit || 0).toLocaleString(),
      color: 'text-primary'
    },
    { 
      icon: Zap, 
      label: 'Concurrent Executions', 
      current: currentWorkspace?.current_month_concurrent_executions || 0, 
      limit: currentWorkspace?.monthly_concurrent_executions || 0,
      color: 'text-primary'
    },
  ];

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Workspace Settings</h1>
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
                    size="lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>

            {/* Current Plan & Quotas */}
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      Current Plan
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      View your plan limits and current usage
                    </p>
                  </div>
                  <Badge variant="default" className="text-sm px-4 py-1.5">
                    Pro Plan
                  </Badge>
                </div>

                <Separator />

                {/* Quotas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quotaItems.map((item) => (
                    <div
                      key={item.label}
                      className="p-5 rounded-lg border border-border bg-surface/50 hover:bg-surface transition-colors duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-primary/10 ${item.color}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {item.label}
                          </p>
                          <p className="text-2xl font-semibold text-foreground">
                            {item.current} <span className="text-lg text-muted-foreground">/ {item.limit}</span>
                            {item.unit && <span className="text-sm text-muted-foreground ml-1">{item.unit}</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Plan Actions */}
                <div className="flex gap-4">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleUpgrade}
                    size="lg"
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleDowngrade}
                    size="lg"
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Downgrade Plan
                  </Button>
                </div>
              </div>
            </Card>
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
                    className="w-full justify-start h-12 text-base"
                    onClick={handleGetHelp}
                  >
                    <HelpCircle className="h-5 w-5 mr-3" />
                    Get Help
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-start h-12 text-base"
                    onClick={handleCreateTicket}
                  >
                    <Ticket className="h-5 w-5 mr-3" />
                    Create Support Ticket
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-start h-12 text-base"
                    onClick={handleViewDocs}
                  >
                    <BookOpen className="h-5 w-5 mr-3" />
                    Documentation
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
