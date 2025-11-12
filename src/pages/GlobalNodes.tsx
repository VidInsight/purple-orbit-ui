import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { NodeGrid, NodeItem } from '@/components/nodes/NodeGrid';
import { 
  Globe, 
  Mail, 
  Database, 
  Code, 
  FileJson,
  Calendar,
  Webhook,
  MessageSquare,
  Filter,
  GitBranch,
  Clock,
  Repeat
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data with categories
const mockGlobalNodes: NodeItem[] = [
  {
    id: 'gn-001',
    name: 'HTTP Request',
    description: 'Make HTTP requests to external APIs and services',
    icon: Globe,
    category: 'Communication',
    subcategory: 'HTTP',
  },
  {
    id: 'gn-002',
    name: 'Webhook',
    description: 'Receive data from external webhooks',
    icon: Webhook,
    category: 'Communication',
    subcategory: 'HTTP',
  },
  {
    id: 'gn-003',
    name: 'Email Sender',
    description: 'Send emails via SMTP or API services',
    icon: Mail,
    category: 'Communication',
    subcategory: 'Email',
  },
  {
    id: 'gn-004',
    name: 'JSON Parser',
    description: 'Parse and transform JSON data structures',
    icon: FileJson,
    category: 'Data Processing',
    subcategory: 'Parsers',
  },
  {
    id: 'gn-005',
    name: 'Data Transformer',
    description: 'Transform data between different formats',
    icon: Code,
    category: 'Data Processing',
    subcategory: 'Transform',
  },
  {
    id: 'gn-006',
    name: 'Filter',
    description: 'Filter data based on conditions',
    icon: Filter,
    category: 'Data Processing',
    subcategory: 'Transform',
  },
  {
    id: 'gn-007',
    name: 'Database Query',
    description: 'Execute queries on connected databases',
    icon: Database,
    category: 'Data Storage',
  },
  {
    id: 'gn-008',
    name: 'Scheduler',
    description: 'Schedule and trigger workflows at specific times',
    icon: Calendar,
    category: 'Triggers',
  },
  {
    id: 'gn-009',
    name: 'Wait',
    description: 'Pause workflow execution for a specified duration',
    icon: Clock,
    category: 'Flow Control',
  },
  {
    id: 'gn-010',
    name: 'Loop',
    description: 'Repeat actions for each item in a collection',
    icon: Repeat,
    category: 'Flow Control',
  },
];

const GlobalNodes = () => {
  const handleDocumentation = (node: NodeItem) => {
    toast({
      title: 'Documentation',
      description: `Opening documentation for ${node.name}...`,
    });
    console.log('View documentation:', node);
  };

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Global Nodes"
          description="Pre-built nodes available across all workflows"
        />
        
        <NodeGrid 
          nodes={mockGlobalNodes}
          onDocumentation={handleDocumentation}
          readOnly={true}
          columns={5}
        />
      </div>
    </PageLayout>
  );
};

export default GlobalNodes;
