import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Key, Calendar, Tag, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { CredentialDetail } from '@/services/credentialsApi';

interface CredentialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentialDetail: CredentialDetail | null;
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

export const CredentialDetailModal = ({
  isOpen,
  onClose,
  credentialDetail,
  isLoading,
}: CredentialDetailModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Credential Details"
      size="md"
      
    >
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : credentialDetail ? (
          <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <div className="mt-1 flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <span className="text-base font-semibold text-foreground">{credentialDetail.name}</span>
              </div>
            </div>

            {credentialDetail.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm text-foreground">{credentialDetail.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="mt-1 text-sm text-foreground font-medium">{credentialDetail.credential_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Provider</label>
                <p className="mt-1 text-sm text-foreground font-medium">{credentialDetail.credential_provider}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1 flex items-center gap-2">
                {credentialDetail.is_active ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="text-foreground font-medium">{formatDate(credentialDetail.created_at)}</span>
            </div>
            {credentialDetail.expires_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Expires:</span>
                <span className="text-foreground font-medium">{formatDate(credentialDetail.expires_at)}</span>
              </div>
            )}
            {credentialDetail.last_used_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Used:</span>
                <span className="text-foreground font-medium">{formatDate(credentialDetail.last_used_at)}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {credentialDetail.tags && credentialDetail.tags.length > 0 && (
            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {credentialDetail.tags.map((tag, index) => (
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
              <label className="text-sm font-medium text-muted-foreground">Credential ID</label>
              <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5">
                {credentialDetail.id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Workspace ID</label>
              <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5">
                {credentialDetail.workspace_id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Owner ID</label>
              <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5">
                {credentialDetail.owner_id}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No credential details available
        </div>
      )}
      </div>
    </Modal>
  );
};

