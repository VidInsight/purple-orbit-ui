import { Modal } from '@/components/ui/Modal';
import { Key, Calendar, Eye, EyeOff, Lock } from 'lucide-react';
import { VariableDetail } from '@/services/variablesApi';
import { useState } from 'react';

interface VariableDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  variableDetail: VariableDetail | null;
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

export const VariableDetailModal = ({
  isOpen,
  onClose,
  variableDetail,
  isLoading,
}: VariableDetailModalProps) => {
  const [showValue, setShowValue] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Variable Details"
      size="md"
    >
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : variableDetail ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Key</label>
                <div className="mt-1 flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold text-foreground font-mono">{variableDetail.key}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Value</label>
                <div className="relative">
                  <div className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-2">
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {variableDetail.is_secret && !showValue ? (
                      <span className="text-sm font-mono text-muted-foreground flex-1">
                        ••••••••••••••••
                      </span>
                    ) : (
                      <span className="text-sm font-mono text-foreground flex-1 break-all">
                        {variableDetail.value}
                      </span>
                    )}
                    {variableDetail.is_secret && (
                      <button
                        type="button"
                        onClick={() => setShowValue(!showValue)}
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      >
                        {showValue ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {variableDetail.is_secret && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    This is a secret variable. Click the eye icon to reveal the value.
                  </p>
                )}
              </div>

              {variableDetail.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm text-foreground">{variableDetail.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <div className="mt-1 flex items-center gap-2">
                  {variableDetail.is_secret ? (
                    <>
                      <Lock className="h-4 w-4 text-warning" />
                      <span className="text-sm text-foreground font-medium">Secret</span>
                    </>
                  ) : (
                    <span className="text-sm text-foreground font-medium">Public</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground font-medium">{formatDate(variableDetail.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span className="text-foreground font-medium">{formatDate(variableDetail.updated_at)}</span>
              </div>
            </div>

            {/* IDs */}
            <div className="border-t border-border pt-4 space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Variable ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {variableDetail.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Workspace ID</label>
                <p className="mt-1 text-xs font-mono text-muted-foreground bg-surface border border-border rounded px-2 py-1.5 break-all">
                  {variableDetail.workspace_id}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No variable details available
          </div>
        )}
      </div>
    </Modal>
  );
};

