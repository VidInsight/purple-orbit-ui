import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCurrentWorkspace, setCurrentWorkspace as saveCurrentWorkspace } from '@/utils/workspaceStorage';
import type { Workspace } from '@/types/workspace';

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, slug: string, description?: string) => Promise<Workspace>;
  updateWorkspace: (workspaceId: string, data: { name?: string; slug?: string; description?: string }) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Mock workspace data
const mockWorkspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'Development Workspace',
    slug: 'development-workspace',
    description: 'Main development environment',
    memberCount: 5,
    lastAccessed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    role: 'owner',
    plan_name: 'Pro',
    member_limit: 10,
    current_member_count: 5,
    workflow_limit: 100,
    current_workflow_count: 23,
    custom_script_limit: 50,
    current_custom_script_count: 12,
    storage_limit_mb: 5000,
    current_storage_mb: 1250,
    api_key_limit: 20,
    current_api_key_count: 8,
    monthly_execution_limit: 100000,
    current_month_executions: 45000,
    monthly_concurrent_executions: 50,
    current_month_concurrent_executions: 12,
    current_period_start: new Date(new Date().setDate(1)).toISOString(),
    current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString(),
  },
  {
    id: 'workspace-2',
    name: 'Production Workspace',
    slug: 'production-workspace',
    description: 'Production environment',
    memberCount: 3,
    lastAccessed: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7776000000).toISOString(),
    role: 'owner',
    plan_name: 'Enterprise',
    member_limit: 20,
    current_member_count: 3,
    workflow_limit: 500,
    current_workflow_count: 89,
    custom_script_limit: 200,
    current_custom_script_count: 45,
    storage_limit_mb: 20000,
    current_storage_mb: 5600,
    api_key_limit: 50,
    current_api_key_count: 15,
    monthly_execution_limit: 1000000,
    current_month_executions: 234000,
    monthly_concurrent_executions: 200,
    current_month_concurrent_executions: 45,
    current_period_start: new Date(new Date().setDate(1)).toISOString(),
    current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString(),
  },
];

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const [isLoading, setIsLoading] = useState(false);

  // Load workspace from localStorage on mount
  useEffect(() => {
    const savedWorkspaceId = getCurrentWorkspace();
    if (savedWorkspaceId) {
      const workspace = mockWorkspaces.find(w => w.id === savedWorkspaceId);
      if (workspace) {
        setCurrentWorkspaceState(workspace);
      } else {
        // Default to first workspace
        setCurrentWorkspaceState(mockWorkspaces[0]);
        saveCurrentWorkspace(mockWorkspaces[0].id);
      }
    } else {
      // Default to first workspace
      setCurrentWorkspaceState(mockWorkspaces[0]);
      saveCurrentWorkspace(mockWorkspaces[0].id);
    }
  }, []);

  const setWorkspace = useCallback(async (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspaceState(workspace);
      saveCurrentWorkspace(workspaceId);
    }
  }, [workspaces]);

  const refreshWorkspaces = useCallback(async () => {
    // Mock refresh - in real app would fetch from API
    setWorkspaces(mockWorkspaces);
  }, []);

  const createWorkspace = useCallback(async (
    name: string,
    slug: string,
    description?: string
  ): Promise<Workspace> => {
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name,
      slug,
      description,
      memberCount: 1,
      lastAccessed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      role: 'owner',
      plan_name: 'Free',
      member_limit: 5,
      current_member_count: 1,
      workflow_limit: 10,
      current_workflow_count: 0,
      custom_script_limit: 5,
      current_custom_script_count: 0,
      storage_limit_mb: 1000,
      current_storage_mb: 0,
      api_key_limit: 5,
      current_api_key_count: 0,
      monthly_execution_limit: 10000,
      current_month_executions: 0,
      monthly_concurrent_executions: 10,
      current_month_concurrent_executions: 0,
      current_period_start: new Date(new Date().setDate(1)).toISOString(),
      current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString(),
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    await setWorkspace(newWorkspace.id);
    return newWorkspace;
  }, [setWorkspace]);

  const updateWorkspace = useCallback(async (
    workspaceId: string,
    data: { name?: string; slug?: string; description?: string }
  ): Promise<void> => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, ...data } : w
    ));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspaceState(prev => prev ? { ...prev, ...data } : null);
    }
  }, [currentWorkspace]);

  const deleteWorkspace = useCallback(async (workspaceId: string): Promise<void> => {
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    if (currentWorkspace?.id === workspaceId) {
      const remaining = workspaces.filter(w => w.id !== workspaceId);
      if (remaining.length > 0) {
        await setWorkspace(remaining[0].id);
      } else {
        setCurrentWorkspaceState(null);
        localStorage.removeItem('current_workspace');
      }
    }
  }, [currentWorkspace, workspaces, setWorkspace]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        setWorkspace,
        refreshWorkspaces,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
