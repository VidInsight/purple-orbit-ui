import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { PaymentMethod, BillingInfo } from '@/types/billing';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Mail, MapPin, Edit, Check, X } from 'lucide-react';

const mockPaymentMethod: PaymentMethod = {
  cardBrand: 'Visa',
  lastFour: '4242',
  expiryMonth: 12,
  expiryYear: 2026,
};

const mockBillingInfo: BillingInfo = {
  companyName: 'Acme Corporation',
  addressLine1: '123 Business Ave',
  addressLine2: 'Suite 100',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  country: 'United States',
  taxId: 'US123456789',
};

const Payment = () => {
  const [email] = useState('sarah@company.com');
  const [paymentMethod, setPaymentMethod] = useState(mockPaymentMethod);
  const [billingInfo, setBillingInfo] = useState(mockBillingInfo);
  const [editingCard, setEditingCard] = useState(false);
  const [editingBilling, setEditingBilling] = useState(false);

  const handleSaveCard = () => {
    setEditingCard(false);
    toast({
      title: 'Payment Method Updated',
      description: 'Your payment method has been successfully updated.',
    });
  };

  const handleSaveBilling = () => {
    setEditingBilling(false);
    toast({
      title: 'Billing Address Updated',
      description: 'Your billing address has been successfully updated.',
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Payment Information"
          description="Manage your payment methods and billing details"
        />

        <div className="mt-6 space-y-6">
          {/* Email */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Billing Email</CardTitle>
                  <CardDescription>Receipts and invoices will be sent to this email</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2 px-4 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-foreground">{email}</span>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Manage your credit or debit card</CardDescription>
                  </div>
                </div>
                {!editingCard && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingCard(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingCard ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" onClick={handleSaveCard}>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingCard(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-2 px-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {paymentMethod.cardBrand} •••• {paymentMethod.lastFour}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Billing Address</CardTitle>
                    <CardDescription>Address for billing and invoices</CardDescription>
                  </div>
                </div>
                {!editingBilling && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingBilling(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingBilling ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={billingInfo.companyName}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, companyName: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={billingInfo.addressLine1}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, addressLine1: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      value={billingInfo.addressLine2 || ''}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, addressLine2: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={billingInfo.city}
                        onChange={(e) =>
                          setBillingInfo((prev) => ({ ...prev, city: e.target.value }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={billingInfo.state}
                        onChange={(e) =>
                          setBillingInfo((prev) => ({ ...prev, state: e.target.value }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        value={billingInfo.zipCode}
                        onChange={(e) =>
                          setBillingInfo((prev) => ({ ...prev, zipCode: e.target.value }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={billingInfo.country}
                        onChange={(e) =>
                          setBillingInfo((prev) => ({ ...prev, country: e.target.value }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="taxId">Tax ID (Optional)</Label>
                    <Input
                      id="taxId"
                      value={billingInfo.taxId || ''}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, taxId: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" onClick={handleSaveBilling}>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingBilling(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-2 px-4 bg-muted/30 rounded-lg space-y-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {billingInfo.companyName}
                    </p>
                    <p className="text-xs text-muted-foreground">{billingInfo.addressLine1}</p>
                    {billingInfo.addressLine2 && (
                      <p className="text-xs text-muted-foreground">{billingInfo.addressLine2}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}
                    </p>
                    <p className="text-xs text-muted-foreground">{billingInfo.country}</p>
                  </div>
                  {billingInfo.taxId && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">Tax ID</p>
                      <p className="text-sm font-medium text-foreground">{billingInfo.taxId}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Payment;
