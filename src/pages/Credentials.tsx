import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { CredentialItem } from '@/types/common';
import { generateMockCredentials } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const Credentials = () => {
  const [credentials] = useState<CredentialItem[]>(generateMockCredentials());

  const handleCreate = () => {
    toast({
      title: 'Add Credential',
      description: 'Opening credential form...',
    });
  };

  const handleView = (item: CredentialItem) => {
    toast({
      title: 'View Credential',
      description: `Viewing: ${item.name}`,
    });
  };

  const handleEdit = (item: CredentialItem) => {
    toast({
      title: 'Edit Credential',
      description: `Editing: ${item.name}`,
    });
  };

  const handleDelete = async (item: CredentialItem) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Credential Deleted',
      description: `${item.name} has been deleted.`,
    });
  };

  return (
    <ListPageTemplate
      pageTitle="Credentials"
      pageDescription="Manage authentication credentials for integrations"
      items={credentials}
      searchPlaceholder="Search credentials..."
      createButtonText="Add Credential"
      itemTypeName="credential"
      emptyMessage="No credentials configured"
      emptyDescription="Add credentials to connect with external services."
      onCreate={handleCreate}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default Credentials;
