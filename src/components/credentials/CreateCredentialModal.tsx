import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { createSlackCredential, CreateSlackCredentialRequest } from '@/services/credentialsApi';
import { toast } from '@/hooks/use-toast';
import { CredentialType } from '@/types/common';
import { GoogleCredentialModal } from './GoogleCredentialModal';

interface CreateCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export const CreateCredentialModal = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: CreateCredentialModalProps) => {
  const [credentialType, setCredentialType] = useState<CredentialType>('slack');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CreateSlackCredentialRequest>({
    name: '',
    bot_token: '',
    signing_secret: '',
    app_token: '',
    description: '',
    tags: [],
    expires_at: null,
  });
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), trimmedTag],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.bot_token.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Bot Token is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.signing_secret.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Signing Secret is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.app_token.trim()) {
      toast({
        title: 'Validation Error',
        description: 'App Token is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const payload: CreateSlackCredentialRequest = {
        name: formData.name.trim(),
        bot_token: formData.bot_token.trim(),
        signing_secret: formData.signing_secret.trim(),
        app_token: formData.app_token.trim(),
        description: formData.description?.trim() || undefined,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
        expires_at: null,
      };

      await createSlackCredential(workspaceId, payload);
      
      toast({
        title: 'Success',
        description: 'Credential created successfully',
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating credential:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create credential',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFormData({
        name: '',
        bot_token: '',
        signing_secret: '',
        app_token: '',
        description: '',
        tags: [],
        expires_at: null,
      });
      setTagInput('');
      setCredentialType('slack');
      onClose();
    }
  };

  const handleTypeChange = (type: CredentialType) => {
    setCredentialType(type);
    if (type === 'google') {
      setIsGoogleModalOpen(true);
    }
  };

  const handleGoogleSuccess = () => {
    setIsGoogleModalOpen(false);
    handleClose();
    onSuccess();
  };

  const handleGoogleClose = () => {
    setIsGoogleModalOpen(false);
    setCredentialType('slack');
  };

  // If Google is selected, show Google modal instead
  if (isGoogleModalOpen && isOpen) {
    return (
      <GoogleCredentialModal
        isOpen={isGoogleModalOpen}
        onClose={() => {
          handleGoogleClose();
          onClose();
        }}
        workspaceId={workspaceId}
        onSuccess={handleGoogleSuccess}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Credential"
      size="md"
      closeOnBackdropClick={!isSaving}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Credential Type Selector */}
        <div>
          <Label htmlFor="credential-type" className="block text-sm font-medium text-foreground mb-2">
            Credential Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={credentialType}
            onValueChange={(value) => handleTypeChange(value as CredentialType)}
            disabled={isSaving}
          >
            <SelectTrigger id="credential-type" className="w-full">
              <SelectValue placeholder="Select credential type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slack">Slack</SelectItem>
              <SelectItem value="google">Google (Drive, Sheets, Gmail, Calendar)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {credentialType === 'slack' && (
          <>
        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Credential name"
            disabled={isSaving}
            required
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="bot_token" className="block text-sm font-medium text-foreground mb-2">
            Bot Token <span className="text-destructive">*</span>
          </Label>
          <Input
            id="bot_token"
            type="password"
            value={formData.bot_token}
            onChange={(e) => setFormData({ ...formData, bot_token: e.target.value })}
            placeholder="xoxb-1234567890-abcdef"
            disabled={isSaving}
            required
            className="w-full font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="signing_secret" className="block text-sm font-medium text-foreground mb-2">
            Signing Secret <span className="text-destructive">*</span>
          </Label>
          <Input
            id="signing_secret"
            type="password"
            value={formData.signing_secret}
            onChange={(e) => setFormData({ ...formData, signing_secret: e.target.value })}
            placeholder="abc123def456"
            disabled={isSaving}
            required
            className="w-full font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="app_token" className="block text-sm font-medium text-foreground mb-2">
            App Token <span className="text-destructive">*</span>
          </Label>
          <Input
            id="app_token"
            type="password"
            value={formData.app_token}
            onChange={(e) => setFormData({ ...formData, app_token: e.target.value })}
            placeholder="xapp-1234567890-abcdef"
            disabled={isSaving}
            required
            className="w-full font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Credential description"
            disabled={isSaving}
            rows={3}
            className="w-full"
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Tags
          </Label>
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
              disabled={isSaving}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTag}
              disabled={isSaving || !tagInput.trim()}
            >
              Add
            </Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isSaving}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
          </>
        )}

        {credentialType === 'slack' && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving || !formData.name.trim() || !formData.bot_token.trim() || !formData.signing_secret.trim() || !formData.app_token.trim()}
              loading={isSaving}
            >
              Create Credential
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

