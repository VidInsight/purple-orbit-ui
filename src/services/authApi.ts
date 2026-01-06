const BASE_URL = import.meta.env.DEV 
  ? '/api' // Development'ta Vite proxy kullan
  : 'https://miniflow.vidinsight.com.tr'; // Production'da direkt API

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

/**
 * Login API çağrısı
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/frontend/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // 401 veya 403 durumunda kullanıcı adı/şifre hatası
    if (response.status === 401 || response.status === 403) {
      throw new Error('INVALID_CREDENTIALS');
    }
    throw new Error(errorData.message || `Login failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Register API çağrısı
 */
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await fetch(`${BASE_URL}/frontend/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Registration failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Agreement API çağrısı
 */
export const fetchAgreement = async (locale: string): Promise<AgreementResponse> => {
  const response = await fetch(`${BASE_URL}/frontend/agreements/active?locale=${locale}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Agreement fetch failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

