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
