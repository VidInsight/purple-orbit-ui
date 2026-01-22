import { CurrentSubscription } from '@/types/billing';
import { UsageBar } from './UsageBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuotasTabProps {
  subscription: CurrentSubscription;
}

export const QuotasTab = ({ subscription }: QuotasTabProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-3xl -z-10" />
      
      {/* Main card */}
      <div className="relative bg-surface/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl shadow-primary/5 p-8 transition-all duration-300">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Usage & Quotas</h2>
          <p className="text-sm text-muted-foreground">
            Current billing period: {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
          </p>
        </div>
        
        <div className="space-y-6">
          <UsageBar
            label="Members"
            used={subscription.usage.members.used}
            limit={subscription.usage.members.limit}
          />
          
          <UsageBar
            label="Workflows"
            used={subscription.usage.workflows.used}
            limit={subscription.usage.workflows.limit}
          />
          
          <UsageBar
            label="Executions"
            used={subscription.usage.executions.used}
            limit={subscription.usage.executions.limit}
          />
          
          <UsageBar
            label="Storage"
            used={subscription.usage.storage.used}
            limit={subscription.usage.storage.limit}
            unit="GB"
          />
        </div>
      </div>
    </div>
  );
};
