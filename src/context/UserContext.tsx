import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import type { User as ApiUser } from '@/types/api';

// User type'ını API'den gelen type'a uyarla
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'editor' | 'viewer';
  lastActive?: string;
  createdAt?: string;
}

interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider - AuthContext'ten user bilgisini alır
 * AuthContext zaten user bilgisini yönetiyor, bu context sadece compatibility için
 */
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // API User type'ını app User type'ına dönüştür
    if (authUser) {
      setCurrentUser({
        id: authUser.id,
        name: `${authUser.name || ''} ${authUser.surname || ''}`.trim() || authUser.username,
        email: authUser.email,
        avatar: authUser.avatar_url,
        role: 'admin', // API'den role gelmiyorsa default
        lastActive: new Date().toISOString(),
        createdAt: authUser.created_at,
      });
    } else {
      setCurrentUser(null);
    }
  }, [authUser]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading: authLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
