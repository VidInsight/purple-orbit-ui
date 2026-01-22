import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { FileItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { UploadFileModal } from '@/components/files/UploadFileModal';
import { EditFileModal } from '@/components/files/EditFileModal';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getFiles, deleteFile } from '@/services/filesApi';

const Files = () => {
  const { currentWorkspace } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [currentWorkspace]);

  // Check for upload query parameter
  useEffect(() => {
    const uploadParam = searchParams.get('upload');
    if (uploadParam === 'true' && currentWorkspace?.id) {
      setIsUploadModalOpen(true);
      // Remove query parameter from URL
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, currentWorkspace, setSearchParams]);

  const loadFiles = async () => {
    if (!currentWorkspace?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getFiles(currentWorkspace.id);

      // Map API response to FileItem type
      const mappedFiles: FileItem[] = [];
      
      // API response formatına göre files'ları map et
      const filesData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || response.data?.files || [];

      filesData.forEach((file: any) => {
        mappedFiles.push({
          id: file.id || file.file_id || `file-${Date.now()}`,
          name: file.name || file.file_name || 'Unnamed File',
          description: file.description || file.file_description,
          size: file.size || file.file_size || 0,
          type: file.type || file.file_type || file.mime_type || 'application/octet-stream',
          url: file.url || file.file_url || file.download_url || '',
          createdAt: file.created_at || file.createdAt || new Date().toISOString(),
          updatedAt: file.updated_at || file.updatedAt || new Date().toISOString(),
        });
      });

      setFiles(mappedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load files',
        variant: 'destructive',
      });
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    if (!currentWorkspace) {
      toast({
        title: 'Error',
        description: 'Please select a workspace first',
        variant: 'destructive',
      });
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    loadFiles();
  };

  const handleView = (item: FileItem) => {
    toast({
      title: 'View File',
      description: `Opening: ${item.name}`,
    });
  };

  const handleEdit = (item: FileItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }
    setEditingFileId(item.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (item: FileItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteFile(currentWorkspace.id, item.id);
      toast({
        title: 'Success',
        description: `${item.name} has been deleted successfully.`,
      });
      // Reload files after deletion
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete file',
        variant: 'destructive',
      });
      throw error; // Re-throw to let ListPageTemplate handle the error state
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a workspace first</p>
      </div>
    );
  }

  return (
    <>
      <ListPageTemplate
        pageTitle="Files"
        pageDescription="Manage files and assets for your workflows"
        items={files}
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
        itemsPerPage={10}
      />
      {currentWorkspace && (
        <UploadFileModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            // Remove query parameter if it exists
            if (searchParams.get('upload') === 'true') {
              setSearchParams({}, { replace: true });
            }
          }}
          workspaceId={currentWorkspace.id}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Edit File Modal */}
      {currentWorkspace && editingFileId && (
        <EditFileModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingFileId(null);
          }}
          workspaceId={currentWorkspace.id}
          fileId={editingFileId}
          onSuccess={() => {
            loadFiles();
          }}
        />
      )}
    </>
  );
};

export default Files;
