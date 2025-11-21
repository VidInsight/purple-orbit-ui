import { useState } from 'react';
import { Repeat, Edit2, CheckCircle2, Trash2, Eye, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

interface LoopNodeProps {
  node: {
    id: string;
    title: string;
    icon?: LucideIcon;
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
  const [isViewing, setIsViewing] = useState(false);
  const isConfigured = node.configured ?? false;

  const handleNodeClick = () => {
    if (onClick && !isViewing) {
      onClick();
    }
  };

  const hasLoopBody = node.loopBody && node.loopBody.length > 0;

  return (
    <div 
      className="bg-surface rounded-lg shadow-md overflow-hidden transition-all duration-200 border-2 border-primary hover:border-primary/80 hover:shadow-lg"
    >
      {/* Header */}
      <div className="px-5 py-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1" onClick={handleNodeClick}>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Repeat className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  {isConfigured ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-success" />
                      <span className="text-xs text-success font-medium">Configured</span>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-3 rounded-full border-2 border-warning" />
                      <span className="text-xs text-warning font-medium">Unconfigured</span>
                    </>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{node.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsViewing(!isViewing);
              }}
              className="h-8 w-8 p-0"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
              }}
              className="h-8 w-8 p-0"
              title="Edit"
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
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
