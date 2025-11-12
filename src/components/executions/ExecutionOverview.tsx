import { ExecutionDetails } from '@/types/execution';
import { Clock, Play, User, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ExecutionOverviewProps {
  execution: ExecutionDetails;
}

export const ExecutionOverview = ({ execution }: ExecutionOverviewProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors = {
      success: 'bg-success/10 text-success border-success',
      failed: 'bg-destructive/10 text-destructive border-destructive',
      running: 'bg-primary/10 text-primary border-primary',
      cancelled: 'bg-muted text-muted-foreground border-muted',
    };
    return colors[status as keyof typeof colors];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'In progress...';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-surface rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <Play className="h-4 w-4 text-muted-foreground" />
        </div>
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
            getStatusColor(execution.status)
          )}
        >
          {execution.status}
        </span>
      </div>

      <div className="bg-surface rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">Workflow</p>
          <Workflow className="h-4 w-4 text-muted-foreground" />
        </div>
        <button
          onClick={() => navigate(`/workflows/${execution.workflowId}/edit`)}
          className="text-sm font-medium text-primary hover:underline"
        >
          {execution.workflowName}
        </button>
      </div>

      <div className="bg-surface rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">Duration</p>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground">
          {formatDuration(execution.duration)}
        </p>
      </div>

      <div className="bg-surface rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">Triggered By</p>
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground capitalize">
          {execution.triggeredBy}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(execution.startedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};
