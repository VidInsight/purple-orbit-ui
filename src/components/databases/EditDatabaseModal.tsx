import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { getDatabaseDetail, updateDatabase, UpdateDatabaseRequest, DatabaseDetail } from '@/services/databasesApi';
import { toast } from '@/hooks/use-toast';

interface EditDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  databaseId: string;
  onSuccess: () => void;
}

export const EditDatabaseModal = ({
  isOpen,
  onClose,
  workspaceId,
  databaseId,
  onSuccess,
}: EditDatabaseModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [databaseDetail, setDatabaseDetail] = useState<DatabaseDetail | null>(null);
  const [formData, setFormData] = useState<UpdateDatabaseRequest>({
    name: '',
    host: '',
    port: 5432,
    database_name: '',
    username: '',
    password: '',
    ssl_enabled: false,
    description: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen && databaseId) {
      loadDatabaseDetail();
    }
  }, [isOpen, databaseId]);

  const loadDatabaseDetail = async () => {
    try {
      setIsLoading(true);
      const response = await getDatabaseDetail(workspaceId, databaseId);
      const detail = response.data;
      setDatabaseDetail(detail);
      setFormData({
        name: detail.name || '',
        host: detail.host || '',
        port: detail.port || 5432,
        database_name: detail.database_name || '',
        username: detail.username || '',
        password: '', // Password genellikle API'den dönmez, boş bırak
        ssl_enabled: detail.ssl_enabled || false,
        description: detail.description || '',
        tags: detail.tags || [],
      });
    } catch (error) {
      console.error('Error loading database detail:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load database details',
        variant: 'destructive',
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

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

    try {
      setIsSaving(true);
      const payload: UpdateDatabaseRequest = {
        name: formData.name.trim(),
        host: formData.host.trim(),
        port: formData.port,
        database_name: formData.database_name.trim(),
        username: formData.username.trim(),
        password: formData.password.trim(),
        ssl_enabled: formData.ssl_enabled,
        description: formData.description?.trim() || undefined,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      };

      await updateDatabase(workspaceId, databaseId, payload);
      
      toast({
        title: 'Success',
        description: 'Database connection updated successfully',
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating database:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update database connection',
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
        host: '',
        port: 5432,
        database_name: '',
        username: '',
        password: '',
        ssl_enabled: false,
        description: '',
        tags: [],
      });
      setTagInput('');
      setDatabaseDetail(null);
      onClose();
    }
  };

  const isFormValid = () => {
    return !!(
      formData.name.trim() &&
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
      title="Edit Database Connection"
      size="lg"
      closeOnBackdropClick={!isSaving}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
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
              placeholder="Enter new password or keep existing"
              disabled={isSaving}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter a new password to update, or leave as is to keep the existing password
            </p>
          </div>

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
                Update Database
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

