import { X, Link } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PathChipProps {
  path: string;
  onRemove: () => void;
  showTooltip?: boolean;
}

export const PathChip = ({ path, onRemove, showTooltip = true }: PathChipProps) => {
  return (
    <div className="relative group">
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border-2 border-primary/30 rounded-lg">
        <Link className="h-4 w-4 text-primary flex-shrink-0" />
        <code className="text-sm font-mono text-primary flex-1 truncate">
          {path}
        </code>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-5 w-5 p-0 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      {showTooltip && (
        <div className="absolute left-0 top-full mt-2 px-3 py-2 bg-surface border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
          <p className="text-xs text-muted-foreground mb-1">Dynamic value from:</p>
          <code className="text-xs font-mono text-foreground">{path}</code>
        </div>
      )}
    </div>
  );
};
