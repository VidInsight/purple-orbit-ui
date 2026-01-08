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

export interface WorkspaceUsageQuotas {
  // Members
  current_member_count: number;
  member_limit: number;
  
  // Workflows
  current_workflow_count: number;
  workflow_limit: number;
  
  // Custom Scripts
  current_custom_script_count: number;
  custom_script_limit: number;
  
  // API Keys
  current_api_key_count: number;
  api_key_limit: number;
  
  // Storage
  current_storage_mb: number;
  storage_limit_mb: number;
  
  // Executions
  current_month_executions: number;
  monthly_execution_limit: number;
  
  // Concurrent Executions
  current_month_concurrent_executions: number;
  monthly_concurrent_executions: number;
  
  // Billing Period
  current_period_start: string;
  current_period_end: string;
}

export interface WorkspaceUsageQuotasApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: WorkspaceUsageQuotas;
}

/**
 * Get workspace usage and quotas from API
 * This aggregates data from the plan endpoint and other endpoints
 */
export const getWorkspaceUsageQuotas = async (workspaceId: string): Promise<WorkspaceUsageQuotasApiResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  try {
    // Get plan data which includes usage info
    const planResponse = await getCurrentWorkspacePlan(workspaceId);
    const planData = planResponse.data;

    // Get additional counts from other APIs
    const [workflowsResponse, apiKeysResponse] = await Promise.all([
      fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }).catch(() => null),
      fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }).catch(() => null),
    ]);

    let workflowCount = 0;
    if (workflowsResponse?.ok) {
      const workflowsData = await workflowsResponse.json();
      const workflows = workflowsData.data?.workflows || workflowsData.data?.items || workflowsData.data || [];
      workflowCount = Array.isArray(workflows) ? workflows.length : 0;
    }

    let apiKeyCount = 0;
    if (apiKeysResponse?.ok) {
      const apiKeysData = await apiKeysResponse.json();
      const apiKeys = apiKeysData.data?.api_keys || apiKeysData.data?.items || apiKeysData.data || [];
      apiKeyCount = Array.isArray(apiKeys) ? apiKeys.length : 0;
    }

    // Get plan limits from the plan data or fetch plan details
    let customScriptLimit = 0;
    let concurrentExecutionsLimit = 0;
    let apiKeyLimit = 0;
    
    try {
      const plansResponse = await getWorkspacePlans();
      const currentPlan = plansResponse.data.items.find((p: WorkspacePlan) => p.id === planData.plan.id);
      if (currentPlan) {
        customScriptLimit = currentPlan.max_custom_scripts_per_workspace || 0;
        concurrentExecutionsLimit = currentPlan.max_concurrent_executions || 0;
        apiKeyLimit = currentPlan.max_api_keys_per_workspace || 0;
      }
    } catch (error) {
      console.warn('Could not fetch plan details for limits:', error);
    }

    // Get custom scripts count (if there's an endpoint for workspace-specific scripts)
    let customScriptCount = 0;
    // Note: If there's a workspace-specific scripts endpoint, fetch it here
    // For now, we'll use 0 or get it from another source if available

    // Get concurrent executions count from running executions
    let concurrentExecutionsCount = 0;
    try {
      const executionsResponse = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/executions?status=RUNNING`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (executionsResponse.ok) {
        const executionsData = await executionsResponse.json();
        const runningExecutions = executionsData.data?.executions || executionsData.data?.items || executionsData.data || [];
        concurrentExecutionsCount = Array.isArray(runningExecutions) ? runningExecutions.length : 0;
      }
    } catch (error) {
      console.warn('Could not fetch concurrent executions:', error);
    }

    const usageQuotas: WorkspaceUsageQuotas = {
      current_member_count: planData.usage.members.current || 0,
      member_limit: planData.usage.members.limit || 0,
      current_workflow_count: workflowCount,
      workflow_limit: planData.usage.workflows.limit || 0,
      current_custom_script_count: customScriptCount,
      custom_script_limit: customScriptLimit,
      current_api_key_count: apiKeyCount,
      api_key_limit: apiKeyLimit,
      current_storage_mb: planData.usage.storage_mb.current || 0,
      storage_limit_mb: planData.usage.storage_mb.limit || 0,
      current_month_executions: planData.usage.monthly_executions.current || 0,
      monthly_execution_limit: planData.usage.monthly_executions.limit || 0,
      current_month_concurrent_executions: concurrentExecutionsCount,
      monthly_concurrent_executions: concurrentExecutionsLimit,
      current_period_start: planData.billing.period_start || new Date().toISOString(),
      current_period_end: planData.billing.period_end || new Date().toISOString(),
    };

    return {
      status: 'success',
      code: 200,
      message: null,
      traceId: planResponse.traceId || '',
      timestamp: planResponse.timestamp || new Date().toISOString(),
      data: usageQuotas,
    };
  } catch (error) {
    console.error('Error fetching workspace usage and quotas:', error);
    throw error;
  }
};

