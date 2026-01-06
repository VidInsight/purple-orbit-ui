import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { decodeToken, getAccessToken, getUserData } from '@/utils/tokenUtils';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Önce localStorage'dan kullanıcı bilgilerini yükle
        const savedUserData = getUserData();
        
        if (savedUserData) {
          // localStorage'dan gelen bilgileri kullan
          const decoded = decodeToken(accessToken);
          const user: User = {
            id: savedUserData.id,
            name: savedUserData.username,
            email: savedUserData.email,
            role: decoded?.role || 'viewer',
            lastActive: new Date().toISOString(),
            createdAt: decoded?.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
          };
          
          setCurrentUser(user);
        } else {
          // Fallback: Token'dan decode et
          const decoded = decodeToken(accessToken);
          
          if (decoded) {
            const user: User = {
              id: decoded.user_id || decoded.sub || '',
              name: decoded.username || decoded.name || 'User',
              email: decoded.email || '',
              role: decoded.role || 'viewer',
              lastActive: new Date().toISOString(),
              createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
            };
            
            setCurrentUser(user);
          } else {
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Listen for token changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tokenChange', loadUser);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenChange', loadUser);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
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
