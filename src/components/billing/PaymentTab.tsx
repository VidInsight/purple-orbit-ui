import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentMethod, BillingInfo } from '@/types/billing';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Mail, MapPin, Edit, Check, X } from 'lucide-react';

interface PaymentTabProps {
  paymentMethod: PaymentMethod;
  billingInfo: BillingInfo;
  onPaymentMethodUpdate: (data: any) => void;
  onBillingInfoUpdate: (info: BillingInfo) => void;
}

export const PaymentTab = ({
  paymentMethod,
  billingInfo: initialBillingInfo,
  onPaymentMethodUpdate,
  onBillingInfoUpdate,
}: PaymentTabProps) => {
  const [email] = useState('sarah@company.com');
  const [editingCard, setEditingCard] = useState(false);
  const [editingBilling, setEditingBilling] = useState(false);
  const [billingInfo, setBillingInfo] = useState(initialBillingInfo);

  const handleSaveCard = () => {
    setEditingCard(false);
    toast({
      title: 'Payment Method Updated',
      description: 'Your payment method has been successfully updated.',
    });
    onPaymentMethodUpdate({});
  };

  const handleSaveBilling = () => {
    setEditingBilling(false);
    toast({
      title: 'Billing Address Updated',
      description: 'Your billing address has been successfully updated.',
    });
    onBillingInfoUpdate(billingInfo);
  };

  return (
    <div className="space-y-8">
      {/* Email */}
      <div className="relative">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-2xl -z-10" />
        
        {/* Card */}
        <div className="relative bg-surface/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl shadow-primary/5 p-8 transition-all duration-300 hover:shadow-primary/10 hover:border-border/80">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-md">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Billing Email</h3>
              <p className="text-sm text-muted-foreground">Receipts and invoices will be sent to this email</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 px-5 bg-gradient-to-r from-surface/50 to-surface/30 rounded-xl border border-border/40 backdrop-blur-sm">
            <span className="text-base font-semibold text-foreground">{email}</span>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors">
              <Edit className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="relative">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-2xl -z-10" />
        
        {/* Card */}
        <div className="relative bg-surface/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl shadow-primary/5 p-8 transition-all duration-300 hover:shadow-primary/10 hover:border-border/80">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-md">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Payment Method</h3>
                <p className="text-sm text-muted-foreground">Manage your credit or debit card</p>
              </div>
            </div>
            {!editingCard && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingCard(true)}
                className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Edit className="h-4.5 w-4.5" />
              </Button>
            )}
          </div>
          <div>
            {editingCard ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="cardNumber" className="text-sm font-semibold mb-2 block">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry" className="text-sm font-semibold mb-2 block">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc" className="text-sm font-semibold mb-2 block">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleSaveCard}
                    className="h-10 px-6 font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <Check className="h-4.5 w-4.5 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditingCard(false)}
                    className="h-10 px-6"
                  >
                    <X className="h-4.5 w-4.5 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4 px-5 bg-gradient-to-r from-surface/50 to-surface/30 rounded-xl border border-border/40 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {paymentMethod.cardBrand} •••• {paymentMethod.lastFour}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="relative">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl blur-2xl -z-10" />
        
        {/* Card */}
        <div className="relative bg-surface/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl shadow-primary/5 p-8 transition-all duration-300 hover:shadow-primary/10 hover:border-border/80">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-md">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Billing Address</h3>
                <p className="text-sm text-muted-foreground">Address for billing and invoices</p>
              </div>
            </div>
            {!editingBilling && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingBilling(true)}
                className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Edit className="h-4.5 w-4.5" />
              </Button>
            )}
          </div>
          <div>
            {editingBilling ? (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="companyName" className="text-sm font-semibold mb-2 block">Company Name</Label>
                  <Input
                    id="companyName"
                    value={billingInfo.companyName}
                    onChange={(e) =>
                      setBillingInfo((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine1" className="text-sm font-semibold mb-2 block">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={billingInfo.addressLine1}
                    onChange={(e) =>
                      setBillingInfo((prev) => ({ ...prev, addressLine1: e.target.value }))
                    }
                    className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2" className="text-sm font-semibold mb-2 block">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    value={billingInfo.addressLine2 || ''}
                    onChange={(e) =>
                      setBillingInfo((prev) => ({ ...prev, addressLine2: e.target.value }))
                    }
                    className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-semibold mb-2 block">City</Label>
                    <Input
                      id="city"
                      value={billingInfo.city}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-semibold mb-2 block">State</Label>
                    <Input
                      id="state"
                      value={billingInfo.state}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, state: e.target.value }))
                      }
                      className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode" className="text-sm font-semibold mb-2 block">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={billingInfo.zipCode}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, zipCode: e.target.value }))
                      }
                      className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm font-semibold mb-2 block">Country</Label>
                    <Input
                      id="country"
                      value={billingInfo.country}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, country: e.target.value }))
                      }
                      className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="taxId" className="text-sm font-semibold mb-2 block">Tax ID (Optional)</Label>
                  <Input
                    id="taxId"
                    value={billingInfo.taxId || ''}
                    onChange={(e) =>
                      setBillingInfo((prev) => ({ ...prev, taxId: e.target.value }))
                    }
                    className="h-11 rounded-xl border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleSaveBilling}
                    className="h-10 px-6 font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <Check className="h-4.5 w-4.5 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditingBilling(false)}
                    className="h-10 px-6"
                  >
                    <X className="h-4.5 w-4.5 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4 px-5 bg-gradient-to-r from-surface/50 to-surface/30 rounded-xl border border-border/40 backdrop-blur-sm space-y-3">
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {billingInfo.companyName}
                  </p>
                  <p className="text-sm text-muted-foreground">{billingInfo.addressLine1}</p>
                  {billingInfo.addressLine2 && (
                    <p className="text-sm text-muted-foreground">{billingInfo.addressLine2}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{billingInfo.country}</p>
                </div>
                {billingInfo.taxId && (
                  <div className="pt-3 border-t border-border/40">
                    <p className="text-xs text-muted-foreground mb-1">Tax ID</p>
                    <p className="text-sm font-semibold text-foreground">{billingInfo.taxId}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
