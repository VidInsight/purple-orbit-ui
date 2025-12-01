/**
 * API Configuration
 * MiniFlow Enterprise API - Tüm endpoint'ler burada merkezi olarak yönetilir
 * 
 * Dokümantasyon: FRONTEND_API_DOKUMANTASYONU.md
 */

// Base URL - Environment variable'dan alınır, yoksa default değer kullanılır
// Development'ta boş string kullan (proxy tüm istekleri yakalar)
// Production'da veya environment variable varsa direkt backend URL'i kullan
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? '' : 'http://localhost:8000');

// API versiyonlama kullanılmıyor, direkt base URL altında
export const BASE_URL = API_BASE_URL;

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  register: `${BASE_URL}/auth/register`,
  login: `${BASE_URL}/auth/login`,
  logout: `${BASE_URL}/auth/logout`,
  logoutAll: `${BASE_URL}/auth/logout-all`,
  refresh: `${BASE_URL}/auth/refresh`,
  verifyEmail: `${BASE_URL}/auth/verify-email`,
  sendVerificationEmail: `${BASE_URL}/auth/send-verification-email`,
  requestVerificationEmail: `${BASE_URL}/auth/request-verification-email`,
} as const;

/**
 * User Management Endpoints
 */
export const USER_ENDPOINTS = {
  get: (userId: string) => `${BASE_URL}/users/${userId}`,
  getWorkspaces: (userId: string) => `${BASE_URL}/users/${userId}/workspaces`,
  getSessions: (userId: string) => `${BASE_URL}/users/${userId}/sessions`,
  deleteSession: (userId: string, sessionId: string) => `${BASE_URL}/users/${userId}/sessions/${sessionId}`,
  getLoginHistory: (userId: string) => `${BASE_URL}/users/${userId}/login-history`,
  getPasswordHistory: (userId: string) => `${BASE_URL}/users/${userId}/password-history`,
  updateUsername: (userId: string) => `${BASE_URL}/users/${userId}/username`,
  updateEmail: (userId: string) => `${BASE_URL}/users/${userId}/email`,
  update: (userId: string) => `${BASE_URL}/users/${userId}`,
  updatePassword: (userId: string) => `${BASE_URL}/users/${userId}/password`,
  requestDeletion: (userId: string) => `${BASE_URL}/users/${userId}/deletion-request`,
  cancelDeletion: (userId: string) => `${BASE_URL}/users/${userId}/deletion-request`,
  passwordResetRequest: `${BASE_URL}/users/password-reset/request`,
  passwordResetValidate: `${BASE_URL}/users/password-reset/validate`,
  passwordReset: `${BASE_URL}/users/password-reset/reset`,
  getPendingInvitations: (userId: string) => `${BASE_URL}/users/${userId}/invitations/pending`,
} as const;

/**
 * Workspace Management Endpoints
 */
export const WORKSPACE_ENDPOINTS = {
  create: `${BASE_URL}/workspaces`,
  get: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}`,
  getLimits: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/limits`,
  update: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}`,
  delete: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}`,
} as const;

/**
 * Workspace Members Endpoints
 */
