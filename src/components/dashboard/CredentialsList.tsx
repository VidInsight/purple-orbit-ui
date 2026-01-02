import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Key, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CredentialItem } from '@/types/common';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getCredentialDetail, CredentialDetail } from '@/services/credentialsApi';
import { CredentialDetailModal } from '@/components/credentials/CredentialDetailModal';
import { toast } from '@/hooks/use-toast';

interface CredentialsListProps {
  credentials: CredentialItem[];
  isLoading?: boolean;
}

export const CredentialsList = ({ credentials, isLoading }: CredentialsListProps) => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [credentialDetail, setCredentialDetail] = useState<CredentialDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleViewCredential = async (credential: CredentialItem) => {
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
      const response = await getCredentialDetail(currentWorkspace.id, credential.id);
      setCredentialDetail(response.data);
    } catch (error) {
      console.error('Error loading credential detail:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load credential details',
        variant: 'destructive',
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credentials
          </CardTitle>
          <CardDescription>Loading credentials...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (credentials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credentials
          </CardTitle>
          <CardDescription>No credentials configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Key className="h-8 w-8 text-muted-foreground" />
            <span>Add credentials to connect with external services</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Credentials
        </CardTitle>
        <CardDescription>
          {credentials.length} credential{credentials.length > 1 ? 's' : ''} configured
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {credentials.map((credential) => (
            <div
              key={credential.id}
              className="p-3 rounded-lg border bg-surface hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded bg-surface">
                    <Key className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {credential.name}
                    </div>
                    {credential.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {credential.description}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Type: {credential.type}
                      </span>
                      {credential.lastUsed && (
                        <span className="text-xs text-muted-foreground">
                          Last used: {new Date(credential.lastUsed).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewCredential(credential)}
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/credentials')}
            className="w-full"
          >
            View All Credentials
          </Button>
        </div>
      </CardContent>

      {/* Credential Detail Modal */}
      <CredentialDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setCredentialDetail(null);
        }}
        credentialDetail={credentialDetail}
        isLoading={isLoadingDetail}
      />
    </Card>
  );
};

