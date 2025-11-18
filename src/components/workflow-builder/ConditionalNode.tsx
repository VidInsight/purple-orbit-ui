import { useState } from 'react';
import { GitBranch, Edit2, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

interface ConditionalNodeProps {
  node: {
    id: string;
    title: string;
    icon?: string;
    nodeType?: string;
    configured?: boolean;
    parameters?: any[];
    branches?: {
      true: string[];  // Array of node IDs
      false: string[]; // Array of node IDs
    };
  };
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onClick?: () => void;
  onAddBranch?: (branchType: 'true' | 'false') => void;
}

export const ConditionalNode = ({ 
  node, 
  onUpdate, 
  onDelete, 
  onClick,
  onAddBranch 
}: ConditionalNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isConfigured = node.configured ?? false;

  const handleNodeClick = () => {
    console.log('Conditional node clicked:', {
      id: node.id,
      title: node.title,
      type: 'Conditional',
      configured: isConfigured,
      branches: node.branches,
    });
    if (onClick) {
      onClick();
    }
    setIsExpanded(!isExpanded);
  };

  const hasTrueBranch = node.branches?.true && node.branches.true.length > 0;
  const hasFalseBranch = node.branches?.false && node.branches.false.length > 0;

  return (
    <div>
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
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center text-2xl">
                {node.icon || '⚖️'}
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
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs bg-warning/20 text-warning-foreground">
              If/Else
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

        {/* Branch Info */}
        {isExpanded && (
          <div className="px-6 py-4 border-t border-border bg-surface/50">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-success">✓ True:</span>
                <span>{hasTrueBranch ? `${node.branches!.true.length} node(s)` : 'No nodes'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-destructive">✗ False:</span>
                <span>{hasFalseBranch ? `${node.branches!.false.length} node(s)` : 'No nodes'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Branch Actions */}
      <div className="flex gap-4 mt-4 px-8">
        {/* True Branch */}
        <div className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddBranch?.('true');
            }}
            className="w-full border-2 border-dashed border-success/50 hover:border-success hover:bg-success/10 text-success"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add True Branch
          </Button>
        </div>

        {/* False Branch */}
        <div className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddBranch?.('false');
            }}
            className="w-full border-2 border-dashed border-destructive/50 hover:border-destructive hover:bg-destructive/10 text-destructive"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add False Branch
          </Button>
        </div>
      </div>
    </div>
  );
};
