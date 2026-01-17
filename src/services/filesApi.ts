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

  console.log('Uploading file for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/files`);
  console.log('File data:', {
    name: fileData.name,
    description: fileData.description,
    tags: fileData.tags,
    fileName: fileData.file.name,
    fileSize: fileData.file.size,
    fileType: fileData.file.type,
  });

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
  console.log('Upload file API response:', data);
  return data;
};

/**
 * Get files for a workspace
 */
export const getFiles = async (workspaceId: string): Promise<FilesApiResponse> => {
  console.log('Fetching files for workspace:', workspaceId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/files`);

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
  console.log('Files API response:', data);
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
  console.log('Deleting file for workspace:', workspaceId, 'file:', fileId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/files/${fileId}`);

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
  console.log('Delete file API response:', data);
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
  console.log('Fetching file detail for workspace:', workspaceId, 'file:', fileId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/files/${fileId}`);

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
  console.log('File detail API response:', data);
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
  console.log('Updating file for workspace:', workspaceId, 'file:', fileId);
  console.log('Request URL:', `${BASE_URL}/frontend/workspaces/${workspaceId}/files/${fileId}`);
  console.log('Update data:', updateData);

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
  console.log('Update file API response:', data);
  return data;
};

