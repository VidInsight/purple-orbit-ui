import { apiClient, getBaseUrl } from '@/utils/apiClient';

const BASE_URL = getBaseUrl();

export interface CreateDatabaseRequest {
  name: string;
  database_type: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  connection_string: string | null;
  ssl_enabled: boolean;
  additional_params?: Record<string, any>;
  description?: string;
  tags?: string[];
}

export interface DatabaseApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

export interface DatabaseDetail {
  id: string;
  workspace_id: string;
  owner_id: string;
  name: string;
  database_type: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password?: string; // Password genellikle API'den dönmez
  connection_string: string | null;
  ssl_enabled: boolean;
  additional_params?: Record<string, any>;
  description: string | null;
  status?: string;
  connection_status?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseDetailApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: DatabaseDetail;
}

/**
 * Get databases for a workspace
 */
export const getDatabases = async (workspaceId: string): Promise<DatabaseApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  console.log('Fetching databases for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/databases`);

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/databases`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch databases: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Get databases API response:', data);
  return data;
};

/**
 * Create a new database connection in a workspace
 */
export const createDatabase = async (
  workspaceId: string,
  databaseData: CreateDatabaseRequest
): Promise<DatabaseApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  console.log('Creating database for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/databases`);
  console.log('Request body:', databaseData);

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/databases`, {
    method: 'POST',
    body: JSON.stringify(databaseData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    console.error('Response status:', response.status);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    
    // Extract error message from different possible response formats
    const errorMessage = 
      errorData.message || 
      errorData.error || 
      errorData.detail ||
      (errorData.data && (errorData.data.message || errorData.data.error)) ||
      `Failed to create database: ${response.status} ${response.statusText}`;
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('Create database API response:', data);
  return data;
};

/**
 * Get database detail by ID
 */
export const getDatabaseDetail = async (
  workspaceId: string,
  databaseId: string
): Promise<DatabaseDetailApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!databaseId || databaseId.trim() === '') {
    throw new Error('Database ID is required.');
  }

  console.log('Fetching database detail:', { workspaceId, databaseId });
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/databases/${databaseId}`);

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/databases/${databaseId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch database detail: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Get database detail API response:', data);
  return data;
};

export interface UpdateDatabaseRequest {
  name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  ssl_enabled: boolean;
  description?: string;
  tags?: string[];
}

/**
 * Update a database connection
 */
export const updateDatabase = async (
  workspaceId: string,
  databaseId: string,
  databaseData: UpdateDatabaseRequest
): Promise<DatabaseApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!databaseId || databaseId.trim() === '') {
    throw new Error('Database ID is required.');
  }

  console.log('Updating database:', { workspaceId, databaseId });
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/databases/${databaseId}`);
  console.log('Request body:', databaseData);

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/databases/${databaseId}`, {
    method: 'PUT',
    body: JSON.stringify(databaseData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    console.error('Response status:', response.status);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    
    // Extract error message from different possible response formats
    const errorMessage = 
      errorData.message || 
      errorData.error || 
      errorData.detail ||
      (errorData.data && (errorData.data.message || errorData.data.error)) ||
      `Failed to update database: ${response.status} ${response.statusText}`;
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('Update database API response:', data);
  return data;
};

/**
 * Delete a database connection
 */
export const deleteDatabase = async (
  workspaceId: string,
  databaseId: string
): Promise<DatabaseApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!databaseId || databaseId.trim() === '') {
    throw new Error('Database ID is required.');
  }

  console.log('Deleting database:', { workspaceId, databaseId });
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/databases/${databaseId}`);

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/databases/${databaseId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to delete database: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Delete database API response:', data);
  return data;
};

