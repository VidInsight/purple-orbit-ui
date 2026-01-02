import { useState, useEffect } from 'react';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { CredentialItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getCredentials, getCredentialDetail, deleteCredential, CredentialDetail } from '@/services/credentialsApi';
import { CredentialDetailModal } from '@/components/credentials/CredentialDetailModal';
import { EditCredentialModal } from '@/components/credentials/EditCredentialModal';
import { CreateCredentialModal } from '@/components/credentials/CreateCredentialModal';

const Credentials = () => {
  const { currentWorkspace } = useWorkspace();
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [credentialDetail, setCredentialDetail] = useState<CredentialDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCredentialId, setEditingCredentialId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreate = () => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleView = async (item: CredentialItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoadingDetail(true);
      setIsDetailModalOpen(true);
      const response = await getCredentialDetail(currentWorkspace.id, item.id);
      setCredentialDetail(response.data);
    } catch (error) {
      console.error('Error loading credential detail:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load credential details',
        variant: 'destructive',
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = (item: CredentialItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }
    setEditingCredentialId(item.id);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    loadCredentials();
  }, [currentWorkspace]);

  const loadCredentials = async () => {
    if (!currentWorkspace?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getCredentials(currentWorkspace.id);

      // Map API response to CredentialItem type
      const mappedCredentials: CredentialItem[] = [];
      
      // API response formatına göre credentials'leri map et
      // Eğer response.data bir array ise direkt kullan, değilse response.data.items veya response.data.credentials olabilir
      const credentialsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || response.data?.credentials || [];

      credentialsData.forEach((cred: any) => {
        mappedCredentials.push({
          id: cred.id || cred.credential_id || `credential-${Date.now()}`,
          name: cred.name || cred.credential_name || 'Unnamed Credential',
          description: cred.description || cred.credential_description,
          type: cred.type || cred.credential_type || 'unknown',
          createdAt: cred.created_at || cred.createdAt || new Date().toISOString(),
          updatedAt: cred.updated_at || cred.updatedAt || new Date().toISOString(),
          lastUsed: cred.last_used || cred.lastUsed,
        });
      });

      setCredentials(mappedCredentials);
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load credentials',
        variant: 'destructive',
      });
      setCredentials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: CredentialItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteCredential(currentWorkspace.id, item.id);
      toast({
        title: 'Success',
        description: `${item.name} has been deleted successfully.`,
      });
      // Reload credentials after deletion
      await loadCredentials();
    } catch (error) {
      console.error('Error deleting credential:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete credential',
        variant: 'destructive',
      });
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
        pageTitle="Credentials"
        pageDescription="Manage authentication credentials for integrations"
        items={credentials}
        isLoading={isLoading}
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

      {/* Credential Detail Modal */}
      <CredentialDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setCredentialDetail(null);
        }}
        credentialDetail={credentialDetail}
        isLoading={isLoadingDetail}
      />

      {/* Edit Credential Modal */}
      {currentWorkspace && editingCredentialId && (
        <EditCredentialModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCredentialId(null);
          }}
          workspaceId={currentWorkspace.id}
          credentialId={editingCredentialId}
          onSuccess={() => {
            loadCredentials();
          }}
        />
      )}

      {/* Create Credential Modal */}
      {currentWorkspace && (
        <CreateCredentialModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
          workspaceId={currentWorkspace.id}
          onSuccess={() => {
            loadCredentials();
          }}
        />
      )}
    </>
  );
};

export default Credentials;
