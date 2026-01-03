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
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Payment Method
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage your payment information
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onUpdate}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 p-4 bg-surface rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Card</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {CARD_BRAND_ICONS[paymentMethod.cardBrand.toLowerCase()] || '💳'}
            </span>
            <span className="text-sm font-medium text-foreground">
              {paymentMethod.cardBrand.toUpperCase()} •••• {paymentMethod.lastFour}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Expires</span>
          <span
            className={`text-sm font-medium ${
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
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            Your payment method has expired. Please update it to avoid service
            interruption.
          </p>
        </div>
      )}
    </div>
  );
};
