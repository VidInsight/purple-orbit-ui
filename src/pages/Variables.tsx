import { useState, useEffect } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { VariableItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { CreateVariableModal } from '@/components/variables/CreateVariableModal';
import { VariableDetailModal } from '@/components/variables/VariableDetailModal';
import { EditVariableModal } from '@/components/variables/EditVariableModal';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getVariables, getVariableDetail, deleteVariable, VariableDetail } from '@/services/variablesApi';

const Variables = () => {
  const [variables, setVariables] = useState<VariableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [variableDetail, setVariableDetail] = useState<VariableDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    loadVariables();
  }, [currentWorkspace]);

  const loadVariables = async () => {
    if (!currentWorkspace?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getVariables(currentWorkspace.id);

      // Map API response to VariableItem type
      const mappedVariables: VariableItem[] = [];
      
      // API response formatına göre variables'ları map et
      const variablesData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || response.data?.variables || [];

      variablesData.forEach((variable: any) => {
        mappedVariables.push({
          id: variable.id || `variable-${Date.now()}`,
          name: variable.key || variable.name || 'Unnamed Variable',
          key: variable.key || '',
          description: variable.description || undefined,
          type: typeof variable.value === 'number' ? 'number' 
            : typeof variable.value === 'boolean' ? 'boolean'
            : variable.value?.startsWith('{') || variable.value?.startsWith('[') ? 'json'
            : 'string',
          createdAt: variable.created_at || variable.createdAt || new Date().toISOString(),
          updatedAt: variable.updated_at || variable.updatedAt || new Date().toISOString(),
        });
      });

      setVariables(mappedVariables);
    } catch (error) {
      console.error('Error loading variables:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load variables',
        variant: 'destructive',
      });
      setVariables([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    if (!currentWorkspace) {
      toast({
        title: 'Error',
        description: 'Please select a workspace first',
        variant: 'destructive',
      });
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    // Refresh variables list
    loadVariables();
  };

  const handleView = async (item: VariableItem) => {
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
      const response = await getVariableDetail(currentWorkspace.id, item.id);
      setVariableDetail(response.data);
    } catch (error) {
      console.error('Error loading variable detail:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load variable details',
        variant: 'destructive',
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = (item: VariableItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }
    setEditingVariableId(item.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (item: VariableItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteVariable(currentWorkspace.id, item.id);
      toast({
        title: 'Success',
        description: `${item.key} has been deleted successfully.`,
      });
      // Reload variables after deletion
      await loadVariables();
    } catch (error) {
      console.error('Error deleting variable:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete variable',
        variant: 'destructive',
      });
    }
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
        pageTitle="Variables"
        pageDescription="Manage environment variables and constants"
        items={variables}
        isLoading={isLoading}
        searchPlaceholder="Search variables..."
        createButtonText="Add Variable"
        itemTypeName="variable"
        emptyMessage="No variables yet"
        emptyDescription="Add environment variables for your workflows."
        onCreate={handleCreate}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        itemsPerPage={10}
      />
      {/* Variable Detail Modal */}
      <VariableDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setVariableDetail(null);
        }}
        variableDetail={variableDetail}
        isLoading={isLoadingDetail}
      />

      {/* Edit Variable Modal */}
      {currentWorkspace && editingVariableId && (
        <EditVariableModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingVariableId(null);
          }}
          workspaceId={currentWorkspace.id}
          variableId={editingVariableId}
          onSuccess={() => {
            loadVariables();
          }}
        />
      )}

      {/* Create Variable Modal */}
      {currentWorkspace && (
        <CreateVariableModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          workspaceId={currentWorkspace.id}
          onSuccess={handleCreateSuccess}
        />
      )}
    </>
  );
};

export default Variables;
