import { Workspace } from '@/types/workspace';

const STORAGE_KEY = 'automation_workspaces';

// Initialize with default workspaces if none exist
const defaultWorkspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'Personal Projects',
    slug: 'personal-projects',
    description: 'My personal automation workflows',
    memberCount: 1,
    lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'owner',
    member_limit: 5,
    current_member_count: 1,
    workflow_limit: 50,
    current_workflow_count: 12,
    custom_script_limit: 25,
    current_custom_script_count: 8,
    storage_limit_mb: 10240, // 10 GB
    current_storage_mb: 2458,
    api_key_limit: 10,
    current_api_key_count: 3,
    monthly_execution_limit: 10000,
    current_month_executions: 3240,
    monthly_concurrent_executions: 5,
    current_month_concurrent_executions: 2,
    current_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    current_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  },
  {
    id: 'workspace-2',
    name: 'Company Automations',
    slug: 'company-automations',
    description: 'Team workflows and integrations for daily operations',
    memberCount: 8,
    lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'admin',
    member_limit: 25,
    current_member_count: 8,
    workflow_limit: 200,
    current_workflow_count: 87,
    custom_script_limit: 100,
    current_custom_script_count: 42,
    storage_limit_mb: 51200, // 50 GB
    current_storage_mb: 35890,
    api_key_limit: 50,
    current_api_key_count: 18,
    monthly_execution_limit: 100000,
    current_month_executions: 78450,
    monthly_concurrent_executions: 20,
    current_month_concurrent_executions: 15,
    current_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    current_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  },
  {
    id: 'workspace-3',
    name: 'Client Projects',
    slug: 'client-projects',
    description: 'Automation solutions for client requirements',
    memberCount: 3,
    lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'owner',
    member_limit: 10,
    current_member_count: 3,
    workflow_limit: 100,
    current_workflow_count: 45,
    custom_script_limit: 50,
    current_custom_script_count: 23,
    storage_limit_mb: 20480, // 20 GB
    current_storage_mb: 8945,
    api_key_limit: 20,
    current_api_key_count: 7,
    monthly_execution_limit: 50000,
    current_month_executions: 28670,
    monthly_concurrent_executions: 10,
    current_month_concurrent_executions: 6,
    current_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    current_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  },
  {
    id: 'workspace-4',
    name: 'Marketing Team',
    slug: 'marketing-team',
    description: 'Shared workspace for marketing automations',
    memberCount: 5,
    lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'editor',
    member_limit: 15,
    current_member_count: 5,
    workflow_limit: 75,
    current_workflow_count: 34,
    custom_script_limit: 40,
    current_custom_script_count: 19,
    storage_limit_mb: 15360, // 15 GB
    current_storage_mb: 6234,
    api_key_limit: 15,
    current_api_key_count: 5,
    monthly_execution_limit: 25000,
    current_month_executions: 12890,
    monthly_concurrent_executions: 8,
    current_month_concurrent_executions: 4,
    current_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    current_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  },
];

export const getWorkspaces = (): Workspace[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with defaults
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWorkspaces));
    return defaultWorkspaces;
  } catch (error) {
    console.error('Error loading workspaces:', error);
    return defaultWorkspaces;
  }
};

export const saveWorkspaces = (workspaces: Workspace[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  } catch (error) {
    console.error('Error saving workspaces:', error);
  }
};

export const createWorkspace = (name: string, slug: string, description?: string): Workspace => {
  const newWorkspace: Workspace = {
    id: `workspace-${Date.now()}`,
    name,
    slug,
    description,
    memberCount: 1,
    lastAccessed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    role: 'owner',
    member_limit: 5,
    current_member_count: 1,
    workflow_limit: 50,
    current_workflow_count: 0,
    custom_script_limit: 25,
    current_custom_script_count: 0,
    storage_limit_mb: 10240,
    current_storage_mb: 0,
    api_key_limit: 10,
    current_api_key_count: 0,
    monthly_execution_limit: 10000,
    current_month_executions: 0,
    monthly_concurrent_executions: 5,
    current_month_concurrent_executions: 0,
    current_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    current_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  };

  const workspaces = getWorkspaces();
  workspaces.push(newWorkspace);
  saveWorkspaces(workspaces);

  return newWorkspace;
};

export const updateWorkspaceAccess = (workspaceId: string): void => {
  const workspaces = getWorkspaces();
  const workspace = workspaces.find((w) => w.id === workspaceId);
  
  if (workspace) {
    workspace.lastAccessed = new Date().toISOString();
    saveWorkspaces(workspaces);
  }
};

export const setCurrentWorkspace = (workspaceId: string): void => {
  try {
    localStorage.setItem('current_workspace', workspaceId);
    updateWorkspaceAccess(workspaceId);
  } catch (error) {
    console.error('Error setting current workspace:', error);
  }
};

export const getCurrentWorkspace = (): string | null => {
  try {
    return localStorage.getItem('current_workspace');
  } catch (error) {
    console.error('Error getting current workspace:', error);
    return null;
  }
};
