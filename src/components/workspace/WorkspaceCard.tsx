import { Workspace } from '@/types/workspace';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: (workspace: Workspace) => void;
}

export const WorkspaceCard = ({ workspace, onClick }: WorkspaceCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <button
      onClick={() => onClick(workspace)}
      className={cn(
        'group relative w-full px-5 py-4 rounded-lg border border-border bg-surface',
        'hover:border-primary/60 hover:bg-surface/80 hover:shadow-lg hover:-translate-y-0.5',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
        'flex items-center gap-4 sm:gap-5',
        'animate-fade-in-up'
      )}
    >
      {/* Logo */}
      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-glow-primary transition-all duration-300 group-hover:scale-110">
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
              "text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide",
              workspace.role === 'admin' && "bg-primary/10 text-primary",
              workspace.role === 'editor' && "bg-success/10 text-success",
              workspace.role === 'viewer' && "bg-muted text-muted-foreground"
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

      {/* Enter Button */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 group-hover:bg-primary/15 transition-all duration-200 group-hover:scale-105">
        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors duration-200">
          Enter
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </button>
  );
};
