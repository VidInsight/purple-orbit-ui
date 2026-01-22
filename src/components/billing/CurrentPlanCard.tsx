import { CurrentSubscription, BillingCycle, Plan } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { UsageBar } from './UsageBar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface CurrentPlanCardProps {
  subscription: CurrentSubscription;
  onUpgrade: () => void;
  onChangeCycle: (cycle: BillingCycle) => void;
  plans?: Plan[];
}

export const CurrentPlanCard = ({
  subscription,
  onUpgrade,
  onChangeCycle,
  plans = [],
}: CurrentPlanCardProps) => {
  // Try to find plan from provided plans array, otherwise use subscription data
  const plan = plans.find((p) => p.id === subscription.planId);
  
  // If plan not found in plans array, create a basic plan object from subscription
  const planData: Plan = plan || {
    id: subscription.planId,
    name: subscription.planId,
    description: 'Current plan',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [],
    limits: {
      workflows: subscription.usage.workflows.limit,
      executions: subscription.usage.executions.limit,
      storage: subscription.usage.storage.limit,
    },
  };

  const price =
    subscription.billingCycle === 'monthly' ? planData.monthlyPrice : planData.annualPrice;
  const isAnnual = subscription.billingCycle === 'annual';

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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl blur-3xl -z-10" />
      
      {/* Main card */}
      <div className="relative bg-surface/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl shadow-primary/5 p-8 transition-all duration-300 hover:shadow-primary/10 hover:border-border/80">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {planData.name} Plan
              </h3>
              <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 text-sm font-semibold shadow-md">
                Current
              </Badge>
            </div>
            <p className="text-base text-muted-foreground mb-4">{planData.description}</p>
            <div className="flex items-baseline gap-2">
              {price > 0 ? (
                <>
                  <span className="text-4xl font-bold text-foreground">${price}</span>
                  <span className="text-lg text-muted-foreground">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                  {isAnnual && planData.monthlyPrice > 0 && (
                    <Badge variant="secondary" className="ml-3 px-3 py-1 text-sm font-semibold">
                      Save ${(planData.monthlyPrice * 12 - planData.annualPrice).toFixed(0)}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-4xl font-bold text-foreground">Free</span>
              )}
            </div>
          </div>

          {price === 0 && planData.monthlyPrice === 0 && planData.annualPrice === 0 ? null : (
            <Button 
              variant="primary" 
              onClick={onUpgrade}
              className="h-11 px-6 font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Upgrade Plan
            </Button>
          )}
        </div>

        <div className="mb-8 p-5 bg-gradient-to-r from-surface/50 to-surface/30 rounded-xl border border-border/40 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-1.5 font-medium">Current billing period</p>
          <p className="text-base font-semibold text-foreground">
            {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
          </p>
        </div>

        <div className="space-y-5">
          <h4 className="text-lg font-bold text-foreground mb-1">Usage this period</h4>
          
          <div className="space-y-5">
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
    </div>
  );
};
