/**
 * API Client Kullanım Örnekleri
 * 
 * Bu dosya API client'ın nasıl kullanılacağını gösterir.
 * Gerçek kodda bu örnekleri kullanabilirsiniz.
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { 
  LoginRequest, 
  LoginResponse, 
  Workflow, 
  CreateWorkflowRequest,
  ApiPaginatedResponse 
} from '@/types/api';

/**
 * Örnek 1: Login
 */
export async function loginExample(email: string, password: string) {
  try {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.auth.login,
      {
        email_or_username: email,
        password: password,
      } as LoginRequest,
      { skipAuth: true } // Login endpoint'i authentication gerektirmez
    );

    // Token'ı localStorage'a kaydet
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Örnek 2: Workspace Listesi Getirme
 */
export async function getWorkspacesExample(userId: string, token: string) {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.user.getWorkspaces(userId),
      { token }
    );

    return response.data;
  } catch (error) {
    console.error('Get workspaces error:', error);
    throw error;
  }
}

/**
 * Örnek 3: Workflow Oluşturma
 */
export async function createWorkflowExample(
  workspaceId: string,
  workflowData: CreateWorkflowRequest,
  token: string
) {
  try {
    const response = await apiClient.post<Workflow>(
      API_ENDPOINTS.workflow.create(workspaceId),
      workflowData,
      { token }
    );

    return response.data;
  } catch (error) {
    console.error('Create workflow error:', error);
    throw error;
  }
}

/**
 * Örnek 4: Workflow Listesi (Pagination ile)
 */
export async function getWorkflowsExample(
  workspaceId: string,
  token: string,
  page: number = 1,
  pageSize: number = 100
) {
  try {
    const url = `${API_ENDPOINTS.workflow.list(workspaceId)}?page=${page}&page_size=${pageSize}`;
    const response = await apiClient.get<ApiPaginatedResponse<Workflow>>(
      url,
      { token }
    );

    return response.data;
  } catch (error) {
    console.error('Get workflows error:', error);
    throw error;
  }
}

/**
 * Örnek 5: File Upload
 */
export async function uploadFileExample(
  workspaceId: string,
  file: File,
  token: string
) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('description', 'Uploaded file');

    const response = await apiClient.upload(
      API_ENDPOINTS.file.upload(workspaceId),
      formData,
      { token }
    );

    return response.data;
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
}

/**
 * Örnek 6: Error Handling
 */
export async function exampleWithErrorHandling(
  workspaceId: string,
  token: string
) {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.workflow.get(workspaceId, 'invalid-id'),
      { token }
    );

    return response.data;
  } catch (error) {
    if (error instanceof Error && 'isNotFoundError' in error) {
      // Type guard ile error'ı ApiError olarak kontrol et
      const apiError = error as any;
      
      if (apiError.isNotFoundError()) {
        console.log('Workflow not found');
        // Kullanıcıya "Workflow bulunamadı" mesajı göster
      } else if (apiError.isAuthError()) {
        console.log('Authentication failed');
        // Token yenile veya login sayfasına yönlendir
      } else if (apiError.isRateLimitError()) {
        console.log('Rate limit exceeded');
        // Kullanıcıya rate limit mesajı göster
      }
    }

    throw error;
  }
}

/**
 * Örnek 7: API Key ile Authentication
 */
export async function exampleWithApiKey(workspaceId: string, apiKey: string) {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.workflow.list(workspaceId),
      { apiKey } // API Key kullan
    );

    return response.data;
  } catch (error) {
    console.error('API Key request error:', error);
    throw error;
  }
}

