/**
 * API Client
 * MiniFlow Enterprise API için merkezi HTTP client
 * 
 * Özellikler:
 * - JWT Bearer Token authentication
 * - API Key authentication
 * - Automatic token refresh on 401
 * - Standart error handling
 * - Request ID tracking
 * - Type-safe responses
 */

import { ApiResponse, ApiErrorResponse, ApiSuccessResponse } from '@/types/api';
import { getAccessToken, getRefreshToken, isTokenExpired } from '@/utils/authStorage';
import { API_ENDPOINTS, BASE_URL } from '@/config/api';
import type { RefreshTokenRequest, RefreshTokenResponse } from '@/types/api';

interface RequestOptions extends RequestInit {
  token?: string;
  apiKey?: string;
  skipAuth?: boolean;
  autoRefresh?: boolean; // Otomatik token refresh (default: true)
  params?: Record<string, string | number | boolean | undefined>; // Query parameters
}

/**
 * API Client Class
 */
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  /**
   * Token refresh helper
   */
  private async refreshAccessToken(): Promise<string | null> {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      return null;
    }

    try {
      // Direct fetch kullan (döngüsel import'u önlemek için)
      const url = `${this.baseURL}${API_ENDPOINTS.auth.refresh.replace(this.baseURL, '')}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as ApiSuccessResponse<RefreshTokenResponse>;
      
      // Token'ları kaydet
      const { saveTokens } = await import('@/utils/authStorage');
      saveTokens(
        data.data.access_token,
        data.data.refresh_token,
        data.data.expires_in
      );

      return data.data.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  /**
   * Core request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    retryCount: number = 0
  ): Promise<ApiSuccessResponse<T>> {
    const { token, apiKey, skipAuth = false, autoRefresh = true, params, ...fetchOptions } = options;

    // Headers oluştur
    // GET isteklerinde Content-Type header'ı ekleme (preflight isteğini tetikler)
    // POST/PUT/PATCH isteklerinde ekleyeceğiz
    const headers: HeadersInit = {
      ...fetchOptions.headers,
    };
    
    // Sadece body olan isteklerde Content-Type ekle (GET isteklerinde body yok)
    if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'DELETE') {
      headers['Content-Type'] = 'application/json';
    }

    // Authentication
    let authToken = token;
    if (!skipAuth) {
      if (apiKey) {
        headers['X-API-KEY'] = apiKey;
      } else {
        // Token yoksa storage'dan al
        if (!authToken) {
          authToken = getAccessToken();
        }
        
        // Token expire olmuşsa ve autoRefresh aktifse refresh et
        if (authToken && isTokenExpired() && autoRefresh && retryCount === 0) {
          const refreshedToken = await this.refreshAccessToken();
          if (refreshedToken) {
            authToken = refreshedToken;
          }
        }

        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
      }
    }

    // Request ID oluştur (opsiyonel, backend otomatik oluşturur)
    // GET isteklerinde custom header'lar preflight isteğini tetikler, bu yüzden sadece POST/PUT/PATCH/DELETE isteklerinde ekle
    const requestId = crypto.randomUUID();
    const isGetRequest = fetchOptions.method === 'GET' || !fetchOptions.method;
    if (!isGetRequest) {
      headers['X-Request-ID'] = requestId;
    }

    // URL oluştur
    let url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Query parameters ekle
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Response body'yi parse et
      let data: ApiResponse<T>;
      try {
        // Content-Type kontrolü - eğer JSON değilse text olarak oku
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json() as ApiResponse<T>;
        } else {
          // JSON değilse text olarak oku ve parse et
          const text = await response.text();
          if (!text) {
            throw new ApiError(
              'Empty response body',
              response.status,
              'EMPTY_RESPONSE',
              requestId
            );
          }
          data = JSON.parse(text) as ApiResponse<T>;
        }
      } catch (parseError) {
        // JSON parse hatası
        console.error('Failed to parse response:', parseError, 'Response status:', response.status);
        throw new ApiError(
          parseError instanceof Error ? parseError.message : 'Failed to parse response',
          response.status,
          'PARSE_ERROR',
          requestId
        );
      }

      // 401 Unauthorized - Token refresh dene
      if (response.status === 401 && autoRefresh && retryCount === 0 && !skipAuth && !apiKey) {
        const refreshedToken = await this.refreshAccessToken();
        if (refreshedToken) {
          // Retry request with new token
          return this.request<T>(endpoint, { ...options, token: refreshedToken }, retryCount + 1);
        } else {
          // Refresh başarısız, logout yapılmalı
          const { clearTokens } = await import('@/utils/authStorage');
          clearTokens();
          // Event dispatch edilebilir (logout için)
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }

      // Error handling
      if (!response.ok) {
        // HTTP status code hatası
        const error = (data as ApiErrorResponse) || {};
        throw new ApiError(
          error.error_message || response.statusText || 'Request failed',
          response.status,
          error.error_code || 'HTTP_ERROR',
          error.traceId || requestId
        );
      }

      // Response format kontrolü - daha esnek
      if (!data || typeof data !== 'object') {
        console.error('Invalid response format - not an object:', data);
        throw new ApiError(
          'Invalid response format',
          response.status,
          'INVALID_RESPONSE_FORMAT',
          requestId
        );
      }

      // Error response kontrolü
      if (data.status === 'error') {
        const error = data as ApiErrorResponse;
        throw new ApiError(
          error.error_message || 'Request failed',
          error.code || response.status,
          error.error_code || 'API_ERROR',
          error.traceId || requestId
        );
      }

      // Success response kontrolü - data field'ı olmalı
      if (!('data' in data)) {
        console.error('Invalid response format - missing data field:', data);
        // Eğer data field yoksa ama response başarılıysa, tüm response'u data olarak kabul et
        return {
          status: 'success' as const,
          code: response.status,
          message: (data as any).message || null,
          traceId: (data as any).traceId || requestId,
          timestamp: (data as any).timestamp || new Date().toISOString(),
          data: data as T, // Tüm response'u data olarak kabul et
        } as ApiSuccessResponse<T>;
      }

      return data as ApiSuccessResponse<T>;
    } catch (error) {
      // Network errors
      if (error instanceof ApiError) {
        throw error;
      }

      // Fetch errors (network, timeout, etc.)
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        'NETWORK_ERROR',
        requestId
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiSuccessResponse<T>> {
    // GET isteklerinde Content-Type header'ına gerek yok ve preflight isteğini tetikleyebilir
    // Custom headers da preflight isteğini tetikler, bu yüzden sadece gerekli olanları ekleyelim
    const { headers, ...restOptions } = options;
    return this.request<T>(endpoint, {
      ...restOptions,
      method: 'GET',
      headers: {
        // Content-Type ekleme - GET isteklerinde gerekli değil ve preflight tetikler
        ...(headers || {}),
      },
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * File upload (multipart/form-data)
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<ApiSuccessResponse<T>> {
    const { token, apiKey, skipAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
      // Don't set Content-Type for FormData, browser will set it with boundary
      ...fetchOptions.headers,
    };

    // Authentication
    if (!skipAuth) {
      if (apiKey) {
        headers['X-API-KEY'] = apiKey;
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Request ID
    const requestId = crypto.randomUUID();
    headers['X-Request-ID'] = requestId;

    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => ({})) as ApiResponse<T>;

      if (!response.ok || data.status === 'error') {
        const error = data as ApiErrorResponse;
        throw new ApiError(
          error.error_message || response.statusText,
          error.code || response.status,
          error.error_code,
          error.traceId
        );
      }

      return data as ApiSuccessResponse<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        'NETWORK_ERROR',
        requestId
      );
    }
  }
}

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode: string,
    public traceId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Check if error is a specific error code
   */
  is(errorCode: string): boolean {
    return this.errorCode === errorCode;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.errorCode === 'VALIDATION_ERROR' || this.statusCode === 422;
  }

  /**
   * Check if error is authentication error
   */
  isAuthError(): boolean {
    return this.errorCode === 'AUTHENTICATION_FAILED' || this.statusCode === 401;
  }

  /**
   * Check if error is forbidden error
   */
  isForbiddenError(): boolean {
    return this.errorCode === 'FORBIDDEN' || this.statusCode === 403;
  }

  /**
   * Check if error is not found error
   */
  isNotFoundError(): boolean {
    return this.errorCode === 'RESOURCE_NOT_FOUND' || this.statusCode === 404;
  }

  /**
   * Check if error is rate limit error
   */
  isRateLimitError(): boolean {
    return this.errorCode.includes('RATE_LIMIT') || this.statusCode === 429;
  }
}

// Singleton instance - base URL'i environment variable'dan al
const getBaseURL = () => {
  // BASE_URL development ortamında boş string olabilir (proxy kullanılacak)
  // Production'da env değişkeni veya default backend URL'i içerir
  return BASE_URL || '';
};

export const apiClient = new ApiClient(getBaseURL());

