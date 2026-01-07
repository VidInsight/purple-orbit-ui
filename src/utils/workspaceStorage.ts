import { Workspace } from '@/types/workspace';

const STORAGE_KEY = 'automation_workspaces';

export const getWorkspaces = (): Workspace[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Return empty array if no workspaces exist
    return [];
  } catch (error) {
    console.error('Error loading workspaces:', error);
    return [];
  }
};

export const saveWorkspaces = (workspaces: Workspace[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
    // Dispatch custom event to notify WorkspaceContext in the same tab
    window.dispatchEvent(new Event('workspaceStorageChange'));
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

export const updateWorkspace = (workspaceId: string, updates: Partial<Workspace>): void => {
  const workspaces = getWorkspaces();
  const workspaceIndex = workspaces.findIndex((w) => w.id === workspaceId);
  
  if (workspaceIndex !== -1) {
    workspaces[workspaceIndex] = {
      ...workspaces[workspaceIndex],
      ...updates,
    };
    saveWorkspaces(workspaces);
  }
};

export const setCurrentWorkspace = (workspaceId: string): void => {
  try {
    localStorage.setItem('current_workspace', workspaceId);
    updateWorkspaceAccess(workspaceId);
    // Dispatch custom event to notify WorkspaceContext in the same tab
    window.dispatchEvent(new Event('workspaceStorageChange'));
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
