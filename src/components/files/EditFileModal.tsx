import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { getFileDetail, updateFile, FileDetail } from '@/services/filesApi';
import { toast } from '@/hooks/use-toast';

interface EditFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  fileId: string;
  onSuccess: () => void;
}

export const EditFileModal = ({
  isOpen,
  onClose,
  workspaceId,
  fileId,
  onSuccess,
}: EditFileModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileDetail, setFileDetail] = useState<FileDetail | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen && fileId) {
      loadFileDetail();
    }
  }, [isOpen, fileId]);

  const loadFileDetail = async () => {
    try {
      setIsLoading(true);
      const response = await getFileDetail(workspaceId, fileId);
      const detail = response.data;
      setFileDetail(detail);
      setFormData({
        name: detail.name || '',
        description: detail.description || '',
        tags: detail.tags || [],
      });
    } catch (error) {
      console.error('Error loading file detail:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load file details',
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

      await updateFile(workspaceId, fileId, updatePayload);
      
      toast({
        title: 'Success',
        description: 'File updated successfully',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating file:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update file',
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
      setFileDetail(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit File"
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
              placeholder="File name"
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
              placeholder="File description"
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
              Update File
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

