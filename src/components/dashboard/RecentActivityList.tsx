import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ActivityItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'success' | 'failed' | 'running' | 'draft';
  timestamp: string;
}

interface RecentActivityListProps {
  title: string;
  items: ActivityItem[];
  onViewAll: () => void;
  emptyMessage?: string;
}

export const RecentActivityList = ({
  title,
  items,
  onViewAll,
  emptyMessage = 'No recent activity',
}: RecentActivityListProps) => {
  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-success/10 text-success',
      inactive: 'bg-muted text-muted-foreground',
      success: 'bg-success/10 text-success',
      failed: 'bg-destructive/10 text-destructive',
      running: 'bg-primary/10 text-primary',
      draft: 'bg-warning/10 text-warning',
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-md dark:border-white/10 dark:bg-white/6 dark:backdrop-blur-xl dark:shadow-lg dark:shadow-black/40">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {emptyMessage}
        </p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer shadow-sm hover:shadow-primary/25 dark:border-white/8 dark:bg-white/4 dark:hover:bg-primary/10"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3',
                    getStatusColor(item.status)
                  )}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onViewAll}
            className="w-full flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};
