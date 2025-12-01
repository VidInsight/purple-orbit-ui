/**
 * Pending Invitations Page
 * Kullanıcının bekleyen workspace davetlerini görüntüleme ve kabul/reddetme
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Mail, Check, X, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Invitation } from '@/types/api';

interface PendingInvitationWithWorkspace extends Invitation {
  workspace_name?: string;
}

export const PendingInvitations = () => {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<PendingInvitationWithWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) return;

      const response = await apiClient.get<{ items: Invitation[] }>(
        API_ENDPOINTS.user.getPendingInvitations(user.id),
        { token }
      );

      // Sadece pending invitation'ları göster
      const pendingInvitations = response.data.items.filter(
        (inv) => inv.status === 'PENDING'
      );

      setInvitations(pendingInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending invitations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      const token = getToken();
      if (!token) return;

      await apiClient.post(
        API_ENDPOINTS.workspaceInvitation.accept(invitationId),
        {},
        { token }
      );

      toast({
        title: 'Invitation Accepted',
        description: 'You have been added to the workspace.',
      });

      // Invitation'ı listeden kaldır
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

      // Workspace seçim sayfasına yönlendir
      navigate('/');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept invitation',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      const token = getToken();
      if (!token) return;

      await apiClient.post(
        API_ENDPOINTS.workspaceInvitation.decline(invitationId),
        {},
        { token }
      );

      toast({
        title: 'Invitation Declined',
        description: 'The invitation has been declined.',
      });

      // Invitation'ı listeden kaldır
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline invitation',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-[1400px] px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Pending Invitations"
          description="Workspace invitations waiting for your response"
        />

        {invitations.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Pending Invitations
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                You don't have any pending workspace invitations at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        Workspace Invitation
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {invitation.message || 'You have been invited to join a workspace'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Received on {format(new Date(invitation.created_at), 'PPp')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button
                        variant="primary"
                        onClick={() => handleAccept(invitation.id)}
                        disabled={processingId === invitation.id}
                      >
                        {processingId === invitation.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDecline(invitation.id)}
                        disabled={processingId === invitation.id}
                      >
                        {processingId === invitation.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Decline
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PendingInvitations;

