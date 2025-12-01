import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Variable, PaginationResponse, CreateVariableRequest, UpdateVariableRequest } from '@/types/api';
import { VariableModal } from '@/components/variables/VariableModal';

const Variables = () => {
  const { currentWorkspace } = useWorkspace();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch variables
  const { data: variablesData, isLoading } = useQuery({
    queryKey: ['variables', currentWorkspace?.id],
    queryFn: () => apiClient.get<PaginationResponse<Variable[]>>(
      API_ENDPOINTS.variable.list(currentWorkspace!.id),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!getToken(),
  });

  const variables = variablesData?.data.items || [];

  // Create variable mutation
  const createVariableMutation = useMutation({
    mutationFn: (data: CreateVariableRequest) =>
      apiClient.post<Variable>(
        API_ENDPOINTS.variable.create(currentWorkspace!.id),
        data,
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables'] });
      toast({
        title: 'Variable Created',
        description: 'Variable has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create variable',
        variant: 'destructive',
      });
    },
  });

  // Update variable mutation
  const updateVariableMutation = useMutation({
    mutationFn: ({ variableId, data }: { variableId: string; data: UpdateVariableRequest }) =>
      apiClient.put<Variable>(
        API_ENDPOINTS.variable.update(currentWorkspace!.id, variableId),
        data,
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables'] });
      toast({
        title: 'Variable Updated',
        description: 'Variable has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update variable',
        variant: 'destructive',
      });
    },
  });

  // Delete variable mutation
  const deleteVariableMutation = useMutation({
    mutationFn: (variableId: string) =>
      apiClient.delete(
        API_ENDPOINTS.variable.delete(currentWorkspace!.id, variableId),
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables'] });
      toast({
        title: 'Variable Deleted',
        description: 'Variable has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete variable',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    setModalMode('create');
    setEditingVariable(null);
    setModalOpen(true);
  };

  const handleView = (item: Variable) => {
    toast({
      title: 'View Variable',
      description: `Viewing: ${item.key}`,
    });
  };

  const handleEdit = async (item: Variable) => {
    // Secret variable'ların değerini almak için detay endpoint'ini kullan
    try {
      const response = await apiClient.get<Variable>(
        API_ENDPOINTS.variable.get(currentWorkspace!.id, item.id),
        { token: getToken() }
      );
      setModalMode('edit');
      setEditingVariable(response.data);
      setModalOpen(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load variable details',
        variant: 'destructive',
      });
    }
  };

  const handleModalSubmit = async (data: { key: string; value: string; description?: string; is_secret: boolean }) => {
    if (!currentWorkspace) return;

    if (modalMode === 'create') {
      createVariableMutation.mutate(data);
    } else if (editingVariable) {
      updateVariableMutation.mutate({
        variableId: editingVariable.id,
        data: {
          key: data.key,
          value: data.value,
          description: data.description,
          is_secret: data.is_secret,
        },
      });
    }
  };

  const handleDelete = async (item: Variable) => {
    if (!currentWorkspace) return;
    deleteVariableMutation.mutate(item.id);
  };

  // Map Variable to ListPageTemplate format
  const mappedVariables = variables.map((variable) => ({
    id: variable.id,
    name: variable.key,
    description: variable.description || (variable.is_secret ? 'Secret variable' : ''),
  }));

  return (
    <>
      <ListPageTemplate
        pageTitle="Variables"
        pageDescription="Manage environment variables and constants"
        items={mappedVariables}
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
      />

      <VariableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        variable={editingVariable}
        mode={modalMode}
      />
    </>
  );
};

export default Variables;
