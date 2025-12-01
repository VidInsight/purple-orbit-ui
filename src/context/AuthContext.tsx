/**
 * Authentication Context
 * JWT token yönetimi, login, logout, token refresh
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { 
  saveTokens, 
  clearTokens, 
  getAccessToken, 
  getRefreshToken, 
  isTokenExpired,
  hasValidToken,
  getUserId,
  setUserId
} from '@/utils/authStorage';
import type { LoginRequest, LoginResponse, RegisterRequest, RefreshTokenRequest, RefreshTokenResponse, User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Token'ı yenile
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) {
      return false; // Zaten refresh işlemi devam ediyor
    }

    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      return false;
    }

    try {
      setIsRefreshing(true);
      
      const response = await apiClient.post<RefreshTokenResponse>(
        API_ENDPOINTS.auth.refresh,
        { refresh_token: refreshTokenValue } as RefreshTokenRequest,
        { skipAuth: true }
      );

      // Yeni token'ları kaydet
      saveTokens(
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_in
      );

      setIsRefreshing(false);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Refresh başarısız, logout yap
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setIsRefreshing(false);
      return false;
    }
  }, [isRefreshing]);

  /**
   * Kullanıcı bilgilerini yükle
   */
  const loadUser = useCallback(async () => {
    const token = getAccessToken();
    const userId = getUserId();

    if (!token || !userId || !hasValidToken()) {
      // Token yok veya expire olmuş, refresh dene
      if (getRefreshToken()) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          setIsLoading(false);
          return;
        }
      } else {
        setIsLoading(false);
        return;
      }
    }

    // Token expire olmuşsa refresh et
    if (isTokenExpired()) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        setIsLoading(false);
        return;
      }
    }

    try {
      const currentToken = getAccessToken();
      if (!currentToken || !userId) {
        setIsLoading(false);
        return;
      }

      // User bilgilerini al
      const response = await apiClient.get<User>(
        API_ENDPOINTS.user.get(userId),
        { token: currentToken }
      );

      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user:', error);
      // 401 hatası alındıysa token'ı temizle
      if (error instanceof Error && 'statusCode' in error && (error as any).statusCode === 401) {
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken]);

  /**
   * Login
   */
  const login = useCallback(async (emailOrUsername: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.auth.login,
        {
          email_or_username: emailOrUsername,
          password: password,
        } as LoginRequest,
        { skipAuth: true }
      );

      // Response format kontrolü
      if (!response.data) {
        throw new Error('Invalid response format: missing data field');
      }

      const loginData = response.data;

      // Token'ları kaydet (expires_in yoksa default 3600 kullan)
      saveTokens(
        loginData.access_token,
        loginData.refresh_token,
        loginData.expires_in || 3600,
        loginData.id
      );

      // User bilgilerini set et (backend user objesi içinde değil, direkt data içinde)
      setUser({
        id: loginData.id,
        username: loginData.username,
        email: loginData.email,
        name: '', // Backend'den gelmiyor, boş bırak
        surname: '', // Backend'den gelmiyor, boş bırak
        is_email_verified: false, // Backend'den gelmiyor, default false
        created_at: new Date().toISOString(), // Backend'den gelmiyor, şimdiki zaman
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  /**
   * Register
   */
  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    try {
      await apiClient.post(
        API_ENDPOINTS.auth.register,
        data,
        { skipAuth: true }
      );
      // Register başarılı, kullanıcı login sayfasına yönlendirilecek
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      const token = getAccessToken();
      if (token) {
        // Backend'e logout isteği gönder
        await apiClient.post(
          API_ENDPOINTS.auth.logout,
          {},
          { token }
        );
      }
    } catch (error) {
      console.error('Logout request failed:', error);
      // Hata olsa bile local logout yap
    } finally {
      // Local state'i temizle
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * Logout All (tüm session'ları sonlandır)
   */
  const logoutAll = useCallback(async (): Promise<void> => {
    try {
      const token = getAccessToken();
      if (token) {
        await apiClient.post(
          API_ENDPOINTS.auth.logoutAll,
          {},
          { token }
        );
      }
    } catch (error) {
      console.error('Logout all request failed:', error);
    } finally {
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * Token al (API client için)
   */
  const getToken = useCallback((): string | null => {
    return getAccessToken();
  }, []);

  // İlk yüklemede kullanıcı bilgilerini yükle
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Token expiry kontrolü - periyodik olarak kontrol et
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiry = async () => {
      if (isTokenExpired()) {
        await refreshToken();
      }
    };

    // Her 5 dakikada bir kontrol et
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        logoutAll,
        refreshToken,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

