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
    <div className="relative group">
      {/* Background gradient effect for popular plan */}
      {plan.popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl blur-2xl -z-10 group-hover:blur-3xl transition-all duration-300" />
      )}
      
      {/* Main card */}
      <div
        className={`relative bg-surface/80 backdrop-blur-xl border rounded-3xl p-6 sm:p-7 lg:p-8 transition-all duration-300 h-full flex flex-col ${
          plan.popular
            ? 'border-primary/60 shadow-2xl shadow-primary/20 scale-105 hover:scale-110 hover:shadow-primary/30'
            : 'border-border/60 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
        }`}
      >
        {plan.popular && (
          <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 shadow-lg border-0">
            Most Popular
          </Badge>
        )}

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {plan.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{plan.description}</p>
          
          <div className="flex items-baseline gap-2 mb-2">
            {isContactSales ? (
              <span className="text-3xl font-bold text-foreground">Contact Sales</span>
            ) : (
              <>
                <span className="text-4xl font-bold text-foreground">${price}</span>
                <span className="text-lg text-muted-foreground">
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </>
            )}
          </div>
          {billingCycle === 'annual' && !isContactSales && price > 0 && (
            <p className="text-sm text-muted-foreground">
              ${(price / 12).toFixed(2)}/month billed annually
            </p>
          )}
        </div>

        <ul className="space-y-3 mb-6 flex-grow">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-foreground leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isCurrent ? 'secondary' : isUpgrade ? 'primary' : 'ghost'}
          className="w-full mt-auto h-11 font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          onClick={() => onSelect(plan.id)}
          disabled={isCurrent}
        >
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};
