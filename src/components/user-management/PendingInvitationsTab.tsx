import { useState } from 'react';
import { PendingInvitation, ROLE_COLORS, ROLE_LABELS } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { Send, Trash2, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PendingInvitationsTabProps {
  invitations: PendingInvitation[];
  onResend: (invitationId: string) => void;
  onCancel: (invitationId: string) => Promise<void>;
}

export const PendingInvitationsTab = ({
  invitations,
  onResend,
  onCancel,
}: PendingInvitationsTabProps) => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [invitationToCancel, setInvitationToCancel] = useState<PendingInvitation | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelClick = (invitation: PendingInvitation) => {
    setInvitationToCancel(invitation);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!invitationToCancel) return;

    setIsCanceling(true);
    try {
      await onCancel(invitationToCancel.id);
      setCancelModalOpen(false);
      setInvitationToCancel(null);
    } finally {
      setIsCanceling(false);
    }
  };

  const getExpirationStatus = (expiresAt: string) => {
    const now = Date.now();
    const expiration = new Date(expiresAt).getTime();
    const hoursUntilExpiry = (expiration - now) / (1000 * 60 * 60);

    if (hoursUntilExpiry < 0) {
      return { text: 'Expired', color: 'text-destructive' };
    }
    if (hoursUntilExpiry < 24) {
      return { text: `Expires in ${Math.floor(hoursUntilExpiry)}h`, color: 'text-amber-500' };
    }
    const daysUntilExpiry = Math.floor(hoursUntilExpiry / 24);
    return { text: `Expires in ${daysUntilExpiry}d`, color: 'text-muted-foreground' };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="space-y-1">
        {invitations.map((invitation) => {
          const expiration = getExpirationStatus(invitation.expiresAt);
          return (
            <div
              key={invitation.id}
              className="group flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {invitation.email}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    Invited by {invitation.invitedBy}
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(invitation.sentAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    ROLE_COLORS[invitation.role]
                  }`}
                >
                  {ROLE_LABELS[invitation.role]}
                </span>
                
                <div className={`flex items-center gap-1 text-xs min-w-[100px] ${expiration.color}`}>
                  <Clock className="h-3 w-3" />
                  {expiration.text}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResend(invitation.id)}
                    className="h-7 w-7 p-0 hover:text-primary"
                    title="Resend invitation"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelClick(invitation)}
                    className="h-7 w-7 p-0 hover:text-destructive"
                    title="Cancel invitation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {invitations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No pending invitations</p>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          if (!isCanceling) {
            setCancelModalOpen(false);
            setInvitationToCancel(null);
          }
        }}
        onConfirm={handleCancelConfirm}
        itemName={invitationToCancel?.email || ''}
        itemType="invitation"
        isDeleting={isCanceling}
      />
    </>
  );
};
