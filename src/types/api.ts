/**
 * API Response Types
 * MiniFlow Enterprise API response formatları için TypeScript type tanımları
 */

/**
 * Standart API Success Response
 */
export interface ApiSuccessResponse<T = any> {
  status: 'success';
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: T;
}

/**
 * Standart API Error Response
 */
export interface ApiErrorResponse {
  status: 'error';
  code: number;
  message: null;
  traceId: string;
  timestamp: string;
  error_message: string;
  error_code: string;
}

/**
 * API Response Union Type
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination Metadata
 */
export interface PaginationMetadata {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  metadata: PaginationMetadata;
}

/**
 * Paginated API Response
 */
export type ApiPaginatedResponse<T> = ApiSuccessResponse<PaginatedResponse<T>>;

/**
 * Authentication Types
 */
export interface LoginRequest {
  email_or_username: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  access_token: string;
  refresh_token: string;
  token_type?: 'Bearer';
  expires_in?: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  marketing_consent: boolean;
  terms_accepted_version: string;
  privacy_policy_accepted_version: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

/**
 * User Types
 */
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  avatar_url?: string;
  country_code?: string;
  phone_number?: string;
  is_email_verified: boolean;
  created_at: string;
}

export interface UserWorkspaces {
  owned_workspaces: Array<{
    workspace_id: string;
    workspace_name: string;
    workspace_slug: string;
    user_role: 'OWNER';
  }>;
  memberships: Array<{
    workspace_id: string;
    workspace_name: string;
    workspace_slug: string;
    user_role: 'MEMBER' | 'EDITOR' | 'VIEWER';
  }>;
}

/**
 * Workspace Types
 */
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  plan_id?: string;
  plan_name?: string;
  workspace_owner_id: string;
  workspace_owner_email: string;
}

export interface WorkspaceLimits {
  max_members_per_workspace: number;
  current_members_count: number;
  max_workflows_per_workspace: number;
  current_workflows_count: number;
  max_custom_scripts_per_workspace: number;
  current_custom_scripts_count: number;
  storage_limit_mb_per_workspace: number;
  current_storage_mb: number;
  max_api_keys_per_workspace: number;
  current_api_keys_count: number;
  monthly_execution_limit: number;
  current_month_executions: number;
  monthly_concurrent_executions: number;
  current_month_concurrent_executions: number;
  current_period_start: string;
  current_period_end: string;
}

/**
 * API Key Types
 */
export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  masked_key: string;
  description?: string;
  is_active: boolean;
  expires_at?: string | null;
  created_at: string;
}

export interface CreateApiKeyRequest {
  name: string;
  key_prefix?: string;
  description?: string;
  permissions?: Record<string, any>;
  expires_at?: string | null;
  tags?: string[];
  allowed_ips?: string[] | null;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  full_api_key: string; // ⚠️ Sadece bir kez gösterilir!
  key_prefix: string;
  description?: string;
}

export interface UpdateApiKeyRequest {
  name: string;
  description?: string;
  is_active: boolean;
  expires_at?: string | null;
  tags?: string[];
  allowed_ips?: string[] | null;
}

/**
 * Variable Types
 */
export interface Variable {
  id: string;
  key: string;
  value: string; // Secret ise "***MASKED***" olarak döner
  is_secret: boolean;
  description?: string;
  created_at: string;
}

export interface CreateVariableRequest {
  key: string;
  value: string;
  description?: string;
  is_secret: boolean;
}

export interface UpdateVariableRequest {
  key: string;
  value: string;
  description?: string;
  is_secret: boolean;
}

/**
 * Credential Types
 */
export interface Credential {
  id: string;
  name: string;
  credential_type: 'API_KEY' | 'OAUTH2' | 'BASIC_AUTH' | 'JWT' | 'AWS_CREDENTIALS';
  credential_provider?: string;
  is_active: boolean;
  expires_at?: string | null;
  created_at: string;
}

export interface CreateCredentialRequest {
  name: string;
  api_key?: string;
  credential_provider?: string;
  description?: string;
  tags?: string[];
  expires_at?: string | null;
  is_active: boolean;
}

/**
 * Database Types
 */
export interface Database {
  id: string;
  name: string;
  database_type: 'POSTGRESQL' | 'MYSQL' | 'MONGODB' | 'REDIS';
  host: string;
  port: number;
  database_name: string;
  username: string;
  password?: string; // Decrypt edilmiş olarak döner
  ssl_enabled: boolean;
  description?: string;
  tags?: string[];
  is_active: boolean;
  created_at: string;
}

