const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

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
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Fetching credentials for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/credentials`);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch credentials: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Credentials API response:', data);
  return data;
};

/**
 * Get credential detail by ID
 */
export const getCredentialDetail = async (workspaceId: string, credentialId: string): Promise<CredentialDetailApiResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Fetching credential detail for workspace:', workspaceId, 'credential:', credentialId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/${credentialId}`);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/${credentialId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch credential detail: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Credential detail API response:', data);
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
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Updating credential for workspace:', workspaceId, 'credential:', credentialId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/${credentialId}`);
  console.log('Update data:', updateData);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/${credentialId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
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
  console.log('Update credential API response:', data);
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
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Deleting credential for workspace:', workspaceId, 'credential:', credentialId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/${credentialId}`);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/${credentialId}`, {
    method: 'DELETE',
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
    throw new Error(errorData.message || errorData.error || `Failed to delete credential: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Delete credential API response:', data);
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
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Creating Slack credential for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/slack`);
  console.log('Credential data:', credentialData);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/credentials/slack`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
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
  console.log('Create credential API response:', data);
  return data;
};

