import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CurrentPlanCard } from '@/components/billing/CurrentPlanCard';
import { PlanCard } from '@/components/billing/PlanCard';
import { BillingHistoryTable } from '@/components/billing/BillingHistoryTable';
import { PaymentMethodCard } from '@/components/billing/PaymentMethodCard';
import { UpdatePaymentModal } from '@/components/billing/UpdatePaymentModal';
import { QuotasTab } from '@/components/billing/QuotasTab';
import { PaymentTab } from '@/components/billing/PaymentTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  CurrentSubscription,
  BillingCycle,
  Invoice,
  PaymentMethod,
  BillingInfo,
  PLANS,
} from '@/types/billing';
import { toast } from '@/hooks/use-toast';

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

  const handleBillingInfoUpdate = (info: BillingInfo) => {
    setBillingInfo(info);
  };

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px]">
        <PageHeader
          title="Billing & Subscription"
          description="Manage your subscription, billing, and payment methods"
        />

        <Tabs defaultValue="overview" className="mt-6">
          <div className="flex justify-center mb-6">
            <TabsList className="inline-flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
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
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment">
            <PaymentTab
              paymentMethod={mockPaymentMethod}
              billingInfo={billingInfo}
              onPaymentMethodUpdate={handlePaymentUpdate}
              onBillingInfoUpdate={handleBillingInfoUpdate}
            />
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

            <div className="grid md:grid-cols-3 gap-8">
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
