const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

export interface ExecutionsApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    workspace_id: string;
    executions: ExecutionApiItem[];
    count: number;
  };
}

export interface ExecutionApiItem {
  id: string;
  workflow_id: string;
  trigger_id: string | null;
  status: string;
  started_at: string;
  ended_at: string;
  duration: number;
}

/**
 * Get executions for a workspace
 */
export const getExecutions = async (workspaceId: string): Promise<ExecutionsApiResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/executions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new Error(errorData.message || errorData.error || `Failed to fetch executions: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

