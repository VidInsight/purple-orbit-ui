import { useState, useEffect } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { ApiKeyItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getApiKeys, createApiKey } from '@/services/apiKeysApi';
import { CreateApiKeyModal, CreateApiKeyData } from '@/components/api-keys/CreateApiKeyModal';
import { ApiKeyRevealModal } from '@/components/api-keys/ApiKeyRevealModal';

const ApiKeys = () => {
  const { currentWorkspace } = useWorkspace();
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ key: '', name: '' });
  const [isCreating, setIsCreating] = useState(false);

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

      // Show the generated key in reveal modal
      setNewApiKey({ key: response.data.key, name: response.data.name });
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

  const handleView = (item: ApiKeyItem) => {
    toast({
      title: 'View API Key',
      description: `Viewing: ${item.name}`,
    });
  };

  const handleEdit = (item: ApiKeyItem) => {
    toast({
      title: 'Edit API Key',
      description: `Editing: ${item.name}`,
    });
  };

  const handleDelete = async (item: ApiKeyItem) => {
    // TODO: Implement delete API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setApiKeys((prev) => prev.filter((k) => k.id !== item.id));
    toast({
      title: 'API Key Revoked',
      description: `${item.name} has been permanently revoked.`,
    });
    // Reload API keys after deletion
    await loadApiKeys();
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
