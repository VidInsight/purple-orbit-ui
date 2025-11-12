export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  memberCount: number;
  lastAccessed: string;
  createdAt: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
}
