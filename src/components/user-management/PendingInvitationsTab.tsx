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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Role
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Invited By
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Sent At
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => {
              const expiration = getExpirationStatus(invitation.expiresAt);
              return (
                <tr
                  key={invitation.id}
                  className="border-b border-border hover:bg-surface/50 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-foreground">
                    {invitation.email}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        ROLE_COLORS[invitation.role]
                      }`}
                    >
                      {ROLE_LABELS[invitation.role]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {invitation.invitedBy}
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {formatDate(invitation.sentAt)}
                  </td>
                  <td className="py-4 px-4">
                    <div className={`flex items-center gap-1 text-xs ${expiration.color}`}>
                      <Clock className="h-3 w-3" />
                      {expiration.text}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResend(invitation.id)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelClick(invitation)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {invitations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pending invitations</p>
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
