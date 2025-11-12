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
        'hover:border-primary hover:bg-surface/80 hover:shadow-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
        'flex items-center gap-4 sm:gap-5'
      )}
    >
      {/* Logo */}
      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-base sm:text-lg font-bold text-primary-foreground">
          {getInitials(workspace.name)}
        </span>
      </div>

      {/* Name and Description */}
      <div className="flex-1 text-left min-w-0 py-1">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors truncate leading-tight">
          {workspace.name}
        </h3>
        {workspace.description && (
          <p className="text-xs sm:text-sm text-muted-foreground/90 truncate leading-relaxed">
            {workspace.description}
          </p>
        )}
      </div>

      {/* Enter Button */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-all">
        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
          Enter
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
};
