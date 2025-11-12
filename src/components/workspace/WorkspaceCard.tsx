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
        'group relative w-full p-4 rounded-lg border border-border bg-surface',
        'hover:border-primary hover:shadow-md transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'flex items-center gap-4'
      )}
    >
      {/* Logo */}
      <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-semibold text-primary-foreground">
          {getInitials(workspace.name)}
        </span>
      </div>

      {/* Name and Description */}
      <div className="flex-1 text-left min-w-0">
        <h3 className="text-base font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors truncate">
          {workspace.name}
        </h3>
        {workspace.description && (
          <p className="text-sm text-muted-foreground truncate">
            {workspace.description}
          </p>
        )}
      </div>

      {/* Enter Button */}
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
      >
        <span className="mr-1">Enter</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </button>
  );
};
