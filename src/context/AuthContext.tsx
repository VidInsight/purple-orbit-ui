/**
 * Authentication Context - Mock Mode
 * Development için mock authentication
 */

import { createContext, useContext, ReactNode } from 'react';
import type { RegisterRequest, User } from '@/types/api';

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

// Mock user data
const mockUser: User = {
  id: 'user-1',
  username: 'demo_user',
  email: 'demo@example.com',
  name: 'Demo',
  surname: 'User',
  is_email_verified: true,
  created_at: new Date().toISOString(),
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Mock authentication - always authenticated
  const login = async (emailOrUsername: string, password: string): Promise<void> => {
    console.log('Mock login:', emailOrUsername);
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    console.log('Mock register:', data);
  };

  const logout = async (): Promise<void> => {
    console.log('Mock logout');
  };

  const logoutAll = async (): Promise<void> => {
    console.log('Mock logout all');
  };

  const refreshToken = async (): Promise<boolean> => {
    return true;
  };

  const getToken = (): string | null => {
    return 'mock-token-12345';
  };

  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
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
