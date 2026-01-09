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
export interface UserRole {
  id: string;
  name: string;
  description: string;
  can_edit_workspace: boolean;
  can_delete_workspace: boolean;
  can_invite_members: boolean;
  can_remove_members: boolean;
  can_manage_api_keys: boolean;
  can_manage_credentials: boolean;
  can_manage_files: boolean;
  can_manage_variables: boolean;
  can_manage_databases: boolean;
  can_manage_custom_scripts: boolean;
  can_manage_workflows: boolean;
  can_execute_workflows: boolean;
  can_view_executions: boolean;
  can_manage_executions: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRolesResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    items: UserRole[];
  };
}

export interface InviteUserByEmailRequest {
  email: string;
  role_id: string;
  message?: string;
}

export interface InviteUserByEmailResponse {
  status: string;
  code: number;
  message: string;
  traceId: string;
  timestamp: string;
  data: {
    id: string;
    workspace_id: string;
    invitee_id: string;
    invitee_email: string;
    role_id: string;
    status: string;
    message: string;
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

/**
 * Get user roles
 */
export const getUserRoles = async (): Promise<UserRolesResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/user-roles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch user roles: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Invite user by email
 */
export const inviteUserByEmail = async (
  workspaceId: string,
  data: InviteUserByEmailRequest
): Promise<InviteUserByEmailResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/invitations/by-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to invite user: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

