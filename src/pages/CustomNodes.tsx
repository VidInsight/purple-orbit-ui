import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';

interface CustomNode {
  id: string;
  name: string;
  description?: string;
}

// Mock data
const mockCustomNodes: CustomNode[] = [
  {
    id: 'cn-001',
    name: 'Salesforce Integration',
    description: 'Custom node for Salesforce API operations',
  },
  {
    id: 'cn-002',
    name: 'Slack Notifier',
    description: 'Send formatted notifications to Slack channels',
  },
  {
    id: 'cn-003',
    name: 'PDF Generator',
    description: 'Generate PDF documents from templates',
  },
];

const CustomNodes = () => {
  const [nodes] = useState<CustomNode[]>(mockCustomNodes);
  const [isLoading] = useState(false);

  const handleView = async (node: CustomNode) => {
    console.log('View node:', node);
  };

  const handleEdit = async (node: CustomNode) => {
    console.log('Edit node:', node);
  };

  const handleDelete = async (node: CustomNode) => {
    console.log('Delete node:', node);
  };

  const handleCreate = () => {
    console.log('Create new custom node');
  };

  return (
    <ListPageTemplate
      pageTitle="Custom Nodes"
      pageDescription="Custom nodes created for your specific workflow needs"
      items={nodes}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      createButtonText="Create Custom Node"
      itemTypeName="custom node"
      isLoading={isLoading}
      emptyMessage="No custom nodes found"
      emptyDescription="Create custom nodes to extend your workflow capabilities."
      searchPlaceholder="Search custom nodes..."
    />
  );
};

export default CustomNodes;
