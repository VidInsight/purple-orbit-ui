import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { WorkflowItem } from '@/types/common';
import { generateMockWorkflows } from '@/utils/mockData';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Workflows = () => {
  const navigate = useNavigate();
  const [workflows] = useState<WorkflowItem[]>(generateMockWorkflows());

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
