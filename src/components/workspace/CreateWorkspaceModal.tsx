import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreateWorkspaceData } from '@/types/workspace';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkspaceData) => void;
  isCreating?: boolean;
}

export const CreateWorkspaceModal = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating = false,
}: CreateWorkspaceModalProps) => {
  const [formData, setFormData] = useState<CreateWorkspaceData>({
    name: '',
    slug: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<CreateWorkspaceData>>({});

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData({
      ...formData,
      name: newName,
      slug: generateSlug(newName),
    });
  };

  const handleClose = () => {
    if (!isCreating) {
      setFormData({ name: '', slug: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<CreateWorkspaceData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Workspace name must be at least 3 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Workspace name must be less than 50 characters';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Workspace slug is required';
    } else if (formData.slug.trim().length < 3) {
      newErrors.slug = 'Workspace slug must be at least 3 characters';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || undefined,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Workspace"
      size="md"
      closeOnBackdropClick={!isCreating}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <Input
            label="Workspace Name"
            type="text"
            placeholder="My Workspace"
            value={formData.name}
            onChange={handleNameChange}
            error={errors.name}
            disabled={isCreating}
            autoFocus
          />

          <Input
            label="Workspace Slug"
            type="text"
            placeholder="my-workspace"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
            error={errors.slug}
            disabled={isCreating}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Describe your workspace..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isCreating}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-surface border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
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
            variant="primary"
            loading={isCreating}
            disabled={isCreating}
          >
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};
