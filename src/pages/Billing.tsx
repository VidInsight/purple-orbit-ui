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
import { Edit, Building2 } from 'lucide-react';

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

            <div className="grid md:grid-cols-2 gap-6">
              <PaymentMethodCard
                paymentMethod={mockPaymentMethod}
                onUpdate={() => setPaymentModalOpen(true)}
              />

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Billing Information
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Company and address details
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingBillingInfo(!editingBillingInfo)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {editingBillingInfo ? (
                  <div className="space-y-4">
                    <Input
                      label="Company Name"
                      value={billingInfo.companyName}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, companyName: e.target.value }))
                      }
                    />
                    <Input
                      label="Address"
                      value={billingInfo.addressLine1}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, addressLine1: e.target.value }))
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        value={billingInfo.city}
                        onChange={(e) =>
                          setBillingInfo((prev) => ({ ...prev, city: e.target.value }))
                        }
                      />
                      <Input
                        label="State"
                        value={billingInfo.state}
                        onChange={(e) =>
                          setBillingInfo((prev) => ({ ...prev, state: e.target.value }))
                        }
                      />
                    </div>
                    <Input
                      label="Tax ID"
                      value={billingInfo.taxId}
                      onChange={(e) =>
                        setBillingInfo((prev) => ({ ...prev, taxId: e.target.value }))
                      }
                    />
                    <Button variant="primary" size="sm" onClick={handleBillingInfoSave}>
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-surface rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {billingInfo.companyName}
                      </p>
                      <p className="text-sm text-muted-foreground">{billingInfo.addressLine1}</p>
                      <p className="text-sm text-muted-foreground">
                        {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}
                      </p>
                      <p className="text-sm text-muted-foreground">{billingInfo.country}</p>
                    </div>
                    {billingInfo.taxId && (
                      <div>
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
