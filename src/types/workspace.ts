export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  memberCount: number;
  lastAccessed: string;
  createdAt: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
  
  // Quota limits
  member_limit: number;
  current_member_count: number;
  workflow_limit: number;
  current_workflow_count: number;
  custom_script_limit: number;
  current_custom_script_count: number;
  storage_limit_mb: number;
  current_storage_mb: number;
  api_key_limit: number;
  current_api_key_count: number;
  monthly_execution_limit: number;
  current_month_executions: number;
  monthly_concurrent_executions: number;
  current_month_concurrent_executions: number;
  current_period_start: string;
  current_period_end: string;
}

export interface CreateWorkspaceData {
  name: string;
  slug: string;
  description?: string;
}
