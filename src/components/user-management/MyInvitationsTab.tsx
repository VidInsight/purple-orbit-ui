import { useState } from 'react';
import { PendingInvitation, ROLE_COLORS, ROLE_LABELS } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MyInvitationsTabProps {
  invitations: PendingInvitation[];
  onAccept: (invitationId: string) => Promise<void>;
  onDecline: (invitationId: string) => Promise<void>;
}

export const MyInvitationsTab = ({
  invitations,
  onAccept,
  onDecline,
}: MyInvitationsTabProps) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (invitation: PendingInvitation) => {
    setProcessingId(invitation.id);
    try {
      await onAccept(invitation.id);
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitation: PendingInvitation) => {
    setProcessingId(invitation.id);
    try {
      await onDecline(invitation.id);
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setProcessingId(null);
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

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No invitations found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {invitations.map((invitation) => {
        const expiration = getExpirationStatus(invitation.expiresAt);
        const isProcessing = processingId === invitation.id;
        const isExpired = new Date(invitation.expiresAt).getTime() < Date.now();

        return (
          <div
            key={invitation.id}
            className="group flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground truncate">
                  Workspace Invitation
                </p>
              </div>
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
                <span className="truncate">{expiration.text}</span>
              </div>

              <div className="flex items-center gap-2">
                {!isExpired && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecline(invitation)}
                      disabled={isProcessing}
                      className="h-8 px-3 text-xs"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAccept(invitation)}
                      disabled={isProcessing}
                      className="h-8 px-3 text-xs"
                    >
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Accept
                    </Button>
                  </>
                )}
                {isExpired && (
                  <span className="text-xs text-muted-foreground">Expired</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

