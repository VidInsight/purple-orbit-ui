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
    <div className="bg-surface rounded-lg border border-border p-6 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {label}
          </p>
          <p className="text-3xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
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
        <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center group-hover:shadow-glow-primary group-hover:scale-110 transition-all duration-300', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </div>
  );
};
