import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap, Code, GitBranch, Repeat, StopCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  trigger: Zap,
  action: Code,
  condition: GitBranch,
  loop: Repeat,
  end: StopCircle,
};

const colorMap: Record<string, string> = {
  trigger: 'bg-primary/10 border-primary text-primary',
  action: 'bg-accent/10 border-accent text-accent-foreground',
  condition: 'bg-warning/10 border-warning text-warning',
  loop: 'bg-success/10 border-success text-success',
  end: 'bg-destructive/10 border-destructive text-destructive',
};

export const CustomNode = memo(({ data, type, selected }: NodeProps) => {
  const Icon = iconMap[type || 'action'];
  const colorClass = colorMap[type || 'action'];

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 bg-surface min-w-[150px] shadow-lg',
        colorClass,
        selected && 'ring-2 ring-ring ring-offset-2'
      )}
    >
      {type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-primary !w-3 !h-3 !border-2 !border-background"
        />
      )}

      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {String(data.label || '')}
          </p>
          {data.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {String(data.description)}
            </p>
          )}
        </div>
      </div>

      {type !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-primary !w-3 !h-3 !border-2 !border-background"
        />
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
