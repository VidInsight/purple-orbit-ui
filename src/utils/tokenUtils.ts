/**
 * Decode JWT token and extract payload
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user ID from access token
 */
export const getUserIdFromToken = (): string | null => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) return null;
  
  const decoded = decodeToken(accessToken);
  return decoded?.user_id || decoded?.sub || null;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

/**
 * Clear all tokens
 */
export const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Save user data to localStorage
 */
export const saveUserData = (userData: { id: string; username: string; email: string }): void => {
  localStorage.setItem('user_data', JSON.stringify(userData));
  // Trigger custom event to notify UserContext
  window.dispatchEvent(new Event('tokenChange'));
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): { id: string; username: string; email: string } | null => {
  const userDataStr = localStorage.getItem('user_data');
  if (!userDataStr) return null;
  
  try {
    return JSON.parse(userDataStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Clear all localStorage data (used on logout)
 */
export const clearAllLocalStorage = (): void => {
  // Clear tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Clear user data
  localStorage.removeItem('user_data');
  
  // Clear workspace data
  localStorage.removeItem('automation_workspaces');
  localStorage.removeItem('current_workspace');
  
  // Clear workflow data
  localStorage.removeItem('workflows');
  
  // Clear UI preferences
  localStorage.removeItem('theme');
  localStorage.removeItem('navbar-collapsed');
  localStorage.removeItem('recentlyUsedNodes');
  
  // Clear demo/seed data flag
  localStorage.removeItem('demo_data_seeded');
  
  // Clear i18next language preference
  localStorage.removeItem('i18nextLng');
};

/**
 * Logout user and redirect to login page
 */
export const logout = (): void => {
  clearAllLocalStorage();
  // Trigger token change event to update UserContext
  window.dispatchEvent(new Event('tokenChange'));
  // Redirect to login page
  window.location.href = '/login';
};

