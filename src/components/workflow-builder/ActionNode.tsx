import { useState } from 'react';
import { Settings, Trash2, Edit2, CheckCircle2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

interface ActionNodeProps {
  node: {
    id: string;
    title: string;
    icon?: string;
    category?: string;
    nodeType?: string;
    configured?: boolean;
    config?: Record<string, any>;
    parameters?: any[];
  };
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onClick?: () => void;
}

export const ActionNode = ({ node, onUpdate, onDelete, onClick }: ActionNodeProps) => {
  const [isViewing, setIsViewing] = useState(false);
  const isConfigured = node.configured ?? false;

  const handleNodeClick = () => {
    if (onClick && !isViewing) {
      onClick();
    }
  };

  const getIconForNode = () => {
    const iconMap: Record<string, any> = {
      'GPT-4': Settings,
      'AI': Settings,
      'Data': Settings,
      'Logic': Settings,
    };
    return iconMap[node.nodeType || ''] || Settings;
  };

  const Icon = getIconForNode();

  return (
    <div 
      className="bg-surface rounded-lg shadow-md overflow-hidden transition-all duration-200 border-2 border-primary hover:border-primary/80 hover:shadow-lg"
    >
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1" onClick={handleNodeClick}>
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg mb-2">{node.title}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {node.nodeType || 'Action'}
                </Badge>
                {node.category && (
                  <span className="text-xs text-muted-foreground">{node.category}</span>
                )}
                <div className="flex items-center gap-1.5">
                  {isConfigured ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs text-success font-medium">Configured</span>
                    </>
                  ) : (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-warning" />
                      <span className="text-xs text-warning font-medium">Unconfigured</span>
                    </>
                  )}
                </div>
              </div>
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

      {/* Content - View Mode */}
      {isViewing && node.parameters && (
        <div className="px-6 py-4 border-t border-border bg-surface/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Parameters (Read-only)</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsViewing(false)}
              className="h-6 w-6 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {node.parameters.map((param: any) => (
              <div key={param.id} className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">{param.label}</div>
                <div className="text-sm text-foreground">
                  {param.isDynamic ? (
                    <code className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                      {param.dynamicPath || 'No path set'}
                    </code>
                  ) : (
                    <span>{param.value || '-'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
