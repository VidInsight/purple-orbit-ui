import { useState, useEffect } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { ApiKeyItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getApiKeys, createApiKey, getApiKey, updateApiKey, deleteApiKey, ApiKeyDetail } from '@/services/apiKeysApi';
import { CreateApiKeyModal, CreateApiKeyData } from '@/components/api-keys/CreateApiKeyModal';
import { ApiKeyRevealModal } from '@/components/api-keys/ApiKeyRevealModal';
import { ApiKeyDetailModal } from '@/components/api-keys/ApiKeyDetailModal';

const ApiKeys = () => {
  const { currentWorkspace } = useWorkspace();
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ key: '', name: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [apiKeyDetail, setApiKeyDetail] = useState<ApiKeyDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<ApiKeyDetail | null>(null);

  const handleCreate = () => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (data: CreateApiKeyData) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);

      // Convert expiration to ISO date string
      const expiresAt =
        data.expiration === 'never'
          ? undefined
          : new Date(Date.now() + parseInt(data.expiration) * 24 * 60 * 60 * 1000).toISOString();

      // Convert permissions array to object format
      // API expects: { "workflow.read": true, "workflow.write": false }
      // We have: ["workflows.read", "workflows.write"]
      const permissionsObject: { [key: string]: boolean } = {};
      
      // Map permission IDs to API format
      const permissionMap: { [key: string]: string } = {
        'workflows.read': 'workflow.read',
        'workflows.write': 'workflow.write',
        'executions.read': 'execution.read',
        'executions.write': 'workflow.execute',
        'credentials.read': 'credential.read',
        'credentials.write': 'credential.write',
        'databases.read': 'database.read',
        'databases.write': 'database.write',
        'variables.read': 'variable.read',
        'variables.write': 'variable.write',
        'files.read': 'file.read',
        'files.write': 'file.write',
      };

      // Set selected permissions to true
      data.permissions.forEach((perm) => {
        const apiPerm = permissionMap[perm] || perm;
        permissionsObject[apiPerm] = true;
      });

      // Prepare request body
      const requestBody: any = {
        name: data.name,
        description: data.description || undefined,
        permissions: permissionsObject,
        key_prefix: data.key_prefix || 'sk_live_',
      };

      if (expiresAt) {
        requestBody.expires_at = expiresAt;
      }

      if (data.tags && data.tags.length > 0) {
        requestBody.tags = data.tags;
      }

      if (data.allowed_ips && data.allowed_ips.length > 0) {
        requestBody.allowed_ips = data.allowed_ips;
      }

      // Call API
      const response = await createApiKey(currentWorkspace.id, requestBody);

      // Log the response to debug
      console.log('Create API key full response:', response);
      console.log('Response data:', response.data);

      // Try multiple possible field names for the API key
      // Use type assertion to allow checking alternative field names
      const responseData = response.data as any;
      const apiKeyValue = 
        responseData?.key || 
        responseData?.api_key || 
        responseData?.key_value || 
        responseData?.secret_key ||
        responseData?.secret ||
        (response as any)?.key ||
        '';

      const apiKeyName = 
        responseData?.name || 
        responseData?.api_key_name || 
        '';

      if (!apiKeyValue) {
        console.error('API key not found in response:', response);
        toast({
          title: 'Warning',
          description: 'API key was created but could not be retrieved. Please check the console for details.',
          variant: 'destructive',
        });
      }

      // Show the generated key in reveal modal
      setNewApiKey({ key: apiKeyValue, name: apiKeyName });
      setRevealModalOpen(true);
      setCreateModalOpen(false);

      toast({
        title: 'API Key Generated',
        description: 'Save your key now - you won\'t see it again!',
      });

      // Reload API keys after creation
      await loadApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleView = async (item: ApiKeyItem) => {
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
      setDetailModalOpen(true);
      const response = await getApiKey(currentWorkspace.id, item.id);
      setApiKeyDetail(response.data);
    } catch (error) {
      console.error('Error fetching API key details:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch API key details',
        variant: 'destructive',
      });
      setDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = async (item: ApiKeyItem) => {
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
      setEditModalOpen(true);
      const response = await getApiKey(currentWorkspace.id, item.id);
      setEditingApiKey(response.data);
    } catch (error) {
      console.error('Error fetching API key for edit:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load API key details',
        variant: 'destructive',
      });
      setEditModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEditSubmit = async (data: CreateApiKeyData) => {
    if (!currentWorkspace?.id || !editingApiKey) {
      toast({
        title: 'Error',
        description: 'Workspace or API key not selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUpdating(true);

      // Convert expiration to ISO date string
      const expiresAt =
        data.expiration === 'never'
          ? undefined
          : new Date(Date.now() + parseInt(data.expiration) * 24 * 60 * 60 * 1000).toISOString();

      // Convert permissions array to object format
      const permissionsObject: { [key: string]: boolean } = {};
      
      // Map permission IDs to API format
      const permissionMap: { [key: string]: string } = {
        'workflows.read': 'workflow.read',
        'workflows.write': 'workflow.write',
        'executions.read': 'execution.read',
        'executions.write': 'workflow.execute',
        'credentials.read': 'credential.read',
        'credentials.write': 'credential.write',
        'databases.read': 'database.read',
        'databases.write': 'database.write',
        'variables.read': 'variable.read',
        'variables.write': 'variable.write',
        'files.read': 'file.read',
        'files.write': 'file.write',
      };

      // Set selected permissions to true
      data.permissions.forEach((perm) => {
        const apiPerm = permissionMap[perm] || perm;
        permissionsObject[apiPerm] = true;
      });

      // Prepare request body
      const requestBody: any = {
        name: data.name,
        description: data.description || undefined,
        permissions: permissionsObject,
      };

      if (expiresAt) {
        requestBody.expires_at = expiresAt;
      }

      if (data.tags && data.tags.length > 0) {
        requestBody.tags = data.tags;
      } else {
        requestBody.tags = [];
      }

      if (data.allowed_ips && data.allowed_ips.length > 0) {
        requestBody.allowed_ips = data.allowed_ips;
      } else {
        requestBody.allowed_ips = [];
      }

      // Call API
      await updateApiKey(currentWorkspace.id, editingApiKey.id, requestBody);

      toast({
        title: 'API Key Updated',
        description: `${data.name} has been successfully updated.`,
      });

      setEditModalOpen(false);
      setEditingApiKey(null);

      // Reload API keys after update
      await loadApiKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update API key',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (item: ApiKeyItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteApiKey(currentWorkspace.id, item.id);
      
      toast({
        title: 'API Key Revoked',
        description: `${item.name} has been permanently revoked.`,
      });

      // Reload API keys after deletion
      await loadApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, [currentWorkspace]);

  const loadApiKeys = async () => {
    if (!currentWorkspace?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getApiKeys(currentWorkspace.id);

      // Map API response to ApiKeyItem type
      const mappedApiKeys: ApiKeyItem[] = [];
      
      // API response formatına göre API keys'leri map et
      // Eğer response.data bir array ise direkt kullan, değilse response.data.items veya response.data.api_keys olabilir
      const apiKeysData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || response.data?.api_keys || [];

      apiKeysData.forEach((key: any) => {
        mappedApiKeys.push({
          id: key.id || key.api_key_id || `key-${Date.now()}`,
          name: key.name || key.api_key_name || 'Unnamed API Key',
          description: key.description || key.api_key_description,
          key: key.key || key.api_key || key.key_prefix || 'sk_live_***',
          permissions: key.permissions || key.api_key_permissions || [],
          createdAt: key.created_at || key.createdAt || new Date().toISOString(),
          updatedAt: key.updated_at || key.updatedAt || new Date().toISOString(),
          lastUsed: key.last_used || key.lastUsed || key.last_used_at,
          expiresAt: key.expires_at || key.expiresAt,
        });
      });

      setApiKeys(mappedApiKeys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load API keys',
        variant: 'destructive',
      });
      setApiKeys([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Please select a workspace first.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ListPageTemplate
        pageTitle="API Keys"
        pageDescription="Manage API keys for external service access"
        items={apiKeys}
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
        onClose={() => {
          if (!isCreating) {
            setCreateModalOpen(false);
          }
        }}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
        isEditMode={false}
      />

      <CreateApiKeyModal
        isOpen={editModalOpen}
        onClose={() => {
          if (!isUpdating) {
            setEditModalOpen(false);
            setEditingApiKey(null);
          }
        }}
        onSubmit={handleEditSubmit}
        isLoading={isUpdating}
        initialData={editingApiKey}
        isEditMode={true}
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

      <ApiKeyDetailModal
        isOpen={detailModalOpen}
        apiKeyDetail={apiKeyDetail}
        isLoading={isLoadingDetail}
        onClose={() => {
          setDetailModalOpen(false);
          setApiKeyDetail(null);
        }}
      />
    </>
  );
};

export default ApiKeys;
