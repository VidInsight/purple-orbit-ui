/**
 * Authentication Storage Utilities
 * JWT token'ları güvenli bir şekilde saklama ve yönetme
 */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const USER_ID_KEY = 'user_id';

/**
 * Token'ı localStorage'a kaydet
 */
export const saveTokens = (
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  userId?: string
): void => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    // Token expiry time'ı hesapla (şu anki zaman + expires_in saniye)
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    if (userId) {
      localStorage.setItem(USER_ID_KEY, userId);
    }
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

/**
 * Access token'ı al
 */
export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Refresh token'ı al
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Token'ların expire olup olmadığını kontrol et
 */
export const isTokenExpired = (): boolean => {
  try {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;
    
    const expiry = parseInt(expiryTime, 10);
    const now = Date.now();
    
    // 5 dakika önceden expire say (buffer)
    const buffer = 5 * 60 * 1000; // 5 dakika
    return now >= (expiry - buffer);
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Token'ların geçerli olup olmadığını kontrol et
 */
export const hasValidToken = (): boolean => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  if (!accessToken || !refreshToken) {
    return false;
  }
  
  return !isTokenExpired();
};

/**
 * Tüm token'ları temizle
 */
export const clearTokens = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * User ID'yi al
 */
export const getUserId = (): string | null => {
  try {
    return localStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * User ID'yi kaydet
 */
export const setUserId = (userId: string): void => {
  try {
    localStorage.setItem(USER_ID_KEY, userId);
  } catch (error) {
    console.error('Error setting user ID:', error);
  }
};

