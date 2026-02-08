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
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/80 backdrop-blur-sm mb-4 animate-in fade-in duration-500 group">
      {/* Full-card animated gradient shine */}
      <div
        className="absolute inset-0 animate-header-shine pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(110deg, transparent 0%, transparent 35%, hsl(var(--primary) / 0.08) 50%, transparent 65%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />
      {/* Background layers with subtle pulse */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)] pointer-events-none animate-header-glow" />
      <div className="relative px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 min-w-0">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 min-w-0">
          <div className="space-y-1.5 min-w-0">
            {badge && (
              <div
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary animate-header-slide-up opacity-0"
                style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}
              >
                {badge.icon && <badge.icon className="h-3.5 w-3.5" />}
                {badge.label}
              </div>
            )}
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight truncate animate-header-slide-up opacity-0"
              style={{
                animationDelay: badge ? '0.1s' : '0.05s',
                animationFillMode: 'forwards',
              }}
            >
              {title}
            </h1>
            {description && (
              <p
                className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed animate-header-slide-up opacity-0"
                style={{
                  animationDelay: badge ? '0.15s' : '0.1s',
                  animationFillMode: 'forwards',
                }}
              >
                {description}
              </p>
            )}
          </div>
          {hasRightContent && (
            <div
              className="flex flex-wrap gap-3 items-center animate-header-slide-up opacity-0"
              style={{
                animationDelay: '0.2s',
                animationFillMode: 'forwards',
              }}
            >
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
