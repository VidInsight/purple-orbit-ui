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
import { getExecutions } from '@/services/executionsApi';
import { CredentialItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';

interface ExecutionStats {
  success: number;
  failed: number;
  running: number;
}

const Dashboard = () => {
  const { currentWorkspace } = useWorkspace();
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [executionStats, setExecutionStats] = useState<ExecutionStats>({ success: 0, failed: 0, running: 0 });
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(false);

  useEffect(() => {
    loadCredentials();
    loadExecutions();
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

  const loadExecutions = async () => {
    if (!currentWorkspace?.id) {
      setExecutionStats({ success: 0, failed: 0, running: 0 });
      return;
    }

    try {
      setIsLoadingExecutions(true);
      const response = await getExecutions(currentWorkspace.id);

      console.log('API Response:', response);
      console.log('Response data:', response.data);

      // API'den gelen execution'ları say
      const executions = response.data?.executions || [];
      
      console.log('Executions array:', executions);
      console.log('Executions count:', executions.length);

      // API'den gelen status değerleri büyük harfle geliyor: COMPLETED, FAILED, RUNNING, CANCELLED
      const statusMap: Record<string, 'success' | 'failed' | 'running'> = {
        'COMPLETED': 'success',
        'FAILED': 'failed',
        'RUNNING': 'running',
        'CANCELLED': 'failed', // Cancelled'ı failed olarak sayıyoruz
      };
      
      const stats: ExecutionStats = {
        success: 0,
        failed: 0,
        running: 0,
      };

      executions.forEach((execution: any) => {
        console.log('Processing execution:', execution.id, 'Status:', execution.status);
        const mappedStatus = statusMap[execution.status];
        if (mappedStatus === 'success') {
          stats.success++;
        } else if (mappedStatus === 'failed') {
          stats.failed++;
        } else if (mappedStatus === 'running') {
          stats.running++;
        } else {
          console.warn('Unknown execution status:', execution.status);
        }
      });

      console.log('Execution stats calculated:', stats, 'from', executions.length, 'executions');
      setExecutionStats(stats);
    } catch (error) {
      console.error('Error loading executions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load execution statistics',
        variant: 'destructive',
      });
      setExecutionStats({ success: 0, failed: 0, running: 0 });
    } finally {
      setIsLoadingExecutions(false);
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
            {isLoadingExecutions ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface rounded-lg border border-border p-4 flex items-center gap-3 animate-pulse">
                    <div className="h-5 w-5 bg-muted rounded"></div>
                    <div>
                      <div className="h-8 w-16 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ExecutionStatsMini stats={executionStats} />
            )}
            {isLoadingExecutions ? (
              <div className="bg-surface rounded-lg border border-border p-6 animate-pulse">
                <div className="h-[280px] flex items-center justify-center">
                  <div className="text-muted-foreground">Yükleniyor...</div>
                </div>
              </div>
            ) : (
              <ExecutionSuccessChart data={executionStats} />
            )}

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
