import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { DatabaseItem } from '@/types/common';
import { generateMockDatabases } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const Databases = () => {
  const [databases] = useState<DatabaseItem[]>(generateMockDatabases());

  const handleCreate = () => {
    toast({
      title: 'Add Database',
      description: 'Opening database connection form...',
    });
  };

  const handleView = (item: DatabaseItem) => {
    toast({
      title: 'View Database',
      description: `Viewing: ${item.name}`,
    });
  };

  const handleEdit = (item: DatabaseItem) => {
    toast({
      title: 'Edit Database',
      description: `Editing: ${item.name}`,
    });
  };

  const handleDelete = async (item: DatabaseItem) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Database Deleted',
      description: `${item.name} has been deleted.`,
    });
  };

  return (
    <ListPageTemplate
      pageTitle="Databases"
      pageDescription="Connect and manage database connections"
      items={databases}
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
