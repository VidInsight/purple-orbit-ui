import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { DatabaseItem, ColumnConfig } from '@/types/common';
import { generateMockDatabases } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const Databases = () => {
  const [databases] = useState<DatabaseItem[]>(generateMockDatabases());

  const columns: ColumnConfig<DatabaseItem>[] = [
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
          {item.type.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'host',
      label: 'Host',
      width: '25%',
      render: (item) => (
        <code className="text-xs text-muted-foreground">{item.host}</code>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (item) => {
        const statusColors = {
          connected: 'bg-success/10 text-success',
          disconnected: 'bg-muted text-muted-foreground',
          error: 'bg-destructive/10 text-destructive',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      width: '20%',
      render: (item) => new Date(item.updatedAt).toLocaleDateString(),
    },
  ];

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
      columns={columns}
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
