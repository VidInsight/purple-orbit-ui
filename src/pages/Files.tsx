import { useState } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { FileItem, ColumnConfig } from '@/types/common';
import { generateMockFiles } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const Files = () => {
  const [files] = useState<FileItem[]>(generateMockFiles());

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns: ColumnConfig<FileItem>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '30%',
    },
    {
      key: 'type',
      label: 'Type',
      width: '20%',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          {item.type.split('/')[1] || item.type}
        </span>
      ),
    },
    {
      key: 'size',
      label: 'Size',
      width: '15%',
      render: (item) => formatFileSize(item.size),
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
      key: 'createdAt',
      label: 'Uploaded',
      width: '15%',
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

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
      columns={columns}
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
