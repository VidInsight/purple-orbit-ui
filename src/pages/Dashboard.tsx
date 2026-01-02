import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpdatesFeed } from '@/components/dashboard/UpdatesFeed';
import { QuotasWidget } from '@/components/dashboard/QuotasWidget';
import { ExecutionStatsMini } from '@/components/dashboard/ExecutionStatsMini';
import { ExecutionSuccessChart } from '@/components/dashboard/ExecutionSuccessChart';
import { CredentialsList } from '@/components/dashboard/CredentialsList';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getCredentials } from '@/services/credentialsApi';
import { CredentialItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';

// Mock data - gerçek API'den gelecek
const mockExecutionStats = { success: 142, failed: 8, running: 3 };

const Dashboard = () => {
  const { currentWorkspace } = useWorkspace();
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, [currentWorkspace]);

  const loadCredentials = async () => {
    if (!currentWorkspace?.id) {
      setCredentials([]);
      return;
    }

    try {
      setIsLoadingCredentials(true);
      const response = await getCredentials(currentWorkspace.id);

      // Map API response to CredentialItem type
      const mappedCredentials: CredentialItem[] = [];
      
      // API response formatına göre credentials'leri map et
      const credentialsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || response.data?.credentials || [];

      credentialsData.forEach((cred: any) => {
        mappedCredentials.push({
          id: cred.id || cred.credential_id || `credential-${Date.now()}`,
          name: cred.name || cred.credential_name || 'Unnamed Credential',
          description: cred.description || cred.credential_description,
          type: cred.type || cred.credential_type || 'unknown',
          createdAt: cred.created_at || cred.createdAt || new Date().toISOString(),
          updatedAt: cred.updated_at || cred.updatedAt || new Date().toISOString(),
          lastUsed: cred.last_used || cred.lastUsed || cred.last_used_at,
        });
      });

      setCredentials(mappedCredentials);
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load credentials',
        variant: 'destructive',
      });
      setCredentials([]);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px]">
        <PageHeader
          title="Dashboard"
          description="Overview of your automation workspace"
        />

        <div className="flex gap-8">
          {/* Left Side - Main Content */}
          <div className="flex-1 space-y-6">
            <ExecutionStatsMini stats={mockExecutionStats} />
            <ExecutionSuccessChart data={mockExecutionStats} />

            <CredentialsList credentials={credentials} isLoading={isLoadingCredentials} />
          </div>

          {/* Right Side - Quotas & Updates (Sticky) */}
          <div className="w-64 space-y-6 sticky top-6 self-start flex-shrink-0">
            <QuotasWidget />
            <UpdatesFeed />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
