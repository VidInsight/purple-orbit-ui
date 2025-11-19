import { X, Link } from 'lucide-react';

interface PathChipProps {
  path: string;
  onRemove: () => void;
  showTooltip?: boolean;
}

export const PathChip = ({ path, onRemove, showTooltip = true }: PathChipProps) => {
  return (
    <div className="relative group">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/30 rounded">
        <Link className="h-3 w-3 text-primary flex-shrink-0" />
        <code className="text-[11px] font-mono text-primary flex-1 truncate leading-tight">
          {path}
        </code>
        <button
          onClick={onRemove}
          className="h-4 w-4 flex items-center justify-center hover:bg-destructive/20 hover:text-destructive rounded transition-colors flex-shrink-0"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
      
      {showTooltip && (
        <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-surface border border-border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
          <p className="text-[10px] text-muted-foreground mb-0.5">Dynamic value from:</p>
          <code className="text-[10px] font-mono text-foreground">{path}</code>
        </div>
      )}
    </div>
  );
};
