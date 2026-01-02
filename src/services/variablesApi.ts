const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

export interface VariablesApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

export interface VariableDetail {
  id: string;
  workspace_id: string;
  key: string;
  value: string;
  description: string | null;
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

export interface VariableDetailApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: VariableDetail;
}

/**
 * Get variable detail by ID
 */
export const getVariableDetail = async (workspaceId: string, variableId: string): Promise<VariableDetailApiResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Fetching variable detail for workspace:', workspaceId, 'variable:', variableId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/variables/${variableId}`);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables/${variableId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch variable detail: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Variable detail API response:', data);
  return data;
};

/**
 * Get variables for a workspace
 */
export const getVariables = async (workspaceId: string): Promise<VariablesApiResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Fetching variables for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/variables`);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch variables: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Variables API response:', data);
  return data;
};

export interface CreateVariableRequest {
  key: string;
  value: string;
  description?: string;
  is_secret: boolean;
}

export interface CreateVariableResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Create variable for a workspace
 */
export const createVariable = async (
  workspaceId: string,
  variableData: CreateVariableRequest
): Promise<CreateVariableResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Creating variable for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/variables`);
  console.log('Variable data:', variableData);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(variableData),
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
    throw new Error(errorData.message || errorData.error || `Failed to create variable: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Create variable API response:', data);
  return data;
};

export interface UpdateVariableRequest {
  key: string;
  value: string;
  description?: string;
  is_secret: boolean;
}

export interface UpdateVariableResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Update variable by ID
 */
export const updateVariable = async (
  workspaceId: string,
  variableId: string,
  updateData: UpdateVariableRequest
): Promise<UpdateVariableResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Updating variable for workspace:', workspaceId, 'variable:', variableId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/variables/${variableId}`);
  console.log('Update data:', updateData);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables/${variableId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to update variable: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Update variable API response:', data);
  return data;
};

export interface DeleteVariableResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Delete variable by ID
 */
export const deleteVariable = async (
  workspaceId: string,
  variableId: string
): Promise<DeleteVariableResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  console.log('Deleting variable for workspace:', workspaceId, 'variable:', variableId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/variables/${variableId}`);

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables/${variableId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to delete variable: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Delete variable API response:', data);
  return data;
};

