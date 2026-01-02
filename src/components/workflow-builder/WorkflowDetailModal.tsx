import { Modal } from '@/components/ui/Modal';
import { GitBranch, Calendar, Tag, CheckCircle2, XCircle, Clock, PlayCircle } from 'lucide-react';
import { WorkflowDetail } from '@/services/workflowApi';

interface WorkflowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowDetail: WorkflowDetail | null;
  isLoading: boolean;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Never';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

const formatStatus = (status?: string) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const WorkflowDetailModal = ({
  isOpen,
  onClose,
  workflowDetail,
  isLoading,
}: WorkflowDetailModalProps) => {
  const getStatusIcon = (status?: string) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'active') {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    } else if (normalizedStatus === 'inactive') {
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
    } else {
      return <XCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusText = (status?: string) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'active') {
      return <span className="text-sm text-success font-medium">Active</span>;
    } else if (normalizedStatus === 'inactive') {
      return <span className="text-sm text-muted-foreground font-medium">Inactive</span>;
    } else {
      return <span className="text-sm text-warning font-medium">{formatStatus(status)}</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workflow Details"
      size="lg"
    >
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : workflowDetail ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <div className="mt-1 flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold text-foreground">{workflowDetail.name}</span>
                </div>
              </div>

              {workflowDetail.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm text-foreground">{workflowDetail.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusIcon(workflowDetail.status)}
                    {getStatusText(workflowDetail.status)}
                  </div>
                </div>
                {workflowDetail.priority !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <p className="mt-1 text-sm text-foreground font-medium">{workflowDetail.priority}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Execution Information */}
            {(workflowDetail.execution_count !== undefined || workflowDetail.last_executed) && (
              <div className="border-t border-border pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Execution Information
                </h3>
                {workflowDetail.execution_count !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Execution Count:</span>
                    <span className="text-foreground font-medium">{workflowDetail.execution_count}</span>
                  </div>
                )}
                {workflowDetail.last_executed && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Executed:</span>
                    <span className="text-foreground font-medium">{formatDate(workflowDetail.last_executed)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground font-medium">{formatDate(workflowDetail.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span className="text-foreground font-medium">{formatDate(workflowDetail.updated_at)}</span>
              </div>
            </div>

            {/* Tags */}
            {workflowDetail.tags && workflowDetail.tags.length > 0 && (
              <div className="border-t border-border pt-4">
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {workflowDetail.tags.map((tag, index) => (
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
                <label className="text-sm font-medium text-muted-foreground">Workflow ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {workflowDetail.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Workspace ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {workflowDetail.workspace_id}
                </p>
              </div>
              {workflowDetail.owner_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Owner ID</label>
                  <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                    {workflowDetail.owner_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No workflow details available
          </div>
        )}
      </div>
    </Modal>
  );
};

