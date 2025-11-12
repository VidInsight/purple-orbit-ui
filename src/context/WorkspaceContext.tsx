import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workspace } from '@/types/workspace';
import { getWorkspaces, getCurrentWorkspace, setCurrentWorkspace } from '@/utils/workspaceStorage';

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkspaces = () => {
    const allWorkspaces = getWorkspaces();
    setWorkspaces(allWorkspaces);

    const currentId = getCurrentWorkspace();
    if (currentId) {
      const workspace = allWorkspaces.find((w) => w.id === currentId);
      setCurrentWorkspaceState(workspace || null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const setWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspaceState(workspace);
      setCurrentWorkspace(workspaceId);
    }
  };

  const refreshWorkspaces = () => {
    loadWorkspaces();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        setWorkspace,
        refreshWorkspaces,
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
