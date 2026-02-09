import { apiClient, getBaseUrl } from '@/utils/apiClient';
import { decodeToken } from '@/utils/tokenUtils';

const BASE_URL = getBaseUrl();

export interface WorkspaceApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    owned_workspaces: any[];
    memberships: any[];
  };
}

export interface CreateWorkspaceRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface CreateWorkspaceResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Get user workspaces from API
 * If userId is not provided, it will be extracted from token
 */
export const getUserWorkspaces = async (userId?: string): Promise<WorkspaceApiResponse> => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    throw new Error('No access token found. Please login again.');
  }

  // If userId not provided, try to get from token
  let finalUserId = userId;
  if (!finalUserId) {
    try {
      const decoded = decodeToken(accessToken);
      finalUserId = decoded?.user_id || decoded?.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  if (!finalUserId) {
    throw new Error('User ID not found in token. Please login again.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/user/${finalUserId}/workspaces`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch workspaces: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Create a new workspace
 */
export const createWorkspace = async (workspaceData: CreateWorkspaceRequest): Promise<CreateWorkspaceResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces`, {
    method: 'POST',
    body: JSON.stringify(workspaceData),
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

    // Eğer workspace adı/slug'ı zaten varsa backend genelde 400 dönecektir.
    // Bu durumda kullanıcıya daha açıklayıcı ve lokalize bir mesaj gösterelim.
    if (response.status === 400) {
      const msg = (errorData.message || '').toString().toLowerCase();
      if (msg.includes('already exists') || msg.includes('unique') || msg.includes('slug')) {
        throw new Error('Bu isimle workspace oluşturamazsınız. Lütfen farklı bir isim deneyin.');
      }
    }

    // Kullanıcının paketine göre izin verilen maksimum workspace sayısını aştığı durum.
    // Backend bu durumda genellikle 403 döner veya özel bir hata kodu/mesajı iletir.
    const errorCode = (errorData.code || errorData.error || '').toString();
    const messageText = (errorData.message || '').toString().toLowerCase();
    if (
      response.status === 400 ||
      response.status === 403 ||
      response.status === 429 ||
      errorCode === 'WORKSPACE_LIMIT_EXCEEDED' ||
      messageText.includes('workspace limit') ||
      messageText.includes('maximum workspace') ||
      messageText.includes('workspace sayisi') ||
      messageText.includes('workspace sayısı') ||
      messageText.includes('paket') && messageText.includes('workspace')
    ) {
      throw new Error(
        'Paketiniz kapsamında oluşturabileceğiniz maksimum workspace sayısına ulaştınız. ' +
          'Yeni bir workspace oluşturmak için planınızı yükseltebilir veya mevcut bir workspace\'i silebilirsiniz.'
      );
    }

    throw new Error(errorData.message || errorData.error || `Failed to create workspace: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface UpdateWorkspaceRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateWorkspaceResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Update workspace information
 */
export const updateWorkspace = async (
  workspaceId: string,
  workspaceData: UpdateWorkspaceRequest
): Promise<UpdateWorkspaceResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}`, {
    method: 'PUT',
    body: JSON.stringify(workspaceData),
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
    throw new Error(errorData.message || errorData.error || `Failed to update workspace: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface DeleteWorkspaceResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Delete a workspace
 */
export const deleteWorkspace = async (workspaceId: string): Promise<DeleteWorkspaceResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to delete workspace: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

