import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { NodeGrid, NodeItem } from '@/components/nodes/NodeGrid';
import { Button } from '@/components/ui/button';
import { 
  Package,
  FileText,
  Zap,
  Settings,
  Lock,
  CreditCard
} from 'lucide-react';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getCurrentWorkspacePlan } from '@/services/billingApi';

// Mock data with categories
const mockCustomNodes: NodeItem[] = [
  {
    id: 'cn-001',
    name: 'Salesforce Integration',
    description: 'Custom node for Salesforce API operations and data sync',
    icon: Package,
    category: 'CRM',
  },
  {
    id: 'cn-002',
    name: 'Slack Notifier',
    description: 'Send formatted notifications to Slack channels and users',
    icon: Zap,
    category: 'Notifications',
  },
  {
    id: 'cn-003',
    name: 'PDF Generator',
    description: 'Generate PDF documents from custom templates',
    icon: FileText,
    category: 'Documents',
  },
];

/** API'den gelen plan id/name/display_name "business" içeriyorsa Business plan kabul edilir */
const isBusinessPlan = (plan: { id?: string; name?: string; display_name?: string }): boolean => {
  const id = (plan.id || '').toLowerCase();
  const name = (plan.name || '').toLowerCase();
  const displayName = (plan.display_name || '').toLowerCase();
  return id === 'business' || id.includes('business')
    || name === 'business' || name.includes('business')
    || displayName === 'business' || displayName.includes('business');
};

const CustomNodes = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [nodes, setNodes] = useState<NodeItem[]>(mockCustomNodes);
  const [planAccess, setPlanAccess] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const [currentPlanName, setCurrentPlanName] = useState<string>('');

  useEffect(() => {
    const checkPlan = async () => {
      if (!currentWorkspace?.id) {
        setPlanAccess('denied');
        return;
      }
      try {
        const response = await getCurrentWorkspacePlan(currentWorkspace.id);
        const plan = response.data.plan;
        const planName = plan.display_name || plan.name || plan.id;
        setCurrentPlanName(planName);
        setPlanAccess(isBusinessPlan(plan) ? 'allowed' : 'denied');
      } catch {
        setPlanAccess('denied');
      }
    };
    checkPlan();
  }, [currentWorkspace?.id]);

  const handleCreate = () => {
    toast({
      title: 'Create Custom Node',
      description: 'Opening custom node builder...',
    });
  };

  const handleDocumentation = (node: NodeItem) => {
    toast({
      title: 'Documentation',
      description: `Opening documentation for ${node.name}...`,
    });
  };

  const handleEdit = (node: NodeItem) => {
    toast({
      title: 'Edit Node',
      description: `Editing ${node.name}...`,
    });
  };

  const handleDelete = (node: NodeItem) => {
    toast({
      title: 'Delete Node',
      description: `${node.name} has been deleted.`,
      variant: 'destructive',
    });
    setNodes(nodes.filter(n => n.id !== node.id));
  };

  if (planAccess === 'loading') {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded-lg w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (planAccess === 'denied') {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Custom Nodes özelliği Business plan ile kullanılabilir
            </h1>
            <p className="text-muted-foreground max-w-md mb-2">
              Custom Nodes sayfasına erişmek için workspace'inizin <strong>Business</strong> plana sahip olması gerekiyor.
              {currentPlanName && (
                <span className="block mt-2">
                  Mevcut planınız: <strong>{currentPlanName}</strong>
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Planınızı yükseltmek için Faturalandırma sayfasına gidin.
            </p>
            <Button onClick={() => navigate('/billing')} size="lg">
              <CreditCard className="h-4 w-4 mr-2" />
              Faturalandırma'ya git
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <PageHeader
          title="Custom Nodes"
          description="Custom nodes created for your specific workflow needs"
          actions={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Node
            </Button>
          }
        />
        
        <div>
          {nodes.length > 0 ? (
            <NodeGrid 
              nodes={nodes}
              onDocumentation={handleDocumentation}
              onEdit={handleEdit}
              onDelete={handleDelete}
              readOnly={false}
              columns={5}
            />
          ) : (
            <div className="text-center py-16 bg-surface rounded-lg border border-border">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No custom nodes yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Create your first custom node to extend your workflows</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Node
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default CustomNodes;
