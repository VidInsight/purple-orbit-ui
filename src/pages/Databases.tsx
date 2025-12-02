import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Database, PaginatedResponse } from '@/types/api';

const Databases = () => {
  const { currentWorkspace } = useWorkspace();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Fetch databases
  const { data: databasesData, isLoading } = useQuery({
    queryKey: ['databases', currentWorkspace?.id],
    queryFn: () => apiClient.get<PaginatedResponse<Database>>(
      API_ENDPOINTS.database.list(currentWorkspace!.id),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!getToken(),
  });

  const databases = databasesData?.data.items || [];

  // Delete database mutation
  const deleteDatabaseMutation = useMutation({
    mutationFn: (databaseId: string) =>
      apiClient.delete(
        API_ENDPOINTS.database.delete(currentWorkspace!.id, databaseId),
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['databases'] });
      toast({
        title: 'Database Deleted',
        description: 'Database connection has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete database',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    toast({
      title: 'Add Database',
      description: 'Database connection form will be implemented here.',
    });
  };

  const handleView = (item: { id: string; name: string; description?: string }) => {
    toast({
      title: 'View Database',
      description: `Viewing: ${item.name}`,
    });
  };

  const handleEdit = (item: { id: string; name: string; description?: string }) => {
    toast({
      title: 'Edit Database',
      description: `Editing: ${item.name}`,
    });
  };

  const handleDelete = async (item: { id: string; name: string; description?: string }) => {
    if (!currentWorkspace) return;
    deleteDatabaseMutation.mutate(item.id);
  };

  // Map Database to ListPageTemplate format
  const mappedDatabases = databases.map((database) => ({
    id: database.id,
    name: database.name,
    description: database.description || `${database.database_type} - ${database.host}:${database.port}`,
  }));

  return (
    <ListPageTemplate
      pageTitle="Databases"
      pageDescription="Connect and manage database connections"
      items={mappedDatabases}
      isLoading={isLoading}
      searchPlaceholder="Search databases..."
      createButtonText="Add Database"
      itemTypeName="database"
      filterOptions={[
        { value: 'all', label: 'All Databases' },
        { value: 'connected', label: 'Connected' },
        { value: 'disconnected', label: 'Disconnected' },
        { value: 'error', label: 'Error' },
      ]}
      emptyMessage="No database connections yet"
      emptyDescription="Connect to your databases for automation workflows."
      onCreate={handleCreate}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default Databases;
