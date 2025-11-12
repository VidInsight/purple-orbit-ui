import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { FileItem } from '@/types/common';
import { generateMockFiles } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const Files = () => {
  const [files] = useState<FileItem[]>(generateMockFiles());

  const handleCreate = () => {
    toast({
      title: 'Upload File',
      description: 'Opening file uploader...',
    });
  };

  const handleView = (item: FileItem) => {
    toast({
      title: 'View File',
      description: `Opening: ${item.name}`,
    });
  };

  const handleEdit = (item: FileItem) => {
    toast({
      title: 'Edit File',
      description: `Editing metadata for: ${item.name}`,
    });
  };

  const handleDelete = async (item: FileItem) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'File Deleted',
      description: `${item.name} has been deleted.`,
    });
  };

  return (
    <ListPageTemplate
      pageTitle="Files"
      pageDescription="Manage files and assets for your workflows"
      items={files}
      searchPlaceholder="Search files..."
      createButtonText="Upload File"
      itemTypeName="file"
      emptyMessage="No files uploaded yet"
      emptyDescription="Upload files to use in your workflows."
      onCreate={handleCreate}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default Files;
