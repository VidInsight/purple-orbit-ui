import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { VariableItem, ColumnConfig } from '@/types/common';
import { generateMockVariables } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const Variables = () => {
  const [variables] = useState<VariableItem[]>(generateMockVariables());

  const columns: ColumnConfig<VariableItem>[] = [
    {
      key: 'key',
      label: 'Key',
      width: '25%',
      render: (item) => (
        <code className="text-sm font-mono text-foreground">{item.key}</code>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      width: '25%',
    },
    {
      key: 'type',
      label: 'Type',
      width: '15%',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/50 text-accent-foreground">
          {item.type}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      width: '20%',
      render: (item) => (
        <span className="text-muted-foreground">{item.description}</span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      width: '15%',
      render: (item) => new Date(item.updatedAt).toLocaleDateString(),
    },
  ];

  const handleCreate = () => {
    toast({
      title: 'Add Variable',
      description: 'Opening variable form...',
    });
  };

  const handleView = (item: VariableItem) => {
    toast({
      title: 'View Variable',
      description: `Viewing: ${item.key}`,
    });
  };

  const handleEdit = (item: VariableItem) => {
    toast({
      title: 'Edit Variable',
      description: `Editing: ${item.key}`,
    });
  };

  const handleDelete = async (item: VariableItem) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Variable Deleted',
      description: `${item.key} has been deleted.`,
    });
  };

  return (
    <ListPageTemplate
      pageTitle="Variables"
      pageDescription="Manage environment variables and constants"
      items={variables}
      columns={columns}
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
  );
};

export default Variables;
