import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { ExecutionItem, ColumnConfig } from '@/types/common';
import { generateMockExecutions } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const Executions = () => {
  const [executions] = useState<ExecutionItem[]>(generateMockExecutions());

  const columns: ColumnConfig<ExecutionItem>[] = [
    {
      key: 'workflowName',
      label: 'Workflow',
      width: '25%',
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (item) => {
        const statusColors = {
          success: 'bg-success/10 text-success',
          failed: 'bg-destructive/10 text-destructive',
          running: 'bg-primary/10 text-primary',
          cancelled: 'bg-muted text-muted-foreground',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'duration',
      label: 'Duration',
      width: '15%',
      render: (item) => item.duration ? `${item.duration}s` : '-',
    },
    {
      key: 'startedAt',
      label: 'Started At',
      width: '20%',
      render: (item) => new Date(item.startedAt).toLocaleString(),
    },
    {
      key: 'completedAt',
      label: 'Completed At',
      width: '25%',
      render: (item) => item.completedAt ? new Date(item.completedAt).toLocaleString() : '-',
    },
  ];

  const handleView = (item: ExecutionItem) => {
    toast({
      title: 'View Execution',
      description: `Opening execution details...`,
    });
  };

  return (
    <ListPageTemplate
      pageTitle="Executions"
      pageDescription="View execution history and logs"
      items={executions}
      columns={columns}
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
