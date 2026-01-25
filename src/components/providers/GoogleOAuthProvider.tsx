import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleOAuthProviderProps {
  children: ReactNode;
}

export const GoogleOAuthProviderWrapper = ({ children }: GoogleOAuthProviderProps) => {
  // Get client ID from environment variable, or use fallback for development
  const clientId = 
    import.meta.env.VITE_GOOGLE_CLIENT_ID || 
    (import.meta.env.DEV ? '45938946958-e899q13pdgsfgm6q3kd8oi9b18s3sjle.apps.googleusercontent.com' : null);

  if (!clientId) {
    console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

