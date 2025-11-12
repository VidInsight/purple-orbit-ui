import { Workspace } from '@/types/workspace';

const STORAGE_KEY = 'automation_workspaces';

// Initialize with default workspaces if none exist
const defaultWorkspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'Personal Projects',
    description: 'My personal automation workflows',
    memberCount: 1,
    lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'workspace-2',
    name: 'Company Automations',
    description: 'Team workflows and integrations for daily operations',
    memberCount: 8,
    lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'workspace-3',
    name: 'Client Projects',
    description: 'Automation solutions for client requirements',
    memberCount: 3,
    lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
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

export const createWorkspace = (name: string, description?: string): Workspace => {
  const newWorkspace: Workspace = {
    id: `workspace-${Date.now()}`,
    name,
    description,
    memberCount: 1,
    lastAccessed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
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
