import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from 'lucide-react';
import { GoogleServiceSelector, GOOGLE_SERVICES } from './GoogleServiceSelector';
import { GoogleServiceType } from '@/types/common';
import { createGoogleCredential, CreateGoogleCredentialRequest } from '@/services/credentialsApi';
import { toast } from '@/hooks/use-toast';

interface GoogleCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export const GoogleCredentialModal = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: GoogleCredentialModalProps) => {
  const [selectedService, setSelectedService] = useState<GoogleServiceType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedServiceConfig = selectedService
    ? GOOGLE_SERVICES.find((s) => s.type === selectedService)
    : null;

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsAuthenticating(false);
        setIsSaving(true);

        // Get user info to verify token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to verify Google authentication');
        }

        // Note: refresh_token is only provided on first authorization
        // For subsequent uses, backend should handle token refresh
        const payload: CreateGoogleCredentialRequest = {
          name: name.trim() || `${selectedServiceConfig?.name} Credential`,
          service_type: selectedService!,
          oauth_token: tokenResponse.access_token,
          refresh_token: (tokenResponse as any).refresh_token || '',
          description: description.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
          expires_at: null,
        };

        await createGoogleCredential(workspaceId, payload);

        toast({
          title: 'Success',
          description: 'Google credential created successfully',
        });

        onSuccess();
        handleClose();
      } catch (error) {
        console.error('Error creating Google credential:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create Google credential',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      setIsAuthenticating(false);
      toast({
        title: 'Authentication Error',
        description: 'Failed to authenticate with Google. Please try again.',
        variant: 'destructive',
      });
    },
    scope: selectedServiceConfig?.scopes.join(' ') || '',
  });

  const handleConnect = () => {
    if (!selectedService) {
      toast({
        title: 'Validation Error',
        description: 'Please select a Google service',
        variant: 'destructive',
      });
      return;
    }

    if (!name.trim() && !selectedServiceConfig) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a credential name',
        variant: 'destructive',
      });
      return;
    }

    setIsAuthenticating(true);
    handleGoogleLogin();
  };

  const handleClose = () => {
    if (!isSaving && !isAuthenticating) {
      setSelectedService(null);
      setName('');
      setDescription('');
      setTags([]);
      setTagInput('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Google Credential"
      size="md"
      closeOnBackdropClick={!isSaving && !isAuthenticating}
    >
      <div className="space-y-6">
        {/* Service Selection */}
        <div>
          <Label className="block text-sm font-medium text-foreground mb-3">
            Select Google Service <span className="text-destructive">*</span>
          </Label>
          <GoogleServiceSelector
            selectedService={selectedService}
            onSelectService={setSelectedService}
            disabled={isSaving || isAuthenticating}
          />
        </div>

        {/* Credential Name */}
        <div>
          <Label htmlFor="google-name" className="block text-sm font-medium text-foreground mb-2">
            Credential Name
          </Label>
          <Input
            id="google-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={selectedServiceConfig ? `${selectedServiceConfig.name} Credential` : 'Enter credential name'}
            disabled={isSaving || isAuthenticating}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {selectedServiceConfig
              ? `Default: ${selectedServiceConfig.name} Credential`
              : 'Leave empty to use default name'}
          </p>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="google-description" className="block text-sm font-medium text-foreground mb-2">
            Description
          </Label>
          <Textarea
            id="google-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Credential description (optional)"
            disabled={isSaving || isAuthenticating}
            rows={3}
            className="w-full"
          />
        </div>

        {/* Tags */}
        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag and press Enter"
              disabled={isSaving || isAuthenticating}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTag}
              disabled={isSaving || isAuthenticating || !tagInput.trim()}
            >
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isSaving || isAuthenticating}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        {selectedServiceConfig && (
          <div className="p-3 rounded-md bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Required permissions:</strong>{' '}
              {selectedServiceConfig.scopes.join(', ')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving || isAuthenticating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConnect}
            disabled={isSaving || isAuthenticating || !selectedService}
            loading={isAuthenticating || isSaving}
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect with Google'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

