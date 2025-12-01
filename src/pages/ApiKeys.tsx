import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { toast } from '@/hooks/use-toast';
import { CreateApiKeyModal, CreateApiKeyData } from '@/components/api-keys/CreateApiKeyModal';
import { EditApiKeyModal } from '@/components/api-keys/EditApiKeyModal';
import { ApiKeyRevealModal } from '@/components/api-keys/ApiKeyRevealModal';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest, PaginationResponse } from '@/types/api';

const ApiKeys = () => {
  const { currentWorkspace } = useWorkspace();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ key: '', name: '' });
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);

  // Fetch API keys
  const { data: apiKeysData, isLoading } = useQuery({
    queryKey: ['apiKeys', currentWorkspace?.id],
    queryFn: () => apiClient.get<PaginationResponse<ApiKey[]>>(
      API_ENDPOINTS.apiKey.list(currentWorkspace!.id),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!getToken(),
  });

  const apiKeys = apiKeysData?.data.items || [];

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: (data: CreateApiKeyRequest) =>
      apiClient.post<{ id: string; name: string; full_api_key: string; key_prefix: string; description?: string }>(
        API_ENDPOINTS.apiKey.create(currentWorkspace!.id),
        data,
        { token: getToken() }
      ),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setNewApiKey({ key: response.data.full_api_key, name: response.data.name });
      setRevealModalOpen(true);
      toast({
        title: 'API Key Generated',
        description: 'Save your key now - you won\'t see it again!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create API key',
        variant: 'destructive',
      });
    },
  });

  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: ({ apiKeyId, data }: { apiKeyId: string; data: UpdateApiKeyRequest }) =>
      apiClient.put<ApiKey>(
        API_ENDPOINTS.apiKey.update(currentWorkspace!.id, apiKeyId),
        data,
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      toast({
        title: 'API Key Updated',
        description: 'API key has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update API key',
        variant: 'destructive',
      });
    },
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: (apiKeyId: string) =>
      apiClient.delete(
        API_ENDPOINTS.apiKey.delete(currentWorkspace!.id, apiKeyId),
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      toast({
        title: 'API Key Revoked',
        description: 'API key has been permanently revoked.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke API key',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = (data: CreateApiKeyData) => {
    if (!currentWorkspace) return;

    const expiresAt =
      data.expiration === 'never'
        ? null
        : new Date(Date.now() + parseInt(data.expiration) * 24 * 60 * 60 * 1000).toISOString();

    const request: CreateApiKeyRequest = {
      name: data.name,
      key_prefix: 'sk_live_',
      description: data.description,
      permissions: {}, // Backend'de permission mapping yapılmalı
      expires_at: expiresAt,
      tags: [],
      allowed_ips: null,
    };

    createApiKeyMutation.mutate(request);
  };

  const handleView = (item: ApiKey) => {
    toast({
      title: 'View API Key',
      description: `Viewing: ${item.name}`,
    });
  };

  const handleEdit = (item: ApiKey) => {
    setEditingApiKey(item);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (data: UpdateApiKeyRequest) => {
    if (!editingApiKey || !currentWorkspace) return;
    updateApiKeyMutation.mutate({
      apiKeyId: editingApiKey.id,
      data,
    });
  };

  const handleDelete = async (item: ApiKey) => {
    if (!currentWorkspace) return;
    deleteApiKeyMutation.mutate(item.id);
  };

  // Map ApiKey to ListPageTemplate format
  const mappedApiKeys = apiKeys.map((key) => ({
    id: key.id,
    name: key.name,
    description: key.description,
  }));

  return (
    <>
      <ListPageTemplate
        pageTitle="API Keys"
        pageDescription="Manage API keys for external service access"
        items={mappedApiKeys}
        isLoading={isLoading}
        searchPlaceholder="Search API keys..."
        createButtonText="Generate Key"
        itemTypeName="API key"
        emptyMessage="No API keys yet"
        emptyDescription="Generate keys to access your workflows via API."
        onCreate={handleCreate}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateApiKeyModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditApiKeyModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingApiKey(null);
        }}
        onSubmit={handleEditSubmit}
        apiKey={editingApiKey}
      />

      <ApiKeyRevealModal
        isOpen={revealModalOpen}
        apiKey={newApiKey.key}
        keyName={newApiKey.name}
        onClose={() => {
          setRevealModalOpen(false);
          setNewApiKey({ key: '', name: '' });
        }}
      />
    </>
  );
};

export default ApiKeys;
