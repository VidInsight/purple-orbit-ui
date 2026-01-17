import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListPageTemplate } from '@/components/shared/ListPageTemplate';
import { DatabaseItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import { CreateDatabaseModal } from '@/components/databases/CreateDatabaseModal';
import { DatabaseDetailModal } from '@/components/databases/DatabaseDetailModal';
import { EditDatabaseModal } from '@/components/databases/EditDatabaseModal';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { getDatabases, getDatabaseDetail, deleteDatabase, DatabaseDetail } from '@/services/databasesApi';

const Databases = () => {
  const { currentWorkspace } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [databaseDetail, setDatabaseDetail] = useState<DatabaseDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDatabaseId, setEditingDatabaseId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDatabase, setDeletingDatabase] = useState<DatabaseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleView = async (item: DatabaseItem) => {
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
      const response = await getDatabaseDetail(currentWorkspace.id, item.id);
      setDatabaseDetail(response.data);
    } catch (error) {
      console.error('Error loading database detail:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load database details',
        variant: 'destructive',
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = (item: DatabaseItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }
    setEditingDatabaseId(item.id);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    loadDatabases();
  }, [currentWorkspace]);

  // Check for create query parameter
  useEffect(() => {
    const createParam = searchParams.get('create');
    if (createParam === 'true' && currentWorkspace?.id) {
      setIsCreateModalOpen(true);
      // Remove query parameter from URL
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, currentWorkspace, setSearchParams]);

  const loadDatabases = async () => {
    if (!currentWorkspace?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getDatabases(currentWorkspace.id);

      // Map API response to DatabaseItem type
      const mappedDatabases: DatabaseItem[] = [];
      
      // API response formatına göre databases'leri map et
      // Eğer response.data bir array ise direkt kullan, değilse response.data.items veya response.data.databases olabilir
      const databasesData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || response.data?.databases || [];

      databasesData.forEach((db: any) => {
        // Database type'ı küçük harfe çevir (postgresql, mysql, vb.)
        const dbType = db.database_type?.toLowerCase() || db.type?.toLowerCase() || 'postgresql';
        const normalizedType = dbType === 'postgresql' ? 'postgresql' 
          : dbType === 'mysql' ? 'mysql'
          : dbType === 'mongodb' ? 'mongodb'
          : dbType === 'redis' ? 'redis'
          : 'postgresql'; // default

        // Status'u belirle (eğer API'den gelmiyorsa varsayılan olarak 'disconnected')
        const status = db.status?.toLowerCase() || db.connection_status?.toLowerCase() || 'disconnected';
        const normalizedStatus = status === 'connected' ? 'connected'
          : status === 'disconnected' ? 'disconnected'
          : status === 'error' ? 'error'
          : 'disconnected';

        mappedDatabases.push({
          id: db.id || db.database_id || `database-${Date.now()}`,
          name: db.name || db.database_name || 'Unnamed Database',
          description: db.description || db.database_description,
          type: normalizedType as 'postgresql' | 'mysql' | 'mongodb' | 'redis',
          host: db.host || '',
          status: normalizedStatus as 'connected' | 'disconnected' | 'error',
          createdAt: db.created_at || db.createdAt || new Date().toISOString(),
          updatedAt: db.updated_at || db.updatedAt || new Date().toISOString(),
        });
      });

      setDatabases(mappedDatabases);
    } catch (error) {
      console.error('Error loading databases:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load databases',
        variant: 'destructive',
      });
      setDatabases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: DatabaseItem) => {
    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      return;
    }
    setDeletingDatabase(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentWorkspace?.id || !deletingDatabase) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteDatabase(currentWorkspace.id, deletingDatabase.id);
      toast({
        title: 'Success',
        description: `${deletingDatabase.name} has been deleted successfully.`,
      });
      // Reload databases after deletion
      await loadDatabases();
      setIsDeleteModalOpen(false);
      setDeletingDatabase(null);
    } catch (error) {
      console.error('Error deleting database:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete database',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
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
        pageTitle="Databases"
        pageDescription="Connect and manage database connections"
        items={databases}
        isLoading={isLoading}
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

      {/* Create Database Modal */}
      {currentWorkspace && (
        <CreateDatabaseModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            // Remove query parameter if it exists
            if (searchParams.get('create') === 'true') {
              setSearchParams({}, { replace: true });
            }
          }}
          workspaceId={currentWorkspace.id}
          onSuccess={() => {
            loadDatabases();
            toast({
              title: 'Success',
              description: 'Database connection created successfully',
            });
          }}
        />
      )}

      {/* Database Detail Modal */}
      <DatabaseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDatabaseDetail(null);
        }}
        databaseDetail={databaseDetail}
        isLoading={isLoadingDetail}
      />

      {/* Edit Database Modal */}
      {currentWorkspace && editingDatabaseId && (
        <EditDatabaseModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDatabaseId(null);
          }}
          workspaceId={currentWorkspace.id}
          databaseId={editingDatabaseId}
          onSuccess={() => {
            loadDatabases();
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingDatabase(null);
        }}
        onConfirm={confirmDelete}
        itemName={deletingDatabase?.name || ''}
        itemType="database"
        isDeleting={isDeleting}
      />
    </>
  );
};

export default Databases;
