const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

export interface WorkspacePlanApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    items: WorkspacePlan[];
  };
}

export interface WorkspacePlan {
  id: string;
  name: string;
  description: string;
  display_order: number;
  max_members_per_workspace: number;
  max_workflows_per_workspace: number;
  max_custom_scripts_per_workspace: number;
  storage_limit_mb_per_workspace: number;
  max_file_size_mb_per_workspace: number;
  monthly_execution_limit: number;
  max_concurrent_executions: number;
  can_use_custom_scripts: boolean;
  can_use_api_access: boolean;
  can_use_webhooks: boolean;
  can_use_scheduling: boolean;
  can_export_data: boolean;
  max_api_keys_per_workspace: number;
  api_rate_limit_per_minute: number;
  api_rate_limit_per_hour: number;
  api_rate_limit_per_day: number;
  monthly_price_usd: number;
  yearly_price_usd: number;
  price_per_extra_member_usd: number;
  price_per_extra_workflow_usd: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all workspace plans from API
 */
export const getWorkspacePlans = async (): Promise<WorkspacePlanApiResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspace-plans`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch workspace plans: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface CurrentWorkspacePlanApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    workspace_id: string;
    plan: {
      id: string;
      name: string;
      display_name: string;
    };
    usage: {
      members: {
        current: number;
        limit: number;
        percentage: number;
      };
      workflows: {
        current: number;
        limit: number;
        percentage: number;
      };
      storage_mb: {
        current: number;
        limit: number;
        percentage: number;
      };
      monthly_executions: {
        current: number;
        limit: number;
        percentage: number;
      };
    };
    billing: {
      period_start: string;
      period_end: string;
      stripe_subscription_id: string | null;
      currency: string;
    };
  };
}

/**
 * Get current workspace plan from API
 */
export const getCurrentWorkspacePlan = async (workspaceId: string): Promise<CurrentWorkspacePlanApiResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/plan`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch workspace plan: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

