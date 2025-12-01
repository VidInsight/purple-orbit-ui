import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Variable } from '@/types/api';

interface VariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { key: string; value: string; description?: string; is_secret: boolean }) => void;
  variable?: Variable | null;
  mode: 'create' | 'edit';
}

export const VariableModal = ({
  isOpen,
  onClose,
  onSubmit,
  variable,
  mode,
}: VariableModalProps) => {
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    is_secret: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValue, setShowValue] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && variable) {
      setFormData({
        key: variable.key,
        value: variable.is_secret ? '***MASKED***' : variable.value,
        description: variable.description || '',
        is_secret: variable.is_secret,
      });
      setShowValue(false);
    } else {
      setFormData({
        key: '',
        value: '',
        description: '',
        is_secret: false,
      });
      setShowValue(true);
    }
  }, [mode, variable, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    }
    
    if (mode === 'create' && !formData.value.trim()) {
      newErrors.value = 'Value is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({
      key: formData.key.trim(),
      value: formData.value,
      description: formData.description.trim() || undefined,
      is_secret: formData.is_secret,
    });
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      is_secret: false,
    });
    setErrors({});
    setShowValue(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Add Variable' : 'Edit Variable'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label="Key"
            placeholder="API_URL"
            value={formData.key}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, key: e.target.value }));
              setErrors((prev) => ({ ...prev, key: '' }));
            }}
            error={errors.key}
            required
            disabled={mode === 'edit'}
          />
          {mode === 'edit' && (
            <p className="mt-1 text-xs text-muted-foreground">
              Key cannot be changed after creation
            </p>
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Value {mode === 'edit' && formData.is_secret ? '(Secret)' : ''}
          </Label>
          {mode === 'edit' && formData.is_secret && !showValue ? (
            <div className="space-y-2">
              <Input
                value="***MASKED***"
                disabled
                className="bg-muted"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowValue(true)}
              >
                Show Value
              </Button>
            </div>
          ) : (
            <Input
              type={formData.is_secret && !showValue ? 'password' : 'text'}
              placeholder="Enter value"
              value={formData.value}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, value: e.target.value }));
                setErrors((prev) => ({ ...prev, value: '' }));
              }}
              error={errors.value}
              required={mode === 'create'}
            />
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Description
          </Label>
          <Textarea
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-4 py-2 rounded-lg bg-surface border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="is_secret"
            checked={formData.is_secret}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_secret: checked as boolean }))
            }
          />
          <Label
            htmlFor="is_secret"
            className="text-sm text-foreground cursor-pointer"
          >
            Mark as secret (value will be encrypted)
          </Label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

