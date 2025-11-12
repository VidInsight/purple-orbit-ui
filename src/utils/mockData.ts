import {
  WorkflowItem,
  ExecutionItem,
  CredentialItem,
  DatabaseItem,
  VariableItem,
  FileItem,
  ApiKeyItem,
} from '@/types/common';

// Generate mock workflows
export const generateMockWorkflows = (count: number = 45): WorkflowItem[] => {
  const statuses: Array<'active' | 'inactive' | 'draft'> = ['active', 'inactive', 'draft'];
  return Array.from({ length: count }, (_, i) => ({
    id: `workflow-${i + 1}`,
    name: `Workflow ${i + 1}`,
    description: `Automation workflow for task ${i + 1}`,
    status: statuses[i % 3],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastExecuted: i % 2 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    executionCount: Math.floor(Math.random() * 1000),
  }));
};

// Generate mock executions
export const generateMockExecutions = (count: number = 60): ExecutionItem[] => {
  const statuses: Array<'success' | 'failed' | 'running' | 'cancelled'> = ['success', 'failed', 'running', 'cancelled'];
  return Array.from({ length: count }, (_, i) => ({
    id: `execution-${i + 1}`,
    name: `Execution ${i + 1}`,
    description: `Workflow execution #${i + 1}`,
    workflowId: `workflow-${Math.floor(Math.random() * 10) + 1}`,
    workflowName: `Workflow ${Math.floor(Math.random() * 10) + 1}`,
    status: statuses[i % 4],
    duration: Math.floor(Math.random() * 300),
    startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: i % 4 !== 2 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

// Generate mock credentials
export const generateMockCredentials = (count: number = 25): CredentialItem[] => {
  const types = ['OAuth2', 'API Key', 'Basic Auth', 'JWT', 'AWS'];
  return Array.from({ length: count }, (_, i) => ({
    id: `credential-${i + 1}`,
    name: `${types[i % 5]} Credential ${i + 1}`,
    description: `Authentication credential for service ${i + 1}`,
    type: types[i % 5],
    lastUsed: i % 3 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

// Generate mock databases
export const generateMockDatabases = (count: number = 15): DatabaseItem[] => {
  const types: Array<'postgresql' | 'mysql' | 'mongodb' | 'redis'> = ['postgresql', 'mysql', 'mongodb', 'redis'];
  const statuses: Array<'connected' | 'disconnected' | 'error'> = ['connected', 'disconnected', 'error'];
  return Array.from({ length: count }, (_, i) => ({
    id: `database-${i + 1}`,
    name: `${types[i % 4].toUpperCase()} Database ${i + 1}`,
    description: `Database connection ${i + 1}`,
    type: types[i % 4],
    host: `db${i + 1}.example.com:${3000 + i}`,
    status: statuses[i % 3],
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

// Generate mock variables
export const generateMockVariables = (count: number = 35): VariableItem[] => {
  const types: Array<'string' | 'number' | 'boolean' | 'json'> = ['string', 'number', 'boolean', 'json'];
  return Array.from({ length: count }, (_, i) => ({
    id: `variable-${i + 1}`,
    name: `Variable ${i + 1}`,
    description: `Environment variable ${i + 1}`,
    key: `VAR_${i + 1}`,
    type: types[i % 4],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

// Generate mock files
export const generateMockFiles = (count: number = 40): FileItem[] => {
  const types = ['image/png', 'application/pdf', 'text/csv', 'application/json', 'image/jpeg'];
  const extensions = ['.png', '.pdf', '.csv', '.json', '.jpg'];
  return Array.from({ length: count }, (_, i) => ({
    id: `file-${i + 1}`,
    name: `file_${i + 1}${extensions[i % 5]}`,
    description: `Uploaded file ${i + 1}`,
    size: Math.floor(Math.random() * 10000000),
    type: types[i % 5],
    url: `https://example.com/files/file_${i + 1}${extensions[i % 5]}`,
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

// Generate mock API keys
export const generateMockApiKeys = (count: number = 20): ApiKeyItem[] => {
  const permissions = [
    ['read', 'write'],
    ['read'],
    ['admin'],
    ['read', 'write', 'delete'],
    ['read', 'execute'],
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `apikey-${i + 1}`,
    name: `API Key ${i + 1}`,
    description: `API access key for application ${i + 1}`,
    key: `ak_${Math.random().toString(36).substring(2, 15)}`,
    permissions: permissions[i % 5],
    lastUsed: i % 3 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    expiresAt: i % 2 === 0 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};
