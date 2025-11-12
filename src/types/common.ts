export interface BaseListItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowItem extends BaseListItem {
  status: 'active' | 'inactive' | 'draft';
  lastExecuted?: string;
  executionCount: number;
}

export interface ExecutionItem extends BaseListItem {
  workflowId: string;
  workflowName: string;
  status: 'success' | 'failed' | 'running' | 'cancelled';
  duration?: number;
  startedAt: string;
  completedAt?: string;
}

export interface CredentialItem extends BaseListItem {
  type: string;
  lastUsed?: string;
}

export interface DatabaseItem extends BaseListItem {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  host: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface VariableItem extends BaseListItem {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface FileItem extends BaseListItem {
  size: number;
  type: string;
  url: string;
}

export interface ApiKeyItem extends BaseListItem {
  key: string;
  permissions: string[];
  lastUsed?: string;
  expiresAt?: string;
}

export interface ColumnConfig<T = any> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}
