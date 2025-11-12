import { cn } from '@/lib/utils';

interface UsageBarProps {
  label: string;
  used: number;
  limit: number | 'unlimited';
  unit?: string;
}

export const UsageBar = ({ label, used, limit, unit = '' }: UsageBarProps) => {
  if (limit === 'unlimited') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm text-muted-foreground">
            {used.toLocaleString()} {unit} (Unlimited)
          </span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-primary/30 rounded-full" style={{ width: '20%' }} />
        </div>
      </div>
    );
  }

  const percentage = (used / limit) * 100;
  const isWarning = percentage >= 80;
  const isDanger = percentage >= 95;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span
          className={cn(
            'text-sm',
            isDanger
              ? 'text-destructive font-medium'
              : isWarning
              ? 'text-amber-500 font-medium'
              : 'text-muted-foreground'
          )}
        >
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isDanger
              ? 'bg-destructive'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-primary'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isWarning && (
        <p className="text-xs text-amber-500">
          {isDanger ? 'Usage limit almost reached!' : 'Consider upgrading your plan'}
        </p>
      )}
    </div>
  );
};
