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
import { X } from 'lucide-react';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateApiKeyData) => void;
  isLoading?: boolean;
}

export interface CreateApiKeyData {
  name: string;
  description: string;
  expiration: string;
  permissions: string[];
  tags?: string[];
  allowed_ips?: string[];
  key_prefix?: string;
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
  isLoading = false,
}: CreateApiKeyModalProps) => {
  const [formData, setFormData] = useState<CreateApiKeyData>({
    name: '',
    description: '',
    expiration: '90',
    permissions: [],
    tags: [],
    allowed_ips: [],
    key_prefix: 'sk_live_',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [ipInput, setIpInput] = useState('');

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
      tags: [],
      allowed_ips: [],
      key_prefix: 'sk_live_',
    });
    setTagInput('');
    setIpInput('');
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const addIp = () => {
    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipInput.trim() && ipRegex.test(ipInput.trim()) && !formData.allowed_ips?.includes(ipInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        allowed_ips: [...(prev.allowed_ips || []), ipInput.trim()],
      }));
      setIpInput('');
    }
  };

  const removeIp = (ip: string) => {
    setFormData((prev) => ({
      ...prev,
      allowed_ips: prev.allowed_ips?.filter((i) => i !== ip) || [],
    }));
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

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Key Prefix
          </Label>
          <Input
            placeholder="sk_live_"
            value={formData.key_prefix || 'sk_live_'}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, key_prefix: e.target.value }))
            }
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Prefix for the API key (e.g., sk_live_, sk_test_)
          </p>
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Tags (Optional)
          </Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Allowed IPs (Optional)
          </Label>
          <p className="mb-2 text-xs text-muted-foreground">
            Restrict API key usage to specific IP addresses
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="192.168.1.1"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addIp();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addIp}>
              Add
            </Button>
          </div>
          {formData.allowed_ips && formData.allowed_ips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.allowed_ips.map((ip) => (
                <span
                  key={ip}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
                >
                  {ip}
                  <button
                    type="button"
                    onClick={() => removeIp(ip)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isLoading} disabled={isLoading}>
            Generate Key
          </Button>
        </div>
      </form>
    </Modal>
  );
};
