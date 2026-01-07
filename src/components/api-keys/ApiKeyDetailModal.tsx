import { Modal } from '@/components/ui/Modal';
import { Key, Calendar, CheckCircle2, XCircle, Tag, Shield, Globe } from 'lucide-react';
import { ApiKeyDetail } from '@/services/apiKeysApi';

interface ApiKeyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyDetail: ApiKeyDetail | null;
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

export const ApiKeyDetailModal = ({
  isOpen,
  onClose,
  apiKeyDetail,
  isLoading,
}: ApiKeyDetailModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="API Key Details"
      size="md"
    >
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : apiKeyDetail ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <div className="mt-1 flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold text-foreground">{apiKeyDetail.name}</span>
                </div>
              </div>

              {apiKeyDetail.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm text-foreground">{apiKeyDetail.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">API Key</label>
                <div className="mt-1">
                  <code className="block w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground font-mono text-sm break-all">
                    {apiKeyDetail.api_key_masked}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    {apiKeyDetail.is_active ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-foreground font-medium">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-foreground font-medium">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Usage Count</label>
                  <p className="mt-1 text-sm text-foreground font-medium">{apiKeyDetail.usage_count}</p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {apiKeyDetail.permissions && Object.keys(apiKeyDetail.permissions).length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {Object.entries(apiKeyDetail.permissions).map(([permission, enabled]) => (
                      <div
                        key={permission}
                        className="flex items-center justify-between p-2 bg-surface border border-border rounded-md"
                      >
                        <span className="text-sm text-foreground font-mono">{permission}</span>
                        {enabled ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {apiKeyDetail.tags && apiKeyDetail.tags.length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {apiKeyDetail.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Allowed IPs */}
            {apiKeyDetail.allowed_ips && apiKeyDetail.allowed_ips.length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4" />
                    Allowed IPs
                  </label>
                  <div className="space-y-1">
                    {apiKeyDetail.allowed_ips.map((ip, index) => (
                      <div
                        key={index}
                        className="px-2 py-1 bg-surface border border-border rounded-md text-sm font-mono text-foreground"
                      >
                        {ip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground font-medium">{formatDate(apiKeyDetail.created_at)}</span>
              </div>
              {apiKeyDetail.expires_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="text-foreground font-medium">{formatDate(apiKeyDetail.expires_at)}</span>
                </div>
              )}
              {apiKeyDetail.last_used_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Used:</span>
                  <span className="text-foreground font-medium">{formatDate(apiKeyDetail.last_used_at)}</span>
                </div>
              )}
            </div>

            {/* IDs */}
            <div className="border-t border-border pt-4 space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">API Key ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {apiKeyDetail.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Workspace ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {apiKeyDetail.workspace_id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Owner ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {apiKeyDetail.owner_id}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No API key details available
          </div>
        )}
      </div>
    </Modal>
  );
};

