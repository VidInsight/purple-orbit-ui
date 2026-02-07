import { apiClient, getBaseUrl } from '@/utils/apiClient';

const BASE_URL = getBaseUrl();

export interface CredentialsApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any; // API response formatına göre güncellenecek
}

export interface CredentialDetail {
  id: string;
  workspace_id: string;
  owner_id: string;
  name: string;
  credential_type: string;
  credential_provider: string;
  description: string | null;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  tags: string[];
  created_at: string;
  credential_data: any;
}

export interface CredentialDetailApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: CredentialDetail;
}

/**
 * Get credentials for a workspace
 */
export const getCredentials = async (workspaceId: string): Promise<CredentialsApiResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch credentials: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Get credential detail by ID
 */
export const getCredentialDetail = async (workspaceId: string, credentialId: string): Promise<CredentialDetailApiResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/${credentialId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch credential detail: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface UpdateCredentialRequest {
  name: string;
  description?: string;
  tags?: string[];
}

export interface UpdateCredentialResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Update credential by ID
 */
export const updateCredential = async (
  workspaceId: string,
  credentialId: string,
  updateData: UpdateCredentialRequest
): Promise<UpdateCredentialResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/${credentialId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
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
    throw new Error(errorData.message || errorData.error || `Failed to update credential: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface DeleteCredentialResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Delete credential by ID
 */
export const deleteCredential = async (
  workspaceId: string,
  credentialId: string
): Promise<DeleteCredentialResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/${credentialId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to delete credential: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface CreateSlackCredentialRequest {
  name: string;
  bot_token: string;
  signing_secret: string;
  app_token: string;
  description?: string;
  tags?: string[];
  expires_at?: string | null;
}

export interface CreateCredentialResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Create Slack credential
 */
export const createSlackCredential = async (
  workspaceId: string,
  credentialData: CreateSlackCredentialRequest
): Promise<CreateCredentialResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/slack`, {
    method: 'POST',
    body: JSON.stringify(credentialData),
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
    throw new Error(errorData.message || errorData.error || `Failed to create credential: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface CreateGoogleCredentialRequest {
  name: string;
  service_type: 'drive' | 'sheets' | 'gmail' | 'calendar';
  oauth_token: string;
  refresh_token: string;
  description?: string;
  tags?: string[];
  expires_at?: string | null;
}

/**
 * Create Google credential
 */
export const createGoogleCredential = async (
  workspaceId: string,
  credentialData: CreateGoogleCredentialRequest
): Promise<CreateCredentialResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/google`, {
    method: 'POST',
    body: JSON.stringify(credentialData),
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
    throw new Error(errorData.message || errorData.error || `Failed to create credential: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

