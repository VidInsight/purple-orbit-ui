import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createWorkflow, CreateWorkflowData } from '@/services/workflowApi';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess?: () => void;
}

export const CreateWorkflowModal = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: CreateWorkflowModalProps) => {
  const [formData, setFormData] = useState<CreateWorkflowData>({
    name: '',
    description: '',
    priority: 1,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if workspaceId is valid when modal opens
  useEffect(() => {
    if (isOpen && (!workspaceId || workspaceId.trim() === '')) {
      toast({
        title: 'Error',
        description: 'Workspace ID is missing. Please select a workspace first.',
        variant: 'destructive',
      });
      onClose();
    }
  }, [isOpen, workspaceId, onClose]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), trimmedTag],
      });
      setTagInput('');
      setErrors((prev) => ({ ...prev, tags: '' }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.priority !== undefined && formData.priority < 1) {
      newErrors.priority = 'Priority must be greater than or equal to 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!workspaceId || workspaceId.trim() === '') {
      toast({
        title: 'Error',
        description: 'Workspace ID is missing. Please select a workspace first.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const payload: CreateWorkflowData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        priority: formData.priority && formData.priority >= 1 ? formData.priority : undefined,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      };

      await createWorkflow(workspaceId, payload);

      toast({
        title: 'Success',
        description: 'Workflow created successfully',
      });

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create workflow',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFormData({
        name: '',
        description: '',
        priority: 1,
        tags: [],
      });
      setTagInput('');
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Workflow"
      size="md"
      closeOnBackdropClick={!isCreating}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="My Workflow"
            disabled={isCreating}
            required
            className="w-full"
            autoFocus
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description (Optional)
          </Label>
          <textarea
            id="description"
            placeholder="Açıklama"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isCreating}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-surface border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <div>
          <Label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
            Priority (Optional)
          </Label>
          <Input
            id="priority"
            type="number"
            min="1"
            value={formData.priority || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              setFormData({ ...formData, priority: value });
              setErrors((prev) => ({ ...prev, priority: '' }));
            }}
            placeholder="1"
            disabled={isCreating}
            className="w-full"
          />
          {errors.priority && (
            <p className="mt-1 text-sm text-destructive">{errors.priority}</p>
          )}
<p className="mt-1 text-xs text-muted-foreground">
  Default: 1, must be {'>= 1'}
</p>
        </div>

        <div>
          <Label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
            Tags (Optional)
          </Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter tag and press Enter"
              disabled={isCreating}
              className="w-full"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTag}
              disabled={isCreating || !tagInput.trim()}
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
                    disabled={isCreating}
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
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || !formData.name.trim()}
            loading={isCreating}
          >
            Create Workflow
          </Button>
        </div>
      </form>
    </Modal>
  );
};
