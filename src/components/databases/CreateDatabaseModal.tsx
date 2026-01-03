import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { createDatabase, CreateDatabaseRequest } from '@/services/databasesApi';
import { toast } from '@/hooks/use-toast';

interface CreateDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

const DATABASE_TYPES = [
  { value: 'POSTGRESQL', label: 'PostgreSQL' },
  { value: 'MYSQL', label: 'MySQL' },
  { value: 'MONGODB', label: 'MongoDB' },
  { value: 'REDIS', label: 'Redis' },
  { value: 'SQLITE', label: 'SQLite' },
  { value: 'MSSQL', label: 'Microsoft SQL Server' },
  { value: 'ORACLE', label: 'Oracle' },
];

export const CreateDatabaseModal = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: CreateDatabaseModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CreateDatabaseRequest>({
    name: '',
    database_type: 'POSTGRESQL',
    host: '',
    port: 5432,
    database_name: '',
    username: '',
    password: '',
    connection_string: null,
    ssl_enabled: false,
    additional_params: {},
    description: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [additionalParamsInput, setAdditionalParamsInput] = useState('{}');
  const [useConnectionString, setUseConnectionString] = useState(false);

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

    if (!formData.database_type) {
      toast({
        title: 'Validation Error',
        description: 'Database type is required',
        variant: 'destructive',
      });
      return;
    }

    if (useConnectionString) {
      if (!formData.connection_string?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Connection string is required when using connection string',
          variant: 'destructive',
        });
        return;
      }
    } else {
      if (!formData.host.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Host is required',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.port || formData.port <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Valid port is required',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.database_name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Database name is required',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.username.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Username is required',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.password.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Password is required',
          variant: 'destructive',
        });
        return;
      }
    }

    // Parse additional_params if provided
    let additionalParams = {};
    if (additionalParamsInput.trim()) {
      try {
        additionalParams = JSON.parse(additionalParamsInput);
      } catch (error) {
        toast({
          title: 'Validation Error',
          description: 'Additional params must be valid JSON',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload: CreateDatabaseRequest = {
        name: formData.name.trim(),
        database_type: formData.database_type,
        host: useConnectionString ? '' : formData.host.trim(),
        port: useConnectionString ? 0 : formData.port,
        database_name: useConnectionString ? '' : formData.database_name.trim(),
        username: useConnectionString ? '' : formData.username.trim(),
        password: useConnectionString ? '' : formData.password.trim(),
        connection_string: useConnectionString ? formData.connection_string?.trim() || null : null,
        ssl_enabled: formData.ssl_enabled,
        additional_params: Object.keys(additionalParams).length > 0 ? additionalParams : undefined,
        description: formData.description?.trim() || undefined,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      };

      await createDatabase(workspaceId, payload);
      
      toast({
        title: 'Success',
        description: 'Database connection created successfully',
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating database:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create database connection',
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
        database_type: 'POSTGRESQL',
        host: '',
        port: 5432,
        database_name: '',
        username: '',
        password: '',
        connection_string: null,
        ssl_enabled: false,
        additional_params: {},
        description: '',
        tags: [],
      });
      setTagInput('');
      setAdditionalParamsInput('{}');
      setUseConnectionString(false);
      onClose();
    }
  };

  const isFormValid = () => {
    if (!formData.name.trim() || !formData.database_type) {
      return false;
    }
    if (useConnectionString) {
      return !!formData.connection_string?.trim();
    }
    return !!(
      formData.host.trim() &&
      formData.port > 0 &&
      formData.database_name.trim() &&
      formData.username.trim() &&
      formData.password.trim()
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Database Connection"
      size="lg"
      closeOnBackdropClick={!isSaving}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="block text-sm font-medium text-foreground">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Production PostgreSQL"
            disabled={isSaving}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="database_type" className="block text-sm font-medium text-foreground">
            Database Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.database_type}
            onValueChange={(value) => setFormData({ ...formData, database_type: value })}
            disabled={isSaving}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select database type" />
            </SelectTrigger>
            <SelectContent>
              {DATABASE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start sm:items-center space-x-2 py-2">
          <Checkbox
            id="use_connection_string"
            checked={useConnectionString}
            onCheckedChange={(checked) => setUseConnectionString(checked as boolean)}
            disabled={isSaving}
            className="mt-1 sm:mt-0"
          />
          <Label
            htmlFor="use_connection_string"
            className="text-sm font-medium leading-tight sm:leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Use connection string instead of individual fields
          </Label>
        </div>

        {useConnectionString ? (
          <div className="space-y-2">
            <Label htmlFor="connection_string" className="block text-sm font-medium text-foreground">
              Connection String <span className="text-destructive">*</span>
            </Label>
            <Input
              id="connection_string"
              type="text"
              value={formData.connection_string || ''}
              onChange={(e) => setFormData({ ...formData, connection_string: e.target.value })}
              placeholder="postgresql://user:password@host:port/database"
              disabled={isSaving}
              required
              className="w-full font-mono text-sm"
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="host" className="block text-sm font-medium text-foreground">
                Host <span className="text-destructive">*</span>
              </Label>
              <Input
                id="host"
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="db.example.com"
                disabled={isSaving}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port" className="block text-sm font-medium text-foreground">
                Port <span className="text-destructive">*</span>
              </Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
                placeholder="5432"
                disabled={isSaving}
                required
                min="1"
                max="65535"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="database_name" className="block text-sm font-medium text-foreground">
                Database Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="database_name"
                type="text"
                value={formData.database_name}
                onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
                placeholder="mydb"
                disabled={isSaving}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="block text-sm font-medium text-foreground">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="dbuser"
                disabled={isSaving}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="dbpassword"
                disabled={isSaving}
                required
                className="w-full"
              />
            </div>
          </>
        )}

        <div className="flex items-start sm:items-center space-x-2 py-2">
          <Checkbox
            id="ssl_enabled"
            checked={formData.ssl_enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, ssl_enabled: checked as boolean })}
            disabled={isSaving}
            className="mt-1 sm:mt-0"
          />
          <Label
            htmlFor="ssl_enabled"
            className="text-sm font-medium leading-tight sm:leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Enable SSL
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="block text-sm font-medium text-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Production database connection"
            disabled={isSaving}
            rows={3}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_params" className="block text-sm font-medium text-foreground">
            Additional Parameters (JSON)
          </Label>
          <Textarea
            id="additional_params"
            value={additionalParamsInput}
            onChange={(e) => setAdditionalParamsInput(e.target.value)}
            placeholder='{"pool_size": 10}'
            disabled={isSaving}
            rows={3}
            className="w-full font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter additional connection parameters as JSON (e.g., {"{"}"pool_size": 10{"}"})
          </p>
        </div>

        <div className="space-y-2">
          <Label className="block text-sm font-medium text-foreground">
            Tags
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
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
              className="w-full sm:w-auto"
            >
              Add
            </Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
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

        {/* Form Actions - Sticky at bottom */}
        <div className="sticky bottom-0 bg-surface pt-4 pb-2 mt-6 border-t border-border -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSaving || !isFormValid()}
              loading={isSaving}
              className="w-full sm:w-auto"
            >
              Create Database
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

