import { Plan, BillingCycle } from '@/types/billing';
import { Button } from '@/components/ui/button';
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
  const isEnterprise = plan.id === 'enterprise' || (plan.monthlyPrice === 0 && plan.annualPrice === 0 && plan.name.toLowerCase().includes('enterprise'));
  const isContactSales = price === 0 && plan.monthlyPrice === 0 && plan.annualPrice === 0;
  
  // Determine plan tier for button text based on price
  // For API plans, we'll use price as a proxy for tier
  const getPlanTier = (planId: string, monthlyPrice: number) => {
    // Legacy plan IDs
    const legacyTiers: Record<string, number> = { free: 0, pro: 1, enterprise: 2 };
    if (legacyTiers[planId]) return legacyTiers[planId];
    
    // Use price as tier indicator (higher price = higher tier)
    if (monthlyPrice === 0) return 0;
    if (monthlyPrice < 50) return 1;
    if (monthlyPrice < 200) return 2;
    return 3;
  };
  
  const currentTier = getPlanTier(currentPlanId, 0); // We don't have current plan price, so use 0
  const planTier = getPlanTier(plan.id, plan.monthlyPrice);
  const isUpgrade = planTier > currentTier;
  const isDowngrade = planTier < currentTier;
  
  const getButtonText = () => {
    if (isCurrent) return 'Current Plan';
    if (isContactSales) return 'Contact Sales';
    if (isUpgrade) return 'Upgrade';
    if (isDowngrade) return 'Downgrade';
    return 'Select Plan';
  };

  return (
    <div
      className={`relative bg-card border rounded-lg p-4 sm:p-5 lg:p-6 transition-all h-full flex flex-col ${
        plan.popular
          ? 'border-primary shadow-lg sm:scale-105'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs sm:text-sm px-2 sm:px-3">
          Most Popular
        </Badge>
      )}

      <div className="mb-4 sm:mb-5">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{plan.description}</p>
        
        <div className="flex items-baseline gap-1">
          {isContactSales ? (
            <span className="text-xl sm:text-2xl font-bold text-foreground">Contact Sales</span>
          ) : (
            <>
              <span className="text-2xl sm:text-3xl font-bold text-foreground">${price}</span>
              <span className="text-sm sm:text-base text-muted-foreground">
                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </span>
            </>
          )}
        </div>
        {billingCycle === 'annual' && !isContactSales && price > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            ${(price / 12).toFixed(2)}/month billed annually
          </p>
        )}
      </div>

      <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-foreground leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isCurrent ? 'secondary' : isUpgrade ? 'primary' : 'ghost'}
        className="w-full mt-auto text-sm sm:text-base"
        onClick={() => onSelect(plan.id)}
        disabled={isCurrent}
      >
        {getButtonText()}
      </Button>
    </div>
  );
};
