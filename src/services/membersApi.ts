const BASE_URL =   'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

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

export interface PendingInvitationItem {
  id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  invited_by: string;
  inviter_name: string;
  inviter_email: string;
  role_id: string;
  role_name: string;
  message: string;
  created_at: string;
}

export interface PendingInvitationsResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    user_id: string;
    pending_invitations: PendingInvitationItem[];
    count: number;
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

/**
 * Get pending invitations for a user
 */
export const getUserPendingInvitations = async (userId: string): Promise<PendingInvitationsResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspaces/user/${userId}/invitations/pending`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch pending invitations: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface AcceptInvitationResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

export interface DeclineInvitationResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Accept a workspace invitation
 */
export const acceptInvitation = async (invitationId: string): Promise<AcceptInvitationResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspaces/invitations/${invitationId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to accept invitation: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Decline a workspace invitation
 */
export const declineInvitation = async (invitationId: string): Promise<DeclineInvitationResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspaces/invitations/${invitationId}/decline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to decline invitation: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface LeaveWorkspaceResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Leave a workspace (for invited members)
 */
export const leaveWorkspace = async (workspaceId: string): Promise<LeaveWorkspaceResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to leave workspace: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface RemoveWorkspaceMemberResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Remove a member from workspace (for owners/admins)
 */
export const removeWorkspaceMember = async (
  workspaceId: string,
  userId: string
): Promise<RemoveWorkspaceMemberResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${BASE_URL}/frontend/workspaces/${workspaceId}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to remove member: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

