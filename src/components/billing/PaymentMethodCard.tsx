import { PaymentMethod } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { CreditCard, Edit } from 'lucide-react';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onUpdate: () => void;
}

const CARD_BRAND_ICONS: Record<string, string> = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
  discover: '💳',
};

export const PaymentMethodCard = ({
  paymentMethod,
  onUpdate,
}: PaymentMethodCardProps) => {
  const isExpired =
    new Date() >
    new Date(paymentMethod.expiryYear, paymentMethod.expiryMonth - 1);

  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-2xl -z-10" />
      
      {/* Main card */}
      <div className="relative bg-surface/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl shadow-primary/5 p-8 transition-all duration-300 hover:shadow-primary/10 hover:border-border/80">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-md">
              <CreditCard className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Payment Method
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage your payment information
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onUpdate}
            className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4 p-5 bg-gradient-to-r from-surface/50 to-surface/30 rounded-xl border border-border/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Card</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {CARD_BRAND_ICONS[paymentMethod.cardBrand.toLowerCase()] || '💳'}
              </span>
              <span className="text-base font-semibold text-foreground">
                {paymentMethod.cardBrand.toUpperCase()} •••• {paymentMethod.lastFour}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <span className="text-sm font-medium text-muted-foreground">Expires</span>
            <span
              className={`text-base font-semibold ${
                isExpired ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {String(paymentMethod.expiryMonth).padStart(2, '0')}/
              {paymentMethod.expiryYear}
              {isExpired && ' (Expired)'}
            </span>
          </div>
        </div>

        {isExpired && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl backdrop-blur-sm">
            <p className="text-sm font-medium text-destructive">
              Your payment method has expired. Please update it to avoid service
              interruption.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
