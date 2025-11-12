export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  memberCount: number;
  lastAccessed: string;
  createdAt: string;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
}
