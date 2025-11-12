import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WorkflowNode } from '@/types/workflow';
import { Trash2 } from 'lucide-react';

interface NodePropertiesPanelProps {
  node: WorkflowNode;
  onUpdate: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  onDelete: (nodeId: string) => void;
}

export const NodePropertiesPanel = ({
  node,
  onUpdate,
  onDelete,
}: NodePropertiesPanelProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Node Properties</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <Input
            label="Label"
            value={node.data.label}
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <textarea
            value={node.data.description || ''}
            onChange={(e) => onUpdate(node.id, { description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-surface border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Describe what this node does..."
          />
        </div>

        {node.type === 'action' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Action Configuration</h4>
            
            <Input
              label="Action Type"
              placeholder="API Call, Database Query, etc."
            />
            
            <Input
              label="Endpoint/Query"
              placeholder="https://api.example.com/data"
            />
          </div>
        )}

        {node.type === 'condition' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Condition Configuration</h4>
            
            <Input
              label="Condition Expression"
              placeholder="value > 10"
            />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <Button variant="secondary" size="sm" className="w-full">
          Test Node
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
};
