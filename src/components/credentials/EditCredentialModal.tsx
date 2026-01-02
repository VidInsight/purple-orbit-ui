import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { getCredentialDetail, updateCredential, CredentialDetail } from '@/services/credentialsApi';
import { toast } from '@/hooks/use-toast';

interface EditCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  credentialId: string;
  onSuccess: () => void;
}

export const EditCredentialModal = ({
  isOpen,
  onClose,
  workspaceId,
  credentialId,
  onSuccess,
}: EditCredentialModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [credentialDetail, setCredentialDetail] = useState<CredentialDetail | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen && credentialId) {
      loadCredentialDetail();
    }
  }, [isOpen, credentialId]);

  const loadCredentialDetail = async () => {
    try {
      setIsLoading(true);
      const response = await getCredentialDetail(workspaceId, credentialId);
      const detail = response.data;
      setCredentialDetail(detail);
      setFormData({
        name: detail.name || '',
        description: detail.description || '',
        tags: detail.tags || [],
      });
    } catch (error) {
      console.error('Error loading credential detail:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load credential details',
        variant: 'destructive',
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const updatePayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      await updateCredential(workspaceId, credentialId, updatePayload);
      
      toast({
        title: 'Success',
        description: 'Credential updated successfully',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating credential:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update credential',
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
        description: '',
        tags: [],
      });
      setTagInput('');
      setCredentialDetail(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Credential"
      size="md"
      closeOnBackdropClick={!isSaving}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
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
            {formData.tags.length > 0 && (
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
              disabled={isSaving || !formData.name.trim()}
              loading={isSaving}
            >
              Update Credential
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

