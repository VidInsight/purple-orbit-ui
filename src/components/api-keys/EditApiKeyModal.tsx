import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiKey, UpdateApiKeyRequest } from '@/types/api';

interface EditApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateApiKeyRequest) => void;
  apiKey: ApiKey | null;
}

export const EditApiKeyModal = ({
  isOpen,
  onClose,
  onSubmit,
  apiKey,
}: EditApiKeyModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    expires_at: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (apiKey) {
      setFormData({
        name: apiKey.name,
        description: apiKey.description || '',
        is_active: apiKey.is_active,
        expires_at: apiKey.expires_at ? new Date(apiKey.expires_at).toISOString().split('T')[0] : '',
      });
    }
  }, [apiKey, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const request: UpdateApiKeyRequest = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      is_active: formData.is_active,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      tags: [],
      allowed_ips: null,
    };
    
    onSubmit(request);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
      expires_at: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit API Key"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label="Name"
            placeholder="Production API Key"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            required
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Description
          </Label>
          <Textarea
            placeholder="Optional description for this key"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-surface border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Expiration Date
          </Label>
          <Input
            type="date"
            value={formData.expires_at}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, expires_at: e.target.value }))
            }
          />
          {formData.expires_at && (
            <p className="mt-2 text-xs text-muted-foreground">
              Key will expire on {new Date(formData.expires_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="is_active" className="text-sm text-foreground cursor-pointer">
            Active (key can be used)
          </Label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