export interface CreateDatabaseRequest {
  name: string;
  database_type: 'POSTGRESQL' | 'MYSQL' | 'MONGODB' | 'REDIS';
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  ssl_enabled: boolean;
  description?: string;
  tags?: string[];
  is_active: boolean;
  // Alternatif: connection_string kullanılabilir
  connection_string?: string;
}

/**
 * File Types
 */
export interface File {
  id: string;
  name: string;
  original_filename: string;
  file_path: string;
  file_size_mb: number;
  mime_type: string;
  description?: string;
  tags?: string[];
  created_at: string;
}

export interface UploadFileRequest {
  file: File | Blob;
  name?: string;
  description?: string;
  tags?: string; // Comma-separated
}

/**
 * Script Types
 */
export interface Script {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  created_at: string;
}

export interface ScriptContent {
  content: string;
  input_schema: Record<string, {
    type: string;
    required: boolean;
    default?: any;
    description?: string;
  }>;
  output_schema: Record<string, {
    type: string;
    description?: string;
  }>;
}

/**
 * Workflow Types
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'DEACTIVATED' | 'ARCHIVED';
  status_message?: string | null;
  priority: number;
  tags?: string[];
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  priority?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'DEACTIVATED' | 'ARCHIVED';
  status_message?: string | null;
  tags?: string[];
}

/**
 * Node Types
 */
export interface Node {
  id: string;
  name: string;
  description?: string;
  workflow_id: string;
  script_id?: string;
  custom_script_id?: string | null;
  input_params: Record<string, any>;
  output_params: Record<string, any>;
  max_retries: number;
  timeout_seconds: number;
  created_at: string;
}

export interface CreateNodeRequest {
  name: string;
  script_id?: string;
  custom_script_id?: string;
  description?: string;
  input_params: Record<string, any>;
  output_params?: Record<string, any>;
  max_retries?: number;
  timeout_seconds?: number;
}

export interface NodeFormSchema {
  schema: Record<string, {
    type: string;
    required: boolean;
    default: any;
    description?: string;
  }>;
  current_values: Record<string, any>;
}

/**
 * Edge Types
 */
export interface Edge {
  id: string;
  workflow_id: string;
  from_node_id: string;
  to_node_id: string;
  created_at: string;
}

export interface CreateEdgeRequest {
  from_node_id: string;
  to_node_id: string;
}

/**
 * Trigger Types
 */
export interface Trigger {
  id: string;
  name: string;
  trigger_type: 'MANUAL' | 'SCHEDULED' | 'WEBHOOK' | 'EVENT';
  workflow_id: string;
  is_enabled: boolean;
  config: Record<string, any>;
  description?: string;
  input_mapping?: Record<string, any>;
  created_at: string;
}

export interface CreateTriggerRequest {
  name: string;
  trigger_type: 'MANUAL' | 'SCHEDULED' | 'WEBHOOK' | 'EVENT';
  config: Record<string, any>;
  description?: string;
  input_mapping?: Record<string, any>;
  is_enabled: boolean;
}

/**
 * Execution Types
 */
export interface Execution {
  id: string;
  workspace_id: string;
  workflow_id: string;
  trigger_id?: string | null;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  trigger_data: Record<string, any>;
  results?: Record<string, {
    status: 'SUCCESS' | 'FAILED';
    result_data?: Record<string, any>;
    duration_seconds: number;
    memory_mb: number;
    cpu_percent: number;
  }>;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  triggered_by: string;
}

export interface CreateExecutionRequest {
  input_data: Record<string, any>;
}

/**
 * Workspace Member Types
 */
export interface WorkspaceMember {
  id: string;
  user_id: string;
  workspace_id: string;
  role_id: string;
  role_name: 'OWNER' | 'MEMBER' | 'EDITOR' | 'VIEWER';
  user: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * Invitation Types
 */
export interface Invitation {
  id: string;
  workspace_id: string;
  user_id?: string;
  role_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  message?: string;
  created_at: string;
}

export interface CreateInvitationRequest {
  user_id: string;
  role_id: string;
  message?: string;
}

/**
 * Agreement Types
 */
export interface Agreement {
  id: string;
  agreement_type: 'terms' | 'privacy_policy';
  version: string;
  locale: string;
  content: string;
  is_active: boolean;
  effective_date: string;
}