export const WORKSPACE_MEMBER_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/members`,
  get: (workspaceId: string, memberId: string) => `${BASE_URL}/workspaces/${workspaceId}/members/${memberId}`,
  updateRole: (workspaceId: string, memberId: string) => `${BASE_URL}/workspaces/${workspaceId}/members/${memberId}/role`,
  remove: (workspaceId: string, userId: string) => `${BASE_URL}/workspaces/${workspaceId}/members/${userId}`,
} as const;

/**
 * Workspace Invitations Endpoints
 */
export const WORKSPACE_INVITATION_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/invitations`,
  create: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/invitations`,
  accept: (invitationId: string) => `${BASE_URL}/invitations/${invitationId}/accept`,
  decline: (invitationId: string) => `${BASE_URL}/invitations/${invitationId}/decline`,
  cancel: (invitationId: string) => `${BASE_URL}/invitations/${invitationId}`,
} as const;

/**
 * API Keys Endpoints
 */
export const API_KEY_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/api-keys`,
  get: (workspaceId: string, apiKeyId: string) => `${BASE_URL}/workspaces/${workspaceId}/api-keys/${apiKeyId}`,
  create: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/api-keys`,
  update: (workspaceId: string, apiKeyId: string) => `${BASE_URL}/workspaces/${workspaceId}/api-keys/${apiKeyId}`,
  delete: (workspaceId: string, apiKeyId: string) => `${BASE_URL}/workspaces/${workspaceId}/api-keys/${apiKeyId}`,
} as const;

/**
 * Variables Endpoints
 */
export const VARIABLE_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/variables`,
  get: (workspaceId: string, variableId: string) => `${BASE_URL}/workspaces/${workspaceId}/variables/${variableId}`,
  create: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/variables`,
  update: (workspaceId: string, variableId: string) => `${BASE_URL}/workspaces/${workspaceId}/variables/${variableId}`,
  delete: (workspaceId: string, variableId: string) => `${BASE_URL}/workspaces/${workspaceId}/variables/${variableId}`,
} as const;

/**
 * Credentials Endpoints
 */
export const CREDENTIAL_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/credentials`,
  get: (workspaceId: string, credentialId: string) => `${BASE_URL}/workspaces/${workspaceId}/credentials/${credentialId}`,
  create: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/credentials`,
  delete: (workspaceId: string, credentialId: string) => `${BASE_URL}/workspaces/${workspaceId}/credentials/${credentialId}`,
} as const;

/**
 * Databases Endpoints
 */
export const DATABASE_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/databases`,
  get: (workspaceId: string, databaseId: string) => `${BASE_URL}/workspaces/${workspaceId}/databases/${databaseId}`,
  create: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/databases`,
  update: (workspaceId: string, databaseId: string) => `${BASE_URL}/workspaces/${workspaceId}/databases/${databaseId}`,
  delete: (workspaceId: string, databaseId: string) => `${BASE_URL}/workspaces/${workspaceId}/databases/${databaseId}`,
} as const;

/**
 * Files Endpoints
 */
export const FILE_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/files`,
  get: (workspaceId: string, fileId: string) => `${BASE_URL}/workspaces/${workspaceId}/files/${fileId}`,
  getContent: (workspaceId: string, fileId: string) => `${BASE_URL}/workspaces/${workspaceId}/files/${fileId}/content`,
  upload: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/files`,
  update: (workspaceId: string, fileId: string) => `${BASE_URL}/workspaces/${workspaceId}/files/${fileId}`,
  delete: (workspaceId: string, fileId: string) => `${BASE_URL}/workspaces/${workspaceId}/files/${fileId}`,
} as const;

/**
 * Global Scripts Endpoints
 */
export const GLOBAL_SCRIPT_ENDPOINTS = {
  list: `${BASE_URL}/scripts`,
  get: (scriptId: string) => `${BASE_URL}/scripts/${scriptId}`,
  getContent: (scriptId: string) => `${BASE_URL}/scripts/${scriptId}/content`,
  create: `${BASE_URL}/scripts`,
  update: (scriptId: string) => `${BASE_URL}/scripts/${scriptId}`,
  delete: (scriptId: string) => `${BASE_URL}/scripts/${scriptId}`,
} as const;

/**
 * Custom Scripts Endpoints
 */
export const CUSTOM_SCRIPT_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/custom-scripts`,
  get: (workspaceId: string, customScriptId: string) => `${BASE_URL}/workspaces/${workspaceId}/custom-scripts/${customScriptId}`,
  getContent: (workspaceId: string, customScriptId: string) => `${BASE_URL}/workspaces/${workspaceId}/custom-scripts/${customScriptId}/content`,
  create: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/custom-scripts`,
  update: (workspaceId: string, customScriptId: string) => `${BASE_URL}/workspaces/${workspaceId}/custom-scripts/${customScriptId}`,
  delete: (workspaceId: string, customScriptId: string) => `${BASE_URL}/workspaces/${workspaceId}/custom-scripts/${customScriptId}`,
} as const;

/**
 * Workflows Endpoints
 */
export const WORKFLOW_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows`,
  get: (workspaceId: string, workflowId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}`,
  create: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows`,
  update: (workspaceId: string, workflowId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}`,
  delete: (workspaceId: string, workflowId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}`,
} as const;

