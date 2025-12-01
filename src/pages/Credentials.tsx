import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Credential, PaginationResponse } from '@/types/api';

const Credentials = () => {
  const { currentWorkspace } = useWorkspace();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Fetch credentials
  const { data: credentialsData, isLoading } = useQuery({
    queryKey: ['credentials', currentWorkspace?.id],
    queryFn: () => apiClient.get<PaginationResponse<Credential[]>>(
      API_ENDPOINTS.credential.list(currentWorkspace!.id),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!getToken(),
  });

  const credentials = credentialsData?.data.items || [];

  // Delete credential mutation
  const deleteCredentialMutation = useMutation({
    mutationFn: (credentialId: string) =>
      apiClient.delete(
        API_ENDPOINTS.credential.delete(currentWorkspace!.id, credentialId),
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      toast({
        title: 'Credential Deleted',
        description: 'Credential has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete credential',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    toast({
      title: 'Add Credential',
      description: 'Credential creation form will be implemented here.',
    });
  };

  const handleView = (item: Credential) => {
    toast({
      title: 'View Credential',
      description: `Viewing: ${item.name}`,
    });
  };

  const handleEdit = (item: Credential) => {
    toast({
      title: 'Edit Credential',
      description: `Editing: ${item.name}`,
    });
  };

  const handleDelete = async (item: Credential) => {
    if (!currentWorkspace) return;
    deleteCredentialMutation.mutate(item.id);
  };

  // Map Credential to ListPageTemplate format
  const mappedCredentials = credentials.map((credential) => ({
    id: credential.id,
    name: credential.name,
    description: `${credential.credential_type}${credential.credential_provider ? ` - ${credential.credential_provider}` : ''}`,
  }));

  return (
    <ListPageTemplate
      pageTitle="Credentials"
      pageDescription="Manage authentication credentials for integrations"
      items={mappedCredentials}
      isLoading={isLoading}
      searchPlaceholder="Search credentials..."
      createButtonText="Add Credential"
      itemTypeName="credential"
      emptyMessage="No credentials configured"
      emptyDescription="Add credentials to connect with external services."
      onCreate={handleCreate}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default Credentials;
