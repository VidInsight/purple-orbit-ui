import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UpdatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const UpdatePaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
}: UpdatePaymentModalProps) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onSubmit(formData);
    setIsSubmitting(false);
    handleClose();

    toast({
      title: 'Payment Method Updated',
      description: 'Your payment information has been saved successfully.',
    });
  };

  const handleClose = () => {
    setFormData({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Payment Method" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <CreditCard className="h-4 w-4 text-blue-500" />
          <p className="text-xs text-muted-foreground">
            Your payment information is encrypted and secure
          </p>
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Card Number
          </Label>
          <Input
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                cardNumber: formatCardNumber(e.target.value),
              }))
            }
            maxLength={19}
            required
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Cardholder Name
          </Label>
          <Input
            placeholder="John Doe"
            value={formData.cardholderName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cardholderName: e.target.value }))
            }
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Month
            </Label>
            <Input
              placeholder="MM"
              value={formData.expiryMonth}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                setFormData((prev) => ({ ...prev, expiryMonth: value }));
              }}
              maxLength={2}
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Year
            </Label>
            <Input
              placeholder="YY"
              value={formData.expiryYear}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                setFormData((prev) => ({ ...prev, expiryYear: value }));
              }}
              maxLength={2}
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              CVV
            </Label>
            <Input
              placeholder="123"
              value={formData.cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setFormData((prev) => ({ ...prev, cvv: value }));
              }}
              maxLength={4}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Update Payment Method
          </Button>
        </div>
      </form>
    </Modal>
  );
};
