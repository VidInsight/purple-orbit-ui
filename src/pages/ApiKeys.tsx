import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { ApiKeyItem } from '@/types/common';
import { generateMockApiKeys } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';
import { CreateApiKeyModal, CreateApiKeyData } from '@/components/api-keys/CreateApiKeyModal';
import { ApiKeyRevealModal } from '@/components/api-keys/ApiKeyRevealModal';

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(generateMockApiKeys());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ key: '', name: '' });

  const generateApiKey = (): string => {
    const prefix = 'sk_live_';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = prefix;
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = (data: CreateApiKeyData) => {
    const fullKey = generateApiKey();
    const expiresAt =
      data.expiration === 'never'
        ? undefined
        : new Date(Date.now() + parseInt(data.expiration) * 24 * 60 * 60 * 1000).toISOString();

    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: data.name,
      description: data.description,
      key: fullKey,
      permissions: data.permissions,
      lastUsed: undefined,
      expiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApiKeys((prev) => [newKey, ...prev]);
    setNewApiKey({ key: fullKey, name: data.name });
    setRevealModalOpen(true);

    toast({
      title: 'API Key Generated',
      description: 'Save your key now - you won\'t see it again!',
    });
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setApiKeys((prev) => prev.filter((k) => k.id !== item.id));
    toast({
      title: 'API Key Revoked',
      description: `${item.name} has been permanently revoked.`,
    });
  };

  return (
    <>
      <ListPageTemplate
        pageTitle="API Keys"
        pageDescription="Manage API keys for external service access"
        items={apiKeys}
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
