import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { VariableItem } from '@/types/common';
import { generateMockVariables } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const Variables = () => {
  const [variables] = useState<VariableItem[]>(generateMockVariables());

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
