import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderStat {
  icon: LucideIcon;
  value: React.ReactNode;
  label: string;
}

export interface PageHeaderBadge {
  label: string;
  icon?: LucideIcon;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: PageHeaderBadge;
  stats?: PageHeaderStat[];
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, badge, stats, actions }: PageHeaderProps) => {
  const hasRightContent = (stats && stats.length > 0) || actions;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/80 backdrop-blur-sm mb-4 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.12)_0%,transparent_60%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1.5">
            {badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                {badge.icon && <badge.icon className="h-3.5 w-3.5" />}
                {badge.label}
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {hasRightContent && (
            <div className="flex flex-wrap gap-3 items-center">
              {stats?.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 rounded-xl border border-border/80 bg-background/60 px-4 py-2.5 shadow-sm"
                >
                  <stat.icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-2xl font-bold tabular-nums text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
