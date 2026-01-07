export type PlanType = 'free' | 'pro' | 'enterprise' | string; // Allow string for API plan IDs
export type BillingCycle = 'monthly' | 'annual';
export type InvoiceStatus = 'paid' | 'pending' | 'failed';

export interface Plan {
  id: string; // Changed from PlanType to string to support API plan IDs
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limits: {
    workflows: number | 'unlimited';
    executions: number;
    storage: number; // in GB
  };
  popular?: boolean;
}

export interface CurrentSubscription {
  planId: PlanType;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  usage: {
    members: { used: number; limit: number };
    workflows: { used: number; limit: number | 'unlimited' };
    executions: { used: number; limit: number };
    storage: { used: number; limit: number }; // in GB
  };
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  downloadUrl?: string;
}

export interface PaymentMethod {
  cardBrand: string;
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface BillingInfo {
  companyName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      '10 workflows',
      '1,000 executions/month',
      '5GB storage',
      'Email support',
      'Basic integrations',
    ],
    limits: {
      workflows: 10,
      executions: 1000,
      storage: 5,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional teams',
    monthlyPrice: 29,
    annualPrice: 290, // ~$24/month
    features: [
      'Unlimited workflows',
      '50,000 executions/month',
      '50GB storage',
      'Priority support',
      'Advanced features',
      'Custom integrations',
      'Team collaboration',
    ],
    limits: {
      workflows: 'unlimited',
      executions: 50000,
      storage: 50,
    },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 0, // Contact sales
    annualPrice: 0,
    features: [
      'Everything in Pro',
      'Unlimited executions',
      'Unlimited storage',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Advanced security',
      'Custom contracts',
    ],
    limits: {
      workflows: 'unlimited',
      executions: Infinity,
      storage: Infinity,
    },
  },
];
