import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentWorkspace, isLoading } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !currentWorkspace) {
      navigate('/');
    }
  }, [currentWorkspace, isLoading, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentWorkspace) {
    return null;
  }

  return <>{children}</>;
};
