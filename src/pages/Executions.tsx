import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { ExecutionItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getExecutions } from '@/services/executionsApi';

const Executions = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExecutions = async () => {
    if (!currentWorkspace?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getExecutions(currentWorkspace.id);

      // Map API response to ExecutionItem type
      const mappedExecutions: ExecutionItem[] = response.data.executions.map((execution) => {
        // Map status from API format to ExecutionItem format
        const statusMap: Record<string, 'success' | 'failed' | 'running' | 'cancelled'> = {
          'COMPLETED': 'success',
          'FAILED': 'failed',
          'RUNNING': 'running',
          'CANCELLED': 'cancelled',
        };

        const mappedStatus = statusMap[execution.status] || 'failed';

        return {
          id: execution.id,
          name: `Execution ${execution.id.substring(0, 8)}`,
          description: `Workflow execution from ${new Date(execution.started_at).toLocaleString()}`,
          workflowId: execution.workflow_id,
          workflowName: execution.workflow_id, // TODO: Fetch workflow name if needed
          status: mappedStatus,
          duration: execution.duration,
          startedAt: execution.started_at,
          completedAt: execution.ended_at || undefined,
          createdAt: execution.started_at,
          updatedAt: execution.ended_at || execution.started_at,
        };
      });

      // En yeni tarih en üstte: startedAt'e göre azalan sıralama
      mappedExecutions.sort((a, b) => {
        const dateA = new Date(a.startedAt).getTime();
        const dateB = new Date(b.startedAt).getTime();
        return dateB - dateA;
      });

      setExecutions(mappedExecutions);
    } catch (error) {
      console.error('Error loading executions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load executions',
        variant: 'destructive',
      });
      setExecutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, [currentWorkspace]);

  const handleView = (item: ExecutionItem) => {
    navigate(`/executions/${item.id}`);
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Please select a workspace first.</p>
        </div>
      </div>
    );
  }

  return (
    <ListPageTemplate
      pageTitle="Executions"
      pageDescription="View execution history and logs"
      items={executions}
      isLoading={isLoading}
      searchPlaceholder="Search executions..."
      itemTypeName="execution"
      filterOptions={[
        { value: 'all', label: 'All Executions' },
        { value: 'success', label: 'Success' },
        { value: 'failed', label: 'Failed' },
        { value: 'running', label: 'Running' },
        { value: 'cancelled', label: 'Cancelled' },
      ]}
      emptyMessage="No executions yet"
      emptyDescription="Your workflow runs will appear here."
      onView={handleView}
      itemsPerPage={15}
    />
  );
};

export default Executions;
