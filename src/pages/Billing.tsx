import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CurrentPlanCard } from '@/components/billing/CurrentPlanCard';
import { PlanCard } from '@/components/billing/PlanCard';
import { BillingHistoryTable } from '@/components/billing/BillingHistoryTable';
import { PaymentMethodCard } from '@/components/billing/PaymentMethodCard';
import { UpdatePaymentModal } from '@/components/billing/UpdatePaymentModal';
import { QuotasTab } from '@/components/billing/QuotasTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import {
  CurrentSubscription,
  BillingCycle,
  Invoice,
  PaymentMethod,
  BillingInfo,
  PLANS,
} from '@/types/billing';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Mail, MapPin, Edit, Check, X } from 'lucide-react';

// Mock data
const mockSubscription: CurrentSubscription = {
  planId: 'pro',
  billingCycle: 'monthly',
  startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  usage: {
    workflows: { used: 8, limit: 'unlimited' },
    executions: { used: 42350, limit: 50000 },
    storage: { used: 32.5, limit: 50 },
  },
};

const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 29.0,
    status: 'paid',
  },
  {
    id: '2',
    number: 'INV-2024-002',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 29.0,
    status: 'paid',
  },
  {
    id: '3',
    number: 'INV-2024-003',
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 29.0,
    status: 'paid',
  },
];

const mockPaymentMethod: PaymentMethod = {
  cardBrand: 'Visa',
  lastFour: '4242',
  expiryMonth: 12,
  expiryYear: 2026,
};

const mockBillingInfo: BillingInfo = {
  companyName: 'Acme Corporation',
  addressLine1: '123 Business Ave',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  country: 'United States',
  taxId: 'US123456789',
};

const Billing = () => {
  const [subscription, setSubscription] = useState(mockSubscription);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingBillingInfo, setEditingBillingInfo] = useState(false);
  const [billingInfo, setBillingInfo] = useState(mockBillingInfo);
  const [email] = useState('sarah@company.com');
  const [editingCard, setEditingCard] = useState(false);

  const handlePlanSelect = (planId: string) => {
    if (planId === 'enterprise') {
      toast({
        title: 'Contact Sales',
        description: 'Our team will reach out to discuss Enterprise options.',
      });
      return;
    }

    toast({
      title: 'Upgrade Plan',
      description: `Switching to ${planId} plan...`,
    });
  };

  const handleUpgrade = () => {
    toast({
      title: 'Upgrade Plan',
      description: 'Choose a plan below to upgrade your subscription.',
    });
  };

  const handlePaymentUpdate = (data: any) => {
    console.log('Payment method updated:', data);
  };

  const handleBillingInfoSave = () => {
    setEditingBillingInfo(false);
    toast({
      title: 'Billing Info Updated',
      description: 'Your billing information has been saved.',
    });
  };

  const handleSaveCard = () => {
    setEditingCard(false);
    toast({
      title: 'Payment Method Updated',
      description: 'Your payment method has been successfully updated.',
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Billing & Subscription"
          description="Manage your subscription, billing, and payment methods"
        />

        <Tabs defaultValue="overview" className="mt-6">
          <div className="flex justify-center mb-6">
            <TabsList className="inline-flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quotas">Quotas</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <CurrentPlanCard
              subscription={subscription}
              onUpgrade={handleUpgrade}
              onChangeCycle={(cycle) => setBillingCycle(cycle)}
            />

            {/* Payment Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>
              
              {/* Email */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-foreground">Billing Email</h4>
                    <p className="text-sm text-muted-foreground">Receipts and invoices will be sent to this email</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 px-4 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-foreground">{email}</span>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">Payment Method</h4>
                      <p className="text-sm text-muted-foreground">Manage your credit or debit card</p>
                    </div>
                  </div>
                  {!editingCard && (
                    <Button variant="ghost" size="sm" onClick={() => setEditingCard(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
                            {mockPaymentMethod.cardBrand} •••• {mockPaymentMethod.lastFour}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expires {mockPaymentMethod.expiryMonth}/{mockPaymentMethod.expiryYear}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Billing Address */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">Billing Address</h4>
                      <p className="text-sm text-muted-foreground">Address for billing and invoices</p>
                    </div>
                  </div>
                  {!editingBillingInfo && (
                    <Button variant="ghost" size="sm" onClick={() => setEditingBillingInfo(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingBillingInfo ? (
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
                      <Button variant="primary" size="sm" onClick={handleBillingInfoSave}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingBillingInfo(false)}>
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
              </div>
            </div>
          </TabsContent>

          {/* Quotas Tab */}
          <TabsContent value="quotas">
            <QuotasTab subscription={subscription} />
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant={billingCycle === 'monthly' ? 'primary' : 'ghost'}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'annual' ? 'primary' : 'ghost'}
                onClick={() => setBillingCycle('annual')}
              >
                Annual (Save 17%)
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                  currentPlanId={subscription.planId}
                  onSelect={handlePlanSelect}
                />
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <BillingHistoryTable invoices={mockInvoices} />
            </div>
          </TabsContent>
        </Tabs>

        <UpdatePaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handlePaymentUpdate}
        />
      </div>
    </PageLayout>
  );
};

export default Billing;
