import { apiClient, getBaseUrl } from '@/utils/apiClient';

const BASE_URL = getBaseUrl();

export interface ApiKeysApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any; // API response formatına göre güncellenecek
}

/**
 * Get API keys for a workspace
 */
export const getApiKeys = async (workspaceId: string): Promise<ApiKeysApiResponse> => {
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys`);

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to fetch API keys: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('API keys API response:', data);
  return data;
};

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  permissions: {
    [key: string]: boolean;
  };
  expires_at?: string;
  tags?: string[];
  allowed_ips?: string[];
  key_prefix?: string;
}

export interface CreateApiKeyResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    id: string;
    name: string;
    key: string; // Full API key (only shown once)
    key_prefix?: string;
    description?: string;
    permissions: { [key: string]: boolean };
    expires_at?: string;
    tags?: string[];
    allowed_ips?: string[];
    created_at: string;
  };
}

/**
 * Create a new API key for a workspace
 */
export const createApiKey = async (
  workspaceId: string,
  apiKeyData: CreateApiKeyRequest
): Promise<CreateApiKeyResponse> => {
  console.log('Creating API key for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys`);
  console.log('Request data:', apiKeyData);

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys`, {
    method: 'POST',
    body: JSON.stringify(apiKeyData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to create API key: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Create API key response:', data);
  return data;
};

export interface ApiKeyDetail {
  id: string;
  workspace_id: string;
  owner_id: string;
  name: string;
  api_key_masked: string;
  description?: string;
  permissions: {
    [key: string]: boolean;
  };
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string | null;
  usage_count: number;
  allowed_ips: string[];
  tags: string[];
  created_at: string;
}

export interface GetApiKeyResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: ApiKeyDetail;
}

/**
 * Get a single API key by ID
 */
export const getApiKey = async (
  workspaceId: string,
  apiKeyId: string
): Promise<GetApiKeyResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Fetching API key:', apiKeyId, 'for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys/${apiKeyId}`);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys/${apiKeyId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to fetch API key: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Get API key response:', data);
  return data;
};

export interface UpdateApiKeyRequest {
  name?: string;
  description?: string;
  permissions?: {
    [key: string]: boolean;
  };
  tags?: string[];
  allowed_ips?: string[];
  expires_at?: string;
}

export interface UpdateApiKeyResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: ApiKeyDetail;
}

/**
 * Update an API key
 */
export const updateApiKey = async (
  workspaceId: string,
  apiKeyId: string,
  apiKeyData: UpdateApiKeyRequest
): Promise<UpdateApiKeyResponse> => {
  console.log('Updating API key:', apiKeyId, 'for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys/${apiKeyId}`);
  console.log('Request data:', apiKeyData);

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys/${apiKeyId}`, {
    method: 'PUT',
    body: JSON.stringify(apiKeyData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to update API key: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Update API key response:', data);
  return data;
};

export interface DeleteApiKeyResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data?: any;
}

/**
 * Delete an API key
 */
export const deleteApiKey = async (
  workspaceId: string,
  apiKeyId: string
): Promise<DeleteApiKeyResponse> => {
  console.log('Deleting API key:', apiKeyId, 'for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys/${apiKeyId}`);

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys/${apiKeyId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to delete API key: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Delete API key response:', data);
  return data;
};

