import { useState, useEffect } from 'react';
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
import {
  CurrentSubscription,
  BillingCycle,
  Invoice,
  PaymentMethod,
  BillingInfo,
  Plan,
} from '@/types/billing';
import { toast } from '@/hooks/use-toast';
import { getWorkspacePlans, getCurrentWorkspacePlan, WorkspacePlan } from '@/services/billingApi';
import { useWorkspace } from '@/context/WorkspaceContext';

// Mock data
const mockSubscription: CurrentSubscription = {
  planId: 'pro',
  billingCycle: 'monthly',
  startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  usage: {
    members: { used: 3, limit: 5 },
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

// Helper function to convert API plan to Plan format
const convertApiPlanToPlan = (apiPlan: WorkspacePlan): Plan => {
  const storageGB = apiPlan.storage_limit_mb_per_workspace / 1024;
  const workflowsLimit = apiPlan.max_workflows_per_workspace === -1 || apiPlan.max_workflows_per_workspace > 1000 
    ? 'unlimited' 
    : apiPlan.max_workflows_per_workspace;
  
  const features: string[] = [];
  
  // Add basic limits
  if (workflowsLimit === 'unlimited') {
    features.push('Unlimited workflows');
  } else {
    features.push(`${workflowsLimit} workflows`);
  }
  
  features.push(`${apiPlan.monthly_execution_limit.toLocaleString()} executions/month`);
  features.push(`${storageGB.toFixed(storageGB >= 1 ? 0 : 1)}GB storage`);
  
  // Add feature flags
  if (apiPlan.can_use_custom_scripts) {
    features.push(`${apiPlan.max_custom_scripts_per_workspace} custom scripts`);
  }
  
  if (apiPlan.can_use_api_access) {
    features.push('API access');
    features.push(`${apiPlan.max_api_keys_per_workspace} API keys`);
  }
  
  if (apiPlan.can_use_webhooks) {
    features.push('Webhooks');
  }
  
  if (apiPlan.can_use_scheduling) {
    features.push('Scheduling');
  }
  
  if (apiPlan.can_export_data) {
    features.push('Data export');
  }
  
  features.push(`${apiPlan.max_members_per_workspace} team member${apiPlan.max_members_per_workspace !== 1 ? 's' : ''}`);
  
  // Determine if plan is popular (usually the middle tier)
  const isPopular = apiPlan.display_order === 1 || apiPlan.display_order === 2;

  return {
    id: apiPlan.id,
    name: apiPlan.name,
    description: apiPlan.description,
    monthlyPrice: apiPlan.monthly_price_usd,
    annualPrice: apiPlan.yearly_price_usd,
    features,
    limits: {
      workflows: workflowsLimit,
      executions: apiPlan.monthly_execution_limit,
      storage: storageGB,
    },
    popular: isPopular,
  };
};

const Billing = () => {
  const { currentWorkspace } = useWorkspace();
  const [subscription, setSubscription] = useState(mockSubscription);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [billingInfo, setBillingInfo] = useState(mockBillingInfo);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Fetch current workspace plan
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!currentWorkspace?.id) {
        setSubscriptionLoading(false);
        return;
      }

      try {
        setSubscriptionLoading(true);
        const response = await getCurrentWorkspacePlan(currentWorkspace.id);
        
        // Convert API response to CurrentSubscription format
        const storageGB = response.data.usage.storage_mb.limit / 1024;
        const storageUsedGB = response.data.usage.storage_mb.current / 1024;
        const workflowsLimit = response.data.usage.workflows.limit === -1 || response.data.usage.workflows.limit > 1000 
          ? 'unlimited' 
          : response.data.usage.workflows.limit;

        // Determine billing cycle from period dates (if period is ~30 days, it's monthly, if ~365 days, it's annual)
        const periodStart = new Date(response.data.billing.period_start);
        const periodEnd = new Date(response.data.billing.period_end);
        const daysDiff = Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        const detectedCycle: BillingCycle = daysDiff > 300 ? 'annual' : 'monthly';

        setSubscription({
          planId: response.data.plan.id,
          billingCycle: detectedCycle,
          startDate: response.data.billing.period_start,
          endDate: response.data.billing.period_end,
          usage: {
            members: {
              used: response.data.usage.members.current,
              limit: response.data.usage.members.limit,
            },
            workflows: {
              used: response.data.usage.workflows.current,
              limit: workflowsLimit,
            },
            executions: {
              used: response.data.usage.monthly_executions.current,
              limit: response.data.usage.monthly_executions.limit,
            },
            storage: {
              used: storageUsedGB,
              limit: storageGB,
            },
          },
        });

        setBillingCycle(detectedCycle);
      } catch (error) {
        console.error('Error fetching current plan:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load current plan',
          variant: 'destructive',
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchCurrentPlan();
  }, [currentWorkspace?.id]);

  // Fetch all available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await getWorkspacePlans();
        const convertedPlans = response.data.items
          .sort((a, b) => a.display_order - b.display_order)
          .map(convertApiPlanToPlan);
        setPlans(convertedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load plans',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

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
            {subscriptionLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading subscription...</p>
              </div>
            ) : (
              <CurrentPlanCard
                subscription={subscription}
                onUpgrade={handleUpgrade}
                onChangeCycle={(cycle) => setBillingCycle(cycle)}
                plans={plans}
              />
            )}
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
            {subscriptionLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading quotas...</p>
              </div>
            ) : (
              <QuotasTab subscription={subscription} />
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6 mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-10">
              <Button
                variant={billingCycle === 'monthly' ? 'primary' : 'ghost'}
                onClick={() => setBillingCycle('monthly')}
                className="w-full sm:w-auto min-w-[120px]"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'annual' ? 'primary' : 'ghost'}
                onClick={() => setBillingCycle('annual')}
                className="w-full sm:w-auto min-w-[120px]"
              >
                Annual (Save 17%)
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No plans available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    billingCycle={billingCycle}
                    currentPlanId={subscription.planId}
                    onSelect={handlePlanSelect}
                  />
                ))}
              </div>
            )}
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
