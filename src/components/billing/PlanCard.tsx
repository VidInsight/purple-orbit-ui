import { Plan, BillingCycle } from '@/types/billing';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PlanCardProps {
  plan: Plan;
  billingCycle: BillingCycle;
  currentPlanId: string;
  onSelect: (planId: string) => void;
}

export const PlanCard = ({ plan, billingCycle, currentPlanId, onSelect }: PlanCardProps) => {
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  const isCurrent = plan.id === currentPlanId;
  const isEnterprise = plan.id === 'enterprise';
  
  // Determine plan tier for button text
  const planTiers = { free: 0, pro: 1, enterprise: 2 };
  const currentTier = planTiers[currentPlanId as keyof typeof planTiers] || 0;
  const planTier = planTiers[plan.id as keyof typeof planTiers] || 0;
  const isUpgrade = planTier > currentTier;
  const isDowngrade = planTier < currentTier;
  
  const getButtonText = () => {
    if (isCurrent) return 'Current Plan';
    if (isEnterprise) return 'Contact Sales';
    if (isUpgrade) return 'Upgrade';
    if (isDowngrade) return 'Downgrade';
    return 'Select Plan';
  };

  return (
    <div
      className={`relative bg-card border rounded-lg p-6 transition-all ${
        plan.popular
          ? 'border-primary shadow-lg scale-105'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
        
        <div className="flex items-baseline gap-1">
          {isEnterprise ? (
            <span className="text-2xl font-bold text-foreground">Contact Sales</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-foreground">${price}</span>
              <span className="text-muted-foreground">
                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </span>
            </>
          )}
        </div>
        {billingCycle === 'annual' && !isEnterprise && price > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            ${(price / 12).toFixed(2)}/month billed annually
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isCurrent ? 'secondary' : isUpgrade ? 'primary' : 'ghost'}
        className="w-full"
        onClick={() => onSelect(plan.id)}
        disabled={isCurrent}
      >
        {getButtonText()}
      </Button>
    </div>
  );
};
