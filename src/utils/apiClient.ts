/**
 * API Client with automatic token refresh and 401 error handling
 */

const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

import { getAccessToken, getRefreshToken, isTokenExpired, logout } from './tokenUtils';
import { refreshToken } from '@/services/authApi';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempt to refresh the access token using refresh token
 */
const attemptTokenRefresh = async (): Promise<string | null> => {
  // If already refreshing, wait for the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshTokenValue = getRefreshToken();
      
      if (!refreshTokenValue) {
        console.warn('No refresh token available');
        logout();
        return null;
      }

      // Check if refresh token is expired
      if (isTokenExpired(refreshTokenValue)) {
        console.warn('Refresh token expired');
        logout();
        return null;
      }

      // Call refresh token API
      const response = await refreshToken(refreshTokenValue);
      
      if (response.data?.access_token && response.data?.refresh_token) {
        // Save new tokens
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Trigger token change event
        window.dispatchEvent(new Event('tokenChange'));
        
        return response.data.access_token;
      } else {
        console.warn('Invalid refresh token response');
        logout();
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * API client that automatically handles token refresh and 401 errors
 */
export const apiClient = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Get current access token
  let accessToken = getAccessToken();

  // Check if token is expired before making request
  if (accessToken && isTokenExpired(accessToken)) {
    console.log('Access token expired, attempting refresh...');
    accessToken = await attemptTokenRefresh();
    
    if (!accessToken) {
      // Refresh failed, user will be logged out
      throw new Error('Authentication failed. Please login again.');
    }
  }

  // Prepare headers
  const headers = new Headers(options.headers || {});
  
  // Add Authorization header if we have a token
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Add Content-Type if not already set
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token might have expired during request
  if (response.status === 401) {
    console.log('Received 401, attempting token refresh...');
    
    // Try to refresh token
    const newAccessToken = await attemptTokenRefresh();
    
    if (newAccessToken) {
      // Retry the original request with new token
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      
      // Clone the request options for retry
      const retryOptions: RequestInit = {
        ...options,
        headers,
      };
      
      response = await fetch(url, retryOptions);
      
      // If still 401 after refresh, logout
      if (response.status === 401) {
        console.error('Still 401 after token refresh, logging out...');
        logout();
        throw new Error('Authentication failed. Please login again.');
      }
    } else {
      // Refresh failed, user already logged out
      throw new Error('Authentication failed. Please login again.');
    }
  }

  return response;
};

/**
 * Convenience method for GET requests
 */
export const apiGet = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return apiClient(url, {
    ...options,
    method: 'GET',
  });
};

/**
 * Convenience method for POST requests
 */
export const apiPost = async (url: string, body?: any, options: RequestInit = {}): Promise<Response> => {
  return apiClient(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Convenience method for PUT requests
 */
export const apiPut = async (url: string, body?: any, options: RequestInit = {}): Promise<Response> => {
  return apiClient(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Convenience method for DELETE requests
 */
export const apiDelete = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return apiClient(url, {
    ...options,
    method: 'DELETE',
  });
};

/**
 * Get the base URL for API calls
 */
export const getBaseUrl = (): string => BASE_URL;

