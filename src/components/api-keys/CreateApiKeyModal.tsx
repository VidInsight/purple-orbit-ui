import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateApiKeyData) => void;
}

export interface CreateApiKeyData {
  name: string;
  description: string;
  expiration: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  { id: 'workflows.read', label: 'Read Workflows' },
  { id: 'workflows.write', label: 'Write Workflows' },
  { id: 'executions.read', label: 'Read Executions' },
  { id: 'executions.write', label: 'Execute Workflows' },
  { id: 'credentials.read', label: 'Read Credentials' },
  { id: 'credentials.write', label: 'Write Credentials' },
  { id: 'databases.read', label: 'Read Databases' },
  { id: 'databases.write', label: 'Write Databases' },
  { id: 'variables.read', label: 'Read Variables' },
  { id: 'variables.write', label: 'Write Variables' },
  { id: 'files.read', label: 'Read Files' },
  { id: 'files.write', label: 'Write Files' },
];

export const CreateApiKeyModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateApiKeyModalProps) => {
  const [formData, setFormData] = useState<CreateApiKeyData>({
    name: '',
    description: '',
    expiration: '90',
    permissions: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Select at least one permission';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      expiration: '90',
      permissions: [],
    });
    setErrors({});
    onClose();
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
    setErrors((prev) => ({ ...prev, permissions: '' }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate API Key"
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
            Expiration
          </Label>
          <Select
            value={formData.expiration}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, expiration: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select expiration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="never">Never expire</SelectItem>
            </SelectContent>
          </Select>
          {formData.expiration === 'never' && (
            <p className="mt-2 text-xs text-amber-500 flex items-center gap-1">
              <span>⚠️</span>
              Keys without expiration pose a security risk
            </p>
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-3">
            Permissions
          </Label>
          <div className="space-y-3 max-h-[240px] overflow-y-auto border border-input rounded-lg p-4 bg-surface">
            {AVAILABLE_PERMISSIONS.map((permission) => (
              <div key={permission.id} className="flex items-center gap-3">
                <Checkbox
                  id={permission.id}
                  checked={formData.permissions.includes(permission.id)}
                  onCheckedChange={() => togglePermission(permission.id)}
                />
                <Label
                  htmlFor={permission.id}
                  className="text-sm text-foreground cursor-pointer flex-1"
                >
                  {permission.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.permissions && (
            <p className="mt-2 text-sm text-destructive">{errors.permissions}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Generate Key
          </Button>
        </div>
      </form>
    </Modal>
  );
};
