import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { ApiKeyItem, ColumnConfig } from '@/types/common';
import { generateMockApiKeys } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const ApiKeys = () => {
  const [apiKeys] = useState<ApiKeyItem[]>(generateMockApiKeys());

  const columns: ColumnConfig<ApiKeyItem>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '25%',
    },
    {
      key: 'key',
      label: 'Key',
      width: '20%',
      render: (item) => (
        <code className="text-xs font-mono text-muted-foreground">
          {item.key.slice(0, 12)}...
        </code>
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
      width: '20%',
      render: (item) =>
        item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never',
    },
  ];

  const handleCreate = () => {
    toast({
      title: 'Generate API Key',
      description: 'Creating new API key...',
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
    toast({
      title: 'API Key Deleted',
      description: `${item.name} has been revoked.`,
    });
  };

  return (
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
  );
};

export default ApiKeys;
