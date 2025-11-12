import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  iconColor = 'text-primary-foreground',
  iconBgColor = 'bg-primary',
}: StatCardProps) => {
  return (
    <div className="bg-surface rounded-lg border border-border p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {label}
          </p>
          <p className="text-3xl font-semibold text-foreground mb-1">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </div>
  );
};
