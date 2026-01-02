import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createVariable, CreateVariableRequest } from '@/services/variablesApi';
import { toast } from '@/hooks/use-toast';

interface CreateVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export const CreateVariableModal = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: CreateVariableModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CreateVariableRequest>({
    key: '',
    value: '',
    description: '',
    is_secret: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.key.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Key is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.value.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Value is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const payload: CreateVariableRequest = {
        key: formData.key.trim(),
        value: formData.value.trim(),
        description: formData.description?.trim() || undefined,
        is_secret: formData.is_secret,
      };

      await createVariable(workspaceId, payload);
      
      toast({
        title: 'Success',
        description: 'Variable created successfully',
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating variable:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create variable',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFormData({
        key: '',
        value: '',
        description: '',
        is_secret: false,
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Variable"
      size="md"
      closeOnBackdropClick={!isSaving}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="key" className="block text-sm font-medium text-foreground mb-2">
            Key <span className="text-destructive">*</span>
          </Label>
          <Input
            id="key"
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="API_KEY"
            disabled={isSaving}
            required
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="value" className="block text-sm font-medium text-foreground mb-2">
            Value <span className="text-destructive">*</span>
          </Label>
          <Input
            id="value"
            type={formData.is_secret ? 'password' : 'text'}
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="secret_value"
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
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="API key for external service"
            disabled={isSaving}
            rows={3}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_secret"
            checked={formData.is_secret}
            onCheckedChange={(checked) => setFormData({ ...formData, is_secret: checked === true })}
            disabled={isSaving}
          />
          <Label
            htmlFor="is_secret"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Mark as secret (value will be hidden)
          </Label>
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
            disabled={isSaving || !formData.key.trim() || !formData.value.trim()}
            loading={isSaving}
          >
            Create Variable
          </Button>
        </div>
      </form>
    </Modal>
  );
};

