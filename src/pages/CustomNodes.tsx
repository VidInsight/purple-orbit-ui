import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { NodeGrid, NodeItem } from '@/components/nodes/NodeGrid';
import { Button } from '@/components/ui/Button';
import { 
  Package,
  FileText,
  Zap,
  Settings
} from 'lucide-react';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

const CustomNodes = () => {
  const [nodes, setNodes] = useState<NodeItem[]>(mockCustomNodes);

  const handleCreate = () => {
    toast({
      title: 'Create Custom Node',
      description: 'Opening custom node builder...',
    });
    console.log('Create new custom node');
  };

  const handleDocumentation = (node: NodeItem) => {
    toast({
      title: 'Documentation',
      description: `Opening documentation for ${node.name}...`,
    });
    console.log('View documentation:', node);
  };

  const handleEdit = (node: NodeItem) => {
    toast({
      title: 'Edit Node',
      description: `Editing ${node.name}...`,
    });
    console.log('Edit node:', node);
  };

  const handleDelete = (node: NodeItem) => {
    toast({
      title: 'Delete Node',
      description: `${node.name} has been deleted.`,
      variant: 'destructive',
    });
    setNodes(nodes.filter(n => n.id !== node.id));
    console.log('Delete node:', node);
  };

  return (
    <PageLayout>
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
    </PageLayout>
  );
};

export default CustomNodes;
