import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { NodeTemplate } from '@/types/workflow';
import { Search, Zap, Code, GitBranch, Repeat, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeTemplates: NodeTemplate[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Start your workflow',
    icon: 'Zap',
    category: 'Control',
  },
  {
    type: 'action',
    label: 'API Call',
    description: 'Make an HTTP request',
    icon: 'Code',
    category: 'Actions',
  },
  {
    type: 'action',
    label: 'Database Query',
    description: 'Query a database',
    icon: 'Code',
    category: 'Actions',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on a condition',
    icon: 'GitBranch',
    category: 'Control',
  },
  {
    type: 'loop',
    label: 'Loop',
    description: 'Repeat actions',
    icon: 'Repeat',
    category: 'Control',
  },
  {
    type: 'end',
    label: 'End',
    description: 'End the workflow',
    icon: 'StopCircle',
    category: 'Control',
  },
];

const iconMap: Record<string, any> = {
  Zap,
  Code,
  GitBranch,
  Repeat,
  StopCircle,
};

interface NodeLibraryProps {
  onNodeDragStart: (nodeType: NodeTemplate) => void;
}

export const NodeLibrary = ({ onNodeDragStart }: NodeLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = nodeTemplates.filter((node) =>
    node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(filteredNodes.map((n) => n.category)));

  const handleDragStart = (event: React.DragEvent, node: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(node));
    event.dataTransfer.effectAllowed = 'move';
    onNodeDragStart(node);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {categories.map((category) => {
          const categoryNodes = filteredNodes.filter((n) => n.category === category);
          
          return (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryNodes.map((node) => {
                  const Icon = iconMap[node.icon];
                  
                  return (
                    <div
                      key={`${node.type}-${node.label}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node)}
                      className={cn(
                        'p-3 rounded-lg border border-border bg-background cursor-grab active:cursor-grabbing',
                        'hover:border-primary hover:bg-accent/50 transition-all',
                        'flex items-start gap-3'
                      )}
                    >
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {node.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