/**
 * Nodes Endpoints
 */
export const NODE_ENDPOINTS = {
  list: (workspaceId: string, workflowId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/nodes`,
  get: (workspaceId: string, workflowId: string, nodeId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/nodes/${nodeId}`,
  getFormSchema: (workspaceId: string, workflowId: string, nodeId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/nodes/${nodeId}/form-schema`,
  create: (workspaceId: string, workflowId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/nodes`,
  update: (workspaceId: string, workflowId: string, nodeId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/nodes/${nodeId}`,
  updateInputParams: (workspaceId: string, workflowId: string, nodeId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/nodes/${nodeId}/input-params`,
  delete: (workspaceId: string, workflowId: string, nodeId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/nodes/${nodeId}`,
} as const;

/**
 * Edges Endpoints
 */
export const EDGE_ENDPOINTS = {
  list: (workspaceId: string, workflowId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/edges`,
  get: (workspaceId: string, workflowId: string, edgeId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/edges/${edgeId}`,
  create: (workspaceId: string, workflowId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/edges`,
  update: (workspaceId: string, workflowId: string, edgeId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/edges/${edgeId}`,
  delete: (workspaceId: string, workflowId: string, edgeId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/edges/${edgeId}`,
} as const;

/**
 * Triggers Endpoints
 */
export const TRIGGER_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/triggers`,
  get: (workspaceId: string, triggerId: string) => `${BASE_URL}/workspaces/${workspaceId}/triggers/${triggerId}`,
  create: (workspaceId: string, workflowId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/triggers`,
  update: (workspaceId: string, triggerId: string) => `${BASE_URL}/workspaces/${workspaceId}/triggers/${triggerId}`,
  delete: (workspaceId: string, triggerId: string) => `${BASE_URL}/workspaces/${workspaceId}/triggers/${triggerId}`,
} as const;

/**
 * Executions Endpoints
 */
export const EXECUTION_ENDPOINTS = {
  list: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/executions`,
  get: (workspaceId: string, executionId: string) => `${BASE_URL}/workspaces/${workspaceId}/executions/${executionId}`,
  getLast: (workspaceId: string) => `${BASE_URL}/workspaces/${workspaceId}/executions/last`,
  create: (workspaceId: string, workflowId: string) => `${BASE_URL}/workspaces/${workspaceId}/workflows/${workflowId}/executions`,
} as const;

/**
 * Workspace Plans Endpoints
 */
export const WORKSPACE_PLAN_ENDPOINTS = {
  getApiLimits: `${BASE_URL}/workspace-plans/api-limits`,
} as const;

/**
 * Agreements Endpoints
 */
export const AGREEMENT_ENDPOINTS = {
  getActive: `${BASE_URL}/agreements/active`,
} as const;

/**
 * Tüm endpoint'leri tek bir obje olarak export et
 */
export const API_ENDPOINTS = {
  auth: AUTH_ENDPOINTS,
  user: USER_ENDPOINTS,
  workspace: WORKSPACE_ENDPOINTS,
  workspaceMember: WORKSPACE_MEMBER_ENDPOINTS,
  workspaceInvitation: WORKSPACE_INVITATION_ENDPOINTS,
  apiKey: API_KEY_ENDPOINTS,
  variable: VARIABLE_ENDPOINTS,
  credential: CREDENTIAL_ENDPOINTS,
  database: DATABASE_ENDPOINTS,
  file: FILE_ENDPOINTS,
  globalScript: GLOBAL_SCRIPT_ENDPOINTS,
  customScript: CUSTOM_SCRIPT_ENDPOINTS,
  workflow: WORKFLOW_ENDPOINTS,
  node: NODE_ENDPOINTS,
  edge: EDGE_ENDPOINTS,
  trigger: TRIGGER_ENDPOINTS,
  execution: EXECUTION_ENDPOINTS,
  workspacePlan: WORKSPACE_PLAN_ENDPOINTS,
  agreement: AGREEMENT_ENDPOINTS,
} as const;

// Type exports for better TypeScript support
export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];

