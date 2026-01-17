import { apiClient, getBaseUrl } from '@/utils/apiClient';
import { handleApiResponse } from '@/utils/errorHandler';

const BASE_URL = getBaseUrl();

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
  try {
    const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables/${variableId}`, {
      method: 'GET',
    });

    return await handleApiResponse<VariableDetailApiResponse>(response, 'Failed to fetch variable detail');
  } catch (error) {
    throw error;
  }
};

/**
 * Get variables for a workspace
 */
export const getVariables = async (workspaceId: string): Promise<VariablesApiResponse> => {
  try {
    const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables`, {
      method: 'GET',
    });

    return await handleApiResponse<VariablesApiResponse>(response, 'Failed to fetch variables');
  } catch (error) {
    throw error;
  }
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
  try {
    const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables`, {
      method: 'POST',
      body: JSON.stringify(variableData),
    });

    return await handleApiResponse<CreateVariableResponse>(response, 'Failed to create variable');
  } catch (error) {
    throw error;
  }
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
  try {
    const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables/${variableId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return await handleApiResponse<UpdateVariableResponse>(response, 'Failed to update variable');
  } catch (error) {
    throw error;
  }
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
  try {
    const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/variables/${variableId}`, {
      method: 'DELETE',
    });

    return await handleApiResponse<DeleteVariableResponse>(response, 'Failed to delete variable');
  } catch (error) {
    throw error;
  }
};

