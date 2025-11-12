import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { ApiKeyItem, ColumnConfig } from '@/types/common';
import { generateMockApiKeys } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';
import { CreateApiKeyModal, CreateApiKeyData } from '@/components/api-keys/CreateApiKeyModal';
import { ApiKeyRevealModal } from '@/components/api-keys/ApiKeyRevealModal';
import { Copy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(generateMockApiKeys());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ key: '', name: '' });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy manually',
        variant: 'destructive',
      });
    }
  };

  const getExpirationWarning = (expiresAt?: string) => {
    if (!expiresAt) return null;
    
    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiry < 0) {
      return { color: 'text-destructive', message: 'Expired' };
    }
    if (daysUntilExpiry <= 7) {
      return { color: 'text-amber-500', message: `Expires in ${daysUntilExpiry}d` };
    }
    return null;
  };

  const columns: ColumnConfig<ApiKeyItem>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '20%',
    },
    {
      key: 'key',
      label: 'Key',
      width: '25%',
      render: (item) => (
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-muted-foreground">
            {item.key.slice(0, 12)}...{item.key.slice(-4)}
          </code>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(item.key);
            }}
            className="p-1 hover:bg-surface rounded transition-colors"
            title="Copy key"
          >
            <Copy className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      width: '20%',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.permissions.slice(0, 2).map((permission) => (
            <span
              key={permission}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {permission}
            </span>
          ))}
          {item.permissions.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{item.permissions.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'lastUsed',
      label: 'Last Used',
      width: '15%',
      render: (item) =>
        item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'Never',
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      width: '15%',
      render: (item) => {
        const warning = getExpirationWarning(item.expiresAt);
        
        if (!item.expiresAt) {
          return (
            <div className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs">Never</span>
            </div>
          );
        }
        
        return (
          <div className={warning ? warning.color : 'text-foreground'}>
            <div className="text-xs">
              {new Date(item.expiresAt).toLocaleDateString()}
            </div>
            {warning && (
              <div className="text-xs font-medium">{warning.message}</div>
            )}
          </div>
        );
      },
    },
  ];

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
        columns={columns}
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
