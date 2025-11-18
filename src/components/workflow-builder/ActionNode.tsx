import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ActionNodeProps {
  node: {
    id: string;
    title: string;
    category?: string;
    config?: Record<string, any>;
  };
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}

export const ActionNode = ({ node, onUpdate, onDelete }: ActionNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30">
      {/* Header */}
      <div 
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Settings className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{node.title}</h3>
            {node.category && (
              <p className="text-xs text-muted-foreground">{node.category}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-8 w-8 p-0 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-border bg-surface/50">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Configuration options will be displayed here.</p>
            <p className="text-xs">This node will execute the selected action.</p>
          </div>
        </div>
      )}
    </div>
  );
};
