import { cn } from '@/lib/utils';

interface UsageBarProps {
  label: string;
  used: number;
  limit: number | 'unlimited';
  unit?: string;
}

export const UsageBar = ({ label, used, limit, unit = '' }: UsageBarProps) => {
  // Handle undefined/null values
  const safeUsed = used ?? 0;
  const safeLimit = limit === 'unlimited' ? 'unlimited' : (limit ?? 0);

  if (safeLimit === 'unlimited') {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">{label}</span>
        <span className="text-sm font-medium text-muted-foreground">
          {safeUsed.toLocaleString()} {unit} (Unlimited)
        </span>
      </div>
      <div className="h-3 bg-surface/50 rounded-full overflow-hidden border border-border/30">
        <div className="h-full bg-gradient-to-r from-primary/40 to-primary/60 rounded-full transition-all duration-500" style={{ width: '20%' }} />
      </div>
    </div>
  );
  }

  const percentage = safeLimit > 0 ? (safeUsed / safeLimit) * 100 : 0;
  const isWarning = percentage >= 80;
  const isDanger = percentage >= 95;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">{label}</span>
        <span
          className={cn(
            'text-sm font-medium',
            isDanger
              ? 'text-destructive'
              : isWarning
              ? 'text-amber-500'
              : 'text-muted-foreground'
          )}
        >
          {safeUsed.toLocaleString()} / {safeLimit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-3 bg-surface/50 rounded-full overflow-hidden border border-border/30 relative">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isDanger
              ? 'bg-gradient-to-r from-destructive to-destructive/80'
              : isWarning
              ? 'bg-gradient-to-r from-amber-500 to-amber-400'
              : 'bg-gradient-to-r from-primary to-primary/80'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isWarning && (
        <p className={cn(
          'text-xs font-medium',
          isDanger ? 'text-destructive' : 'text-amber-500'
        )}>
          {isDanger ? '⚠️ Usage limit almost reached!' : '💡 Consider upgrading your plan'}
        </p>
      )}
    </div>
  );
};
