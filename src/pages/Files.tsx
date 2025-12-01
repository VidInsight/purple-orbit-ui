import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { File, PaginationResponse } from '@/types/api';

const Files = () => {
  const { currentWorkspace } = useWorkspace();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Fetch files
  const { data: filesData, isLoading } = useQuery({
    queryKey: ['files', currentWorkspace?.id],
    queryFn: () => apiClient.get<PaginationResponse<File[]>>(
      API_ENDPOINTS.file.list(currentWorkspace!.id),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!getToken(),
  });

  const files = filesData?.data.items || [];

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) =>
      apiClient.delete(
        API_ENDPOINTS.file.delete(currentWorkspace!.id, fileId),
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast({
        title: 'File Deleted',
        description: 'File has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete file',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    // File upload için input oluştur
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file || !currentWorkspace) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);

        const response = await apiClient.upload<File>(
          API_ENDPOINTS.file.upload(currentWorkspace.id),
          formData,
          { token: getToken() }
        );

        queryClient.invalidateQueries({ queryKey: ['files'] });
        toast({
          title: 'File Uploaded',
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (error: any) {
        toast({
          title: 'Upload Failed',
          description: error.message || 'Failed to upload file',
          variant: 'destructive',
        });
      }
    };
    input.click();
  };

  const handleView = (item: File) => {
    // File content'i indir
    if (!currentWorkspace) return;
    const url = API_ENDPOINTS.file.getContent(currentWorkspace.id, item.id);
    window.open(url, '_blank');
  };

  const handleEdit = (item: File) => {
    toast({
      title: 'Edit File',
      description: `Editing metadata for: ${item.name}`,
    });
  };

  const handleDelete = async (item: File) => {
    if (!currentWorkspace) return;
    deleteFileMutation.mutate(item.id);
  };

  // Map File to ListPageTemplate format
  const mappedFiles = files.map((file) => ({
    id: file.id,
    name: file.name,
    description: file.description || `${(file.file_size_mb).toFixed(2)} MB - ${file.mime_type}`,
  }));

  return (
    <ListPageTemplate
      pageTitle="Files"
      pageDescription="Manage files and assets for your workflows"
      items={mappedFiles}
      isLoading={isLoading}
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
