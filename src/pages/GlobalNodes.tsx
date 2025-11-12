import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';

interface GlobalNode {
  id: string;
  name: string;
  description?: string;
}

// Mock data
const mockGlobalNodes: GlobalNode[] = [
  {
    id: 'gn-001',
    name: 'HTTP Request',
    description: 'Make HTTP requests to external APIs',
  },
  {
    id: 'gn-002',
    name: 'JSON Parser',
    description: 'Parse and transform JSON data',
  },
  {
    id: 'gn-003',
    name: 'Email Sender',
    description: 'Send emails via SMTP or API',
  },
  {
    id: 'gn-004',
    name: 'Data Transformer',
    description: 'Transform data between different formats',
  },
  {
    id: 'gn-005',
    name: 'Scheduler',
    description: 'Schedule and trigger workflows',
  },
];

const GlobalNodes = () => {
  const [nodes] = useState<GlobalNode[]>(mockGlobalNodes);
  const [isLoading] = useState(false);

  const handleView = async (node: GlobalNode) => {
    console.log('View node:', node);
  };

  const handleEdit = async (node: GlobalNode) => {
    console.log('Edit node:', node);
  };

  const handleDelete = async (node: GlobalNode) => {
    console.log('Delete node:', node);
  };

  const handleCreate = () => {
    console.log('Create new global node');
  };

  return (
    <ListPageTemplate
      pageTitle="Global Nodes"
      pageDescription="Reusable nodes available across all workflows"
      items={nodes}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      createButtonText="Add Global Node"
      itemTypeName="global node"
      isLoading={isLoading}
      emptyMessage="No global nodes found"
      emptyDescription="Global nodes are pre-built components you can use in your workflows."
      searchPlaceholder="Search global nodes..."
    />
  );
};

export default GlobalNodes;
