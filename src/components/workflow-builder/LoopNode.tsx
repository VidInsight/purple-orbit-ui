import { useState } from 'react';
import { Repeat, Edit2, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

interface LoopNodeProps {
  node: {
    id: string;
    title: string;
    icon?: string;
    nodeType?: string;
    configured?: boolean;
    parameters?: any[];
    loopBody?: string[]; // Array of node IDs inside the loop
  };
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onClick?: () => void;
}

export const LoopNode = ({ node, onUpdate, onDelete, onClick }: LoopNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isConfigured = node.configured ?? false;

  const handleNodeClick = () => {
    console.log('Loop node clicked:', {
      id: node.id,
      title: node.title,
      type: 'Loop',
      configured: isConfigured,
      loopBody: node.loopBody,
    });
    if (onClick) {
      onClick();
    }
    setIsExpanded(!isExpanded);
  };

  const hasLoopBody = node.loopBody && node.loopBody.length > 0;

  return (
    <div 
      className={`bg-surface rounded-lg shadow-md overflow-hidden transition-all duration-200 border-2 cursor-pointer ${
        isConfigured 
          ? 'border-success hover:border-success/80 hover:shadow-lg' 
          : 'border-warning hover:border-warning/80 hover:shadow-lg'
      }`}
      onClick={handleNodeClick}
    >
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
              {node.icon || '🔁'}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{node.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
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
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary-foreground">
            Loop/Iteration
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isConfigured ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm text-success font-medium">Configured</span>
            </>
          ) : (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-warning" />
              <span className="text-sm text-warning font-medium">Unconfigured</span>
            </>
          )}
        </div>
      </div>

      {/* Loop Info */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-border bg-surface/50">
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              <span>Loop body: {hasLoopBody ? `${node.loopBody!.length} node(s)` : 'Empty'}</span>
            </div>
            <p className="text-xs mt-2">
              This node will iterate over an array and execute the loop body for each item.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
