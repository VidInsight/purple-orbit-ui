import { apiClient, getBaseUrl } from '@/utils/apiClient';

const BASE_URL = getBaseUrl();

export interface FilesApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

export interface UploadFileRequest {
  name: string;
  description?: string;
  tags?: string[];
  file: File;
}

/**
 * Upload file to workspace
 */
export const uploadFile = async (
  workspaceId: string,
  fileData: UploadFileRequest
): Promise<FilesApiResponse> => {
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', fileData.file);
  formData.append('name', fileData.name);
  
  if (fileData.description) {
    formData.append('description', fileData.description);
  }
  
  if (fileData.tags && fileData.tags.length > 0) {
    // Tags'i JSON string olarak gönder veya her birini ayrı ayrı
    formData.append('tags', JSON.stringify(fileData.tags));
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/files`, {
    method: 'POST',
    body: formData,
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
    throw new Error(errorData.message || errorData.error || `Failed to upload file: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Get files for a workspace
 */
export const getFiles = async (workspaceId: string): Promise<FilesApiResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/files`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch files: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface DeleteFileResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Delete file by ID
 */
export const deleteFile = async (
  workspaceId: string,
  fileId: string
): Promise<DeleteFileResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/files/${fileId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to delete file: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface FileDetail {
  id: string;
  workspace_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  size: number;
  type: string;
  url: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface FileDetailApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: FileDetail;
}

/**
 * Get file detail by ID
 */
export const getFileDetail = async (
  workspaceId: string,
  fileId: string
): Promise<FileDetailApiResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/files/${fileId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to fetch file detail: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface UpdateFileRequest {
  name: string;
  description?: string;
  tags?: string[];
}

export interface UpdateFileResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

/**
 * Update file by ID
 */
export const updateFile = async (
  workspaceId: string,
  fileId: string,
  updateData: UpdateFileRequest
): Promise<UpdateFileResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/files/${fileId}`, {
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
    throw new Error(errorData.message || errorData.error || `Failed to update file: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

