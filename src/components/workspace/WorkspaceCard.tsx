import { Workspace } from '@/types/workspace';
import { ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: (workspace: Workspace) => void;
  onDelete?: (workspace: Workspace) => void;
}

export const WorkspaceCard = ({ workspace, onClick, onDelete }: WorkspaceCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={() => onClick(workspace)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(workspace);
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        'group relative w-full px-5 py-4 rounded-xl border border-border bg-surface/80 backdrop-blur-sm',
        'hover:border-primary/50 hover:bg-surface hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
        'transition-all duration-300 ease-out',
        'flex items-center gap-4 sm:gap-5 cursor-pointer'
      )}
    >
      {/* Subtle left accent on hover */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-r-full bg-primary opacity-0 group-hover:opacity-100 group-hover:h-2/3 transition-all duration-300" />

      {/* Logo */}
      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-glow-primary transition-all duration-300 group-hover:scale-105 border border-primary/20">
        <span className="text-base sm:text-lg font-bold text-primary-foreground">
          {getInitials(workspace.name)}
        </span>
      </div>

      {/* Name and Description */}
      <div className="flex-1 text-left min-w-0 py-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate leading-tight">
            {workspace.name}
          </h3>
          {workspace.role && workspace.role !== 'owner' && (
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide border",
              workspace.role === 'admin' && "bg-primary/10 text-primary border-primary/20",
              workspace.role === 'editor' && "bg-success/10 text-success border-success/20",
              workspace.role === 'viewer' && "bg-muted text-muted-foreground border-border"
            )}>
              {workspace.role}
            </span>
          )}
        </div>
        {workspace.description && (
          <p className="text-xs sm:text-sm text-muted-foreground/90 truncate leading-relaxed">
            {workspace.description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {workspace.role === 'owner' && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(workspace);
            }}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
            title="Delete workspace"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/15 border border-transparent group-hover:border-primary/20 transition-all duration-200 group-hover:scale-105">
          <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors duration-200">
            Enter
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};
