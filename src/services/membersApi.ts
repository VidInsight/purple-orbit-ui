const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

export interface WorkspaceMember {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role_id: string;
  role_name: string;
  joined_at: string;
  last_accessed_at: string;
}

export interface WorkspaceMembersResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    workspace_id: string;
    members: WorkspaceMember[];
    total_count: number;
  };
}

/**
 * Get workspace members
 */
export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMembersResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/members`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch workspace members: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

