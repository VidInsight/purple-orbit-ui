import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentWorkspace, setCurrentWorkspace } from '@/utils/workspaceStorage';
import type { Workspace as ApiWorkspace, UserWorkspaces, WorkspaceLimits } from '@/types/api';
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

/**
 * API Workspace'i app Workspace type'ına dönüştür
 */
const mapApiWorkspaceToWorkspace = (
  apiWorkspace: ApiWorkspace,
  limits?: WorkspaceLimits,
  role?: 'OWNER' | 'MEMBER' | 'EDITOR' | 'VIEWER'
): Workspace => {
  return {
    id: apiWorkspace.id,
    name: apiWorkspace.name,
    slug: apiWorkspace.slug,
    description: apiWorkspace.description,
    memberCount: limits?.current_members_count || 0,
    lastAccessed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    role: role === 'OWNER' ? 'owner' : role?.toLowerCase() as 'admin' | 'editor' | 'viewer' || 'viewer',
    member_limit: limits?.max_members_per_workspace || 0,
    current_member_count: limits?.current_members_count || 0,
    workflow_limit: limits?.max_workflows_per_workspace || 0,
    current_workflow_count: limits?.current_workflows_count || 0,
    custom_script_limit: limits?.max_custom_scripts_per_workspace || 0,
    current_custom_script_count: limits?.current_custom_scripts_count || 0,
    storage_limit_mb: limits?.storage_limit_mb_per_workspace || 0,
    current_storage_mb: limits?.current_storage_mb || 0,
    api_key_limit: limits?.max_api_keys_per_workspace || 0,
    current_api_key_count: limits?.current_api_keys_count || 0,
    monthly_execution_limit: limits?.monthly_execution_limit || 0,
    current_month_executions: limits?.current_month_executions || 0,
    monthly_concurrent_executions: limits?.monthly_concurrent_executions || 0,
    current_month_concurrent_executions: limits?.current_month_concurrent_executions || 0,
    current_period_start: limits?.current_period_start || new Date().toISOString(),
    current_period_end: limits?.current_period_end || new Date().toISOString(),
    plan_name: apiWorkspace.plan_name,
  };
};

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user, getToken, isAuthenticated } = useAuth();
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Workspace'leri API'den yükle
   */
  const loadWorkspaces = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // User'ın workspace'lerini al
      console.log('Loading workspaces for user:', user.id);
      console.log('API endpoint:', API_ENDPOINTS.user.getWorkspaces(user.id));
      
      const response = await apiClient.get<UserWorkspaces>(
        API_ENDPOINTS.user.getWorkspaces(user.id),
        { token }
      );

      console.log('Workspaces response (full):', JSON.stringify(response, null, 2));
      console.log('Workspaces response.data:', response.data);
      console.log('Owned workspaces:', response.data?.owned_workspaces);
      console.log('Member workspaces:', response.data?.member_workspaces);

      // Owned ve member workspace'leri birleştir (backend formatını normalize et)
      const allApiWorkspaces = [
        ...(response.data.owned_workspaces || []).map((w) => ({
          id: w.workspace_id,
          name: w.workspace_name,
          slug: w.workspace_slug,
          role: w.user_role as 'OWNER',
        })),
        ...(response.data.memberships || []).map((w) => ({
          id: w.workspace_id,
          name: w.workspace_name,
          slug: w.workspace_slug,
          role: w.user_role as 'MEMBER' | 'EDITOR' | 'VIEWER',
        })),
      ];

      console.log('All API workspaces (normalized):', allApiWorkspaces);

      // Workspace'leri basit formata dönüştür (limits bilgisi lazy load edilecek)
      const workspacesWithLimits = allApiWorkspaces.map((apiWs) =>
        mapApiWorkspaceToWorkspace(
          { id: apiWs.id, name: apiWs.name, slug: apiWs.slug, description: '' },
          undefined,
          apiWs.role
        )
      );

      console.log('Workspaces with limits:', workspacesWithLimits);

      setWorkspaces(workspacesWithLimits);

      // Mevcut workspace'i yükle
      const currentId = getCurrentWorkspace();
      if (currentId) {
        const workspace = workspacesWithLimits.find((w) => w.id === currentId);
        if (workspace) {
          // Workspace detaylarını ve limits'i yükle
          try {
            const detailResponse = await apiClient.get<ApiWorkspace>(
              API_ENDPOINTS.workspace.get(currentId),
              { token }
            );
            const limitsResponse = await apiClient.get<WorkspaceLimits>(
              API_ENDPOINTS.workspace.getLimits(currentId),
              { token }
            );
            const currentWs = workspacesWithLimits.find((w) => w.id === currentId);
            setCurrentWorkspaceState(
              mapApiWorkspaceToWorkspace(
                detailResponse.data,
                limitsResponse.data,
                currentWs?.role === 'owner' ? 'OWNER' : 'MEMBER'
              )
            );
          } catch (error) {
            setCurrentWorkspaceState(workspace);
          }
        }
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, getToken]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  /**
   * Workspace seç
   */
  const setWorkspace = useCallback(async (workspaceId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      // Workspace detaylarını ve limits'i yükle
      const [detailResponse, limitsResponse] = await Promise.all([
        apiClient.get<ApiWorkspace>(
          API_ENDPOINTS.workspace.get(workspaceId),
          { token }
        ),
        apiClient.get<WorkspaceLimits>(
          API_ENDPOINTS.workspace.getLimits(workspaceId),
          { token }
        ),
      ]);

      const workspace = workspaces.find((w) => w.id === workspaceId);
      const mappedWorkspace = mapApiWorkspaceToWorkspace(
        detailResponse.data,
        limitsResponse.data,
        workspace?.role === 'owner' ? 'OWNER' : 'MEMBER'
      );

      setCurrentWorkspaceState(mappedWorkspace);
      setCurrentWorkspace(workspaceId);
    } catch (error) {
      console.error('Error setting workspace:', error);
    }
  }, [workspaces, getToken]);

  /**
   * Workspace oluştur
   */
  const createWorkspace = useCallback(async (
    name: string,
    slug: string,
    description?: string
  ): Promise<Workspace> => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await apiClient.post<ApiWorkspace>(
      API_ENDPOINTS.workspace.create,
      { name, slug, description },
      { token }
    );

    // Workspace'i listeye ekle ve seç
    const newWorkspace = mapApiWorkspaceToWorkspace(response.data, undefined, 'OWNER');
    setWorkspaces((prev) => [...prev, newWorkspace]);
    await setWorkspace(response.data.id);

    return newWorkspace;
  }, [getToken, setWorkspace]);

  /**
   * Workspace güncelle
   */
  const updateWorkspace = useCallback(async (
    workspaceId: string,
    data: { name?: string; slug?: string; description?: string }
  ): Promise<void> => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    await apiClient.put(
      API_ENDPOINTS.workspace.update(workspaceId),
      data,
      { token }
    );

    // Workspace'leri yenile
    await loadWorkspaces();
  }, [getToken, loadWorkspaces]);

  /**
   * Workspace sil
   */
  const deleteWorkspace = useCallback(async (workspaceId: string): Promise<void> => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    await apiClient.delete(
      API_ENDPOINTS.workspace.delete(workspaceId),
      { token }
    );

    // Workspace'leri yenile
    await loadWorkspaces();

    // Eğer silinen workspace seçiliyse, seçimi temizle
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspaceState(null);
      localStorage.removeItem('current_workspace');
    }
  }, [getToken, loadWorkspaces, currentWorkspace]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        setWorkspace,
        refreshWorkspaces: loadWorkspaces,
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
