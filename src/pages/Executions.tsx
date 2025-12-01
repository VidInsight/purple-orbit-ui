import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Execution, PaginationResponse } from '@/types/api';

const Executions = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { getToken } = useAuth();

  // Fetch executions
  const { data: executionsData, isLoading } = useQuery({
    queryKey: ['executions', currentWorkspace?.id],
    queryFn: () => apiClient.get<PaginationResponse<Execution[]>>(
      API_ENDPOINTS.execution.list(currentWorkspace!.id),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!getToken(),
  });

  const executions = executionsData?.data.items || [];

  const handleView = (item: { id: string; name: string }) => {
    navigate(`/executions/${item.id}`);
  };

  // Map Execution to ListPageTemplate format
  const mappedExecutions = executions.map((execution) => ({
    id: execution.id,
    name: `Execution ${execution.id.slice(-8)}`,
    description: `Status: ${execution.status} | Started: ${new Date(execution.started_at).toLocaleString()}`,
  }));

  return (
    <ListPageTemplate
      pageTitle="Executions"
      pageDescription="View execution history and logs"
      items={mappedExecutions}
      isLoading={isLoading}
      searchPlaceholder="Search executions..."
      itemTypeName="execution"
      filterOptions={[
        { value: 'all', label: 'All Executions' },
        { value: 'COMPLETED', label: 'Success' },
        { value: 'FAILED', label: 'Failed' },
        { value: 'RUNNING', label: 'Running' },
        { value: 'CANCELLED', label: 'Cancelled' },
      ]}
      emptyMessage="No executions yet"
      emptyDescription="Your workflow runs will appear here."
      onView={handleView}
    />
  );
};

export default Executions;
