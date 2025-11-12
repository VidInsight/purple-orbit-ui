import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { WorkflowItem, ColumnConfig } from '@/types/common';
import { generateMockWorkflows } from '@/utils/mockData';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Workflows = () => {
  const navigate = useNavigate();
  const [workflows] = useState<WorkflowItem[]>(generateMockWorkflows());

  const columns: ColumnConfig<WorkflowItem>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '25%',
    },
    {
      key: 'description',
      label: 'Description',
      width: '30%',
      render: (item) => (
        <span className="text-muted-foreground">{item.description}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (item) => {
        const statusColors = {
          active: 'bg-success/10 text-success',
          inactive: 'bg-muted text-muted-foreground',
          draft: 'bg-warning/10 text-warning',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'executionCount',
      label: 'Executions',
      width: '15%',
      render: (item) => (
        <span className="font-medium">{item.executionCount}</span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      width: '15%',
      render: (item) => new Date(item.updatedAt).toLocaleDateString(),
    },
  ];

  const handleCreate = () => {
    navigate('/workflows/new');
  };

  const handleView = (item: WorkflowItem) => {
    navigate(`/workflows/${item.id}/edit`);
  };

  const handleEdit = (item: WorkflowItem) => {
    navigate(`/workflows/${item.id}/edit`);
  };

  const handleDelete = async (item: WorkflowItem) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Workflow Deleted',
      description: `${item.name} has been deleted.`,
    });
  };

  return (
    <ListPageTemplate
      pageTitle="Workflows"
      pageDescription="Manage and monitor your automation workflows"
      items={workflows}
      columns={columns}
      searchPlaceholder="Search workflows..."
      createButtonText="New Workflow"
      itemTypeName="workflow"
      filterOptions={[
        { value: 'all', label: 'All Workflows' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'draft', label: 'Draft' },
      ]}
      emptyMessage="No workflows yet"
      emptyDescription="Create your first automation workflow to get started."
      onCreate={handleCreate}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      headerActions={
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      }
    />
  );
};

export default Workflows;
