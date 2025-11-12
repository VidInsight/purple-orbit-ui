import { CurrentSubscription, BillingCycle, PLANS } from '@/types/billing';
import { Button } from '@/components/ui/Button';
import { UsageBar } from './UsageBar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface CurrentPlanCardProps {
  subscription: CurrentSubscription;
  onUpgrade: () => void;
  onChangeCycle: (cycle: BillingCycle) => void;
}

export const CurrentPlanCard = ({
  subscription,
  onUpgrade,
  onChangeCycle,
}: CurrentPlanCardProps) => {
  const plan = PLANS.find((p) => p.id === subscription.planId);
  if (!plan) return null;

  const price =
    subscription.billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  const isAnnual = subscription.billingCycle === 'annual';

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-semibold text-foreground">{plan.name} Plan</h3>
            {subscription.planId === 'pro' && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Current
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
          <div className="flex items-baseline gap-1">
            {price > 0 ? (
              <>
                <span className="text-3xl font-bold text-foreground">${price}</span>
                <span className="text-muted-foreground">
                  /{isAnnual ? 'year' : 'month'}
                </span>
                {isAnnual && (
                  <Badge variant="secondary" className="ml-2">
                    Save ${(plan.monthlyPrice * 12 - plan.annualPrice).toFixed(0)}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-3xl font-bold text-foreground">Free</span>
            )}
          </div>
        </div>

        {subscription.planId !== 'enterprise' && (
          <Button variant="primary" onClick={onUpgrade}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </div>

      <div className="mb-6 p-4 bg-surface rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Current billing period</p>
        <p className="text-sm font-medium text-foreground">
          {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Usage this period</h4>
        
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
  );
};
