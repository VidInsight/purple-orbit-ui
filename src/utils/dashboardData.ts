export interface DashboardStats {
  totalWorkflows: number;
  activeExecutions: number;
  totalCredentials: number;
  storageUsed: string;
  trends: {
    workflows: string;
    executions: string;
    credentials: string;
    storage: string;
  };
}

export interface RecentWorkflow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'draft';
  timestamp: string;
}

export interface RecentExecution {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running';
  timestamp: string;
}

export const generateDashboardStats = (): DashboardStats => {
  return {
    totalWorkflows: 45,
    activeExecutions: 12,
    totalCredentials: 25,
    storageUsed: '2.4 GB',
    trends: {
      workflows: '+5% this week',
      executions: '+12% this week',
      credentials: '+3% this month',
      storage: '+8% this month',
    },
  };
};

export const generateRecentWorkflows = (): RecentWorkflow[] => {
  const statuses: Array<'active' | 'inactive' | 'draft'> = ['active', 'inactive', 'draft'];
  return Array.from({ length: 5 }, (_, i) => ({
    id: `workflow-${i + 1}`,
    name: `Workflow ${i + 1}`,
    status: statuses[i % 3],
    timestamp: new Date(
      Date.now() - Math.random() * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));
};

export const generateRecentExecutions = (): RecentExecution[] => {
  const statuses: Array<'success' | 'failed' | 'running'> = ['success', 'failed', 'running'];
  return Array.from({ length: 5 }, (_, i) => ({
    id: `execution-${i + 1}`,
    name: `Workflow ${Math.floor(Math.random() * 10) + 1} Execution`,
    status: statuses[i % 3],
    timestamp: new Date(
      Date.now() - Math.random() * 12 * 60 * 60 * 1000
    ).toISOString(),
  }));
};

export interface ExecutionStats {
  success: number;
  failed: number;
  running: number;
}

export interface PeakUsageData {
  hour: string;
  executions: number;
}

export interface ExpiringCredential {
  id: string;
  name: string;
  service: string;
  daysUntilExpiry: number;
}

export interface QuotaWarning {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

export const generateExecutionStats = (): ExecutionStats => {
  return {
    success: 245,
    failed: 15,
    running: 5,
  };
};

export const generatePeakUsageData = (): PeakUsageData[] => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return hours.map((hour) => ({
    hour,
    executions: Math.floor(Math.random() * 50) + 5,
  }));
};

export const generateExpiringCredentials = (): ExpiringCredential[] => {
  const services = ['AWS', 'Google Cloud', 'Azure', 'Stripe', 'SendGrid'];
  const credentials: ExpiringCredential[] = [
    {
      id: 'cred-1',
      name: 'AWS Production API Key',
      service: services[0],
      daysUntilExpiry: 5,
    },
    {
      id: 'cred-2',
      name: 'Stripe Webhook Secret',
      service: services[3],
      daysUntilExpiry: 12,
    },
    {
      id: 'cred-3',
      name: 'SendGrid API Token',
      service: services[4],
      daysUntilExpiry: 23,
    },
  ];

  return credentials;
};

export const generateQuotaWarnings = (): QuotaWarning[] => {
  return [
    {
      label: 'Workflows',
      used: 85,
      limit: 100,
    },
    {
      label: 'Executions',
      used: 4600,
      limit: 5000,
    },
    {
      label: 'Storage',
      used: 7.8,
      limit: 10,
      unit: 'GB',
    },
  ];
};
