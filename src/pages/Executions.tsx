import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { ExecutionItem } from '@/types/common';
import { generateMockExecutions } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const Executions = () => {
  const navigate = useNavigate();
  const [executions] = useState<ExecutionItem[]>(generateMockExecutions());

  const handleView = (item: ExecutionItem) => {
    navigate(`/executions/${item.id}`);
  };

  return (
    <ListPageTemplate
      pageTitle="Executions"
      pageDescription="View execution history and logs"
      items={executions}
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
    />
  );
};

export default Executions;
