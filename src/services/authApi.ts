const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

import { handleApiResponse, parseApiError } from '@/utils/errorHandler';

export interface LoginRequest {
  email_or_username: string;
  password: string;
  device_type: 'web';
}

export interface LoginResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    id: string;
    username: string;
    email: string;
    access_token: string;
    refresh_token: string;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  marketing_consent: boolean;
  terms_accepted_version_id: string;
  privacy_policy_accepted_version_id: string;
}

export interface RegisterResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any;
}

export interface AgreementResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    items: Array<{
      id: string;
      agreement_type: 'terms' | 'privacy_policy';
      version: string;
      content: string;
      content_hash: string;
      effective_date: string;
      locale: string;
      is_active: boolean;
      created_by: string | null;
      notes: string;
      created_at: string;
      updated_at: string;
    }>;
  };
}

export interface VerifyEmailRequest {
  verification_token: string;
}

export interface VerifyEmailResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    id: string;
    username: string;
    email: string;
    is_verified: boolean;
  };
}

/**
 * Login API çağrısı
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/frontend/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // For login endpoint, 400/401/403 always means invalid credentials
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw new Error('INVALID_CREDENTIALS');
      }
      
      // Parse error to get user-friendly message for other errors
      const parsedError = await parseApiError(response);
      throw new Error(parsedError.description);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      throw error;
    }
    // Re-throw network errors
    throw error;
  }
};

/**
 * Register API çağrısı
 */
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/frontend/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      // Parse error to get user-friendly message
      const parsedError = await parseApiError(response);
      
      // The error handler already maps email/username conflicts to user-friendly messages
      throw new Error(parsedError.description);
    }

    return await response.json();
  } catch (error) {
    // Re-throw to preserve error type
    throw error;
  }
};

/**
 * Agreement API çağrısı
 */
export const fetchAgreement = async (locale: string): Promise<AgreementResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/frontend/agreements/active?locale=${locale}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const parsedError = await parseApiError(response);
      throw new Error(parsedError.description);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Verify Email API çağrısı
 */
export const verifyEmail = async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/frontend/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const parsedError = await parseApiError(response);
      throw new Error(parsedError.description);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

/**
 * Refresh token API çağrısı
 */
export const refreshToken = async (refreshTokenValue: string): Promise<RefreshTokenResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/frontend/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    });

    if (!response.ok) {
      const parsedError = await parseApiError(response);
      throw new Error(parsedError.description);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

