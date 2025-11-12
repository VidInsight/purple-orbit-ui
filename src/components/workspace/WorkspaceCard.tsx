import { Workspace } from '@/types/workspace';
import { Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={() => onClick(workspace)}
      className={cn(
        'group relative w-full p-6 rounded-lg border border-border bg-surface',
        'hover:border-primary hover:shadow-lg hover:scale-[1.02]',
        'transition-all duration-200 text-left',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
      )}
    >
      {/* Workspace Icon */}
      <div className="mb-4">
        <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-2xl font-semibold text-primary-foreground">
            {getInitials(workspace.name)}
          </span>
        </div>
      </div>

      {/* Workspace Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {workspace.name}
        </h3>
        {workspace.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {workspace.description}
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          <span>{workspace.memberCount} member{workspace.memberCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDate(workspace.lastAccessed)}</span>
        </div>
      </div>
    </button>
  );
};
