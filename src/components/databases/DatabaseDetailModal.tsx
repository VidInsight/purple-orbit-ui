import { Modal } from '@/components/ui/Modal';
import { Database, Calendar, Tag, CheckCircle2, XCircle, AlertCircle, Server, Lock, Database as DatabaseIcon } from 'lucide-react';
import { DatabaseDetail } from '@/services/databasesApi';

interface DatabaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  databaseDetail: DatabaseDetail | null;
  isLoading: boolean;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

const formatDatabaseType = (type: string) => {
  const types: Record<string, string> = {
    POSTGRESQL: 'PostgreSQL',
    MYSQL: 'MySQL',
    MONGODB: 'MongoDB',
    REDIS: 'Redis',
    SQLITE: 'SQLite',
    MSSQL: 'Microsoft SQL Server',
    ORACLE: 'Oracle',
  };
  return types[type.toUpperCase()] || type;
};

export const DatabaseDetailModal = ({
  isOpen,
  onClose,
  databaseDetail,
  isLoading,
}: DatabaseDetailModalProps) => {
  const getStatusIcon = (status?: string) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'connected') {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    } else if (normalizedStatus === 'error') {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    } else {
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status?: string) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'connected') {
      return <span className="text-sm text-success font-medium">Connected</span>;
    } else if (normalizedStatus === 'error') {
      return <span className="text-sm text-destructive font-medium">Error</span>;
    } else {
      return <span className="text-sm text-muted-foreground font-medium">Disconnected</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Database Details"
      size="lg"
    >
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : databaseDetail ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <div className="mt-1 flex items-center gap-2">
                  <DatabaseIcon className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold text-foreground">{databaseDetail.name}</span>
                </div>
              </div>

              {databaseDetail.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm text-foreground">{databaseDetail.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Database Type</label>
                  <p className="mt-1 text-sm text-foreground font-medium">
                    {formatDatabaseType(databaseDetail.database_type)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusIcon(databaseDetail.status || databaseDetail.connection_status)}
                    {getStatusText(databaseDetail.status || databaseDetail.connection_status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Information */}
            <div className="border-t border-border pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Server className="h-4 w-4" />
                Connection Information
              </h3>

              {databaseDetail.connection_string ? (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Connection String</label>
                  <p className="mt-1 text-xs font-mono text-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                    {databaseDetail.connection_string}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Host</label>
                      <p className="mt-1 text-sm text-foreground font-medium">{databaseDetail.host}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Port</label>
                      <p className="mt-1 text-sm text-foreground font-medium">{databaseDetail.port}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Database Name</label>
                    <p className="mt-1 text-sm text-foreground font-medium">{databaseDetail.database_name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="mt-1 text-sm text-foreground font-medium">{databaseDetail.username}</p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-muted-foreground">SSL Enabled</label>
                <div className="ml-auto">
                  {databaseDetail.ssl_enabled ? (
                    <span className="text-sm text-success font-medium">Yes</span>
                  ) : (
                    <span className="text-sm text-muted-foreground font-medium">No</span>
                  )}
                </div>
              </div>

              {databaseDetail.additional_params && Object.keys(databaseDetail.additional_params).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Additional Parameters</label>
                  <pre className="mt-1 text-xs font-mono text-foreground bg-surface border border-border rounded px-2 py-1.5 overflow-x-auto">
                    {JSON.stringify(databaseDetail.additional_params, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground font-medium">{formatDate(databaseDetail.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span className="text-foreground font-medium">{formatDate(databaseDetail.updated_at)}</span>
              </div>
            </div>

            {/* Tags */}
            {databaseDetail.tags && databaseDetail.tags.length > 0 && (
              <div className="border-t border-border pt-4">
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {databaseDetail.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* IDs */}
            <div className="border-t border-border pt-4 space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Database ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {databaseDetail.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Workspace ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {databaseDetail.workspace_id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Owner ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {databaseDetail.owner_id}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No database details available
          </div>
        )}
      </div>
    </Modal>
  );
};

