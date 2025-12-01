import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!workspaceLoading && !currentWorkspace && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, currentWorkspace, workspaceLoading, navigate]);

  if (authLoading || workspaceLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!currentWorkspace) {
    return null;
  }

  return <>{children}</>;
};
