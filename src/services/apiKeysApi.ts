const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

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
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Fetching API keys for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys`);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys`, {
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
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Creating API key for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys`);
  console.log('Request data:', apiKeyData);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
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

