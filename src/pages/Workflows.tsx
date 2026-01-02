import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { WorkflowItem } from '@/types/common';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getWorkflows, getWorkflowDetail, WorkflowDetail } from '@/services/workflowApi';
import { CreateWorkflowModal } from '@/components/workflow-builder/CreateWorkflowModal';
import { WorkflowDetailModal } from '@/components/workflow-builder/WorkflowDetailModal';

const Workflows = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [workflowDetail, setWorkflowDetail] = useState<WorkflowDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleCreate = () => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Please select a workspace first before creating a workflow.',
        variant: 'destructive',
      });
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleView = async (item: WorkflowItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoadingDetail(true);
      setIsDetailModalOpen(true);
      const response = await getWorkflowDetail(currentWorkspace.id, item.id);
      setWorkflowDetail(response.data);
    } catch (error) {
      console.error('Error loading workflow detail:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load workflow details',
        variant: 'destructive',
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = (item: WorkflowItem) => {
    navigate(`/workflows/${item.id}/edit`);
  };

  useEffect(() => {
    loadWorkflows();
  }, [currentWorkspace]);

  const loadWorkflows = async () => {
    if (!currentWorkspace?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getWorkflows(currentWorkspace.id);

      // Map API response to WorkflowItem type
      const mappedWorkflows: WorkflowItem[] = [];
      
      // API response formatına göre workflows'leri map et
      // Eğer response.data bir array ise direkt kullan, değilse response.data.items veya response.data.workflows olabilir
      const workflowsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || response.data?.workflows || [];

      workflowsData.forEach((wf: any) => {
        mappedWorkflows.push({
          id: wf.id || wf.workflow_id || `workflow-${Date.now()}`,
          name: wf.name || wf.workflow_name || 'Unnamed Workflow',
          description: wf.description || wf.workflow_description,
          status: wf.status || 'draft',
          createdAt: wf.created_at || wf.createdAt || new Date().toISOString(),
          updatedAt: wf.updated_at || wf.updatedAt || new Date().toISOString(),
          lastExecuted: wf.last_executed || wf.lastExecuted,
          executionCount: wf.execution_count || wf.executionCount || 0,
        });
      });

      setWorkflows(mappedWorkflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load workflows',
        variant: 'destructive',
      });
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: WorkflowItem) => {
    // TODO: Implement delete API call
    toast({
      title: 'Workflow Deleted',
      description: `${item.name} has been deleted.`,
    });
    // Reload workflows after deletion
    await loadWorkflows();
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a workspace first</p>
      </div>
    );
  }

  return (
    <>
      <ListPageTemplate
        pageTitle="Workflows"
        pageDescription="Manage and monitor your automation workflows"
        items={workflows}
        isLoading={isLoading}
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
      {currentWorkspace && currentWorkspace.id && (
        <CreateWorkflowModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          workspaceId={currentWorkspace.id}
          onSuccess={() => {
            loadWorkflows();
          }}
        />
      )}
      <WorkflowDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setWorkflowDetail(null);
        }}
        workflowDetail={workflowDetail}
        isLoading={isLoadingDetail}
      />
    </>
  );
};

export default Workflows;
