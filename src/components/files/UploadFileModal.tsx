import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Upload, File } from 'lucide-react';
import { uploadFile, UploadFileRequest } from '@/services/filesApi';
import { toast } from '@/hooks/use-toast';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

// Maximum file size: 50MB (in bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const UploadFileModal = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}: UploadFileModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    tags: string[];
    file: File | null;
  }>({
    name: '',
    description: '',
    tags: [],
    file: null,
  });
  const [tagInput, setTagInput] = useState('');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File Too Large',
          description: `File size exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}. Please select a smaller file.`,
          variant: 'destructive',
        });
        // Reset file input
        e.target.value = '';
        return;
      }

      setFormData({
        ...formData,
        file,
        // Auto-fill name from file name if name is empty
        name: formData.name || file.name,
      });
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

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.file) {
      toast({
        title: 'Validation Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    // Double-check file size before upload
    if (formData.file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File Too Large',
        description: `File size exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}. Please select a smaller file.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      const payload: UploadFileRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        file: formData.file,
      };

      await uploadFile(workspaceId, payload);
      
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFormData({
        name: '',
        description: '',
        tags: [],
        file: null,
      });
      setTagInput('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload File"
      size="md"
      closeOnBackdropClick={!isUploading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Input */}
        <div>
          <Label htmlFor="file" className="block text-sm font-medium text-foreground mb-2">
            File <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Any file type (Max {formatFileSize(MAX_FILE_SIZE)})
                </p>
              </div>
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
          {formData.file && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-accent/50 rounded-lg border border-border">
              <File className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{formData.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(formData.file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, file: null })}
                disabled={isUploading}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Name Input */}
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
            disabled={isUploading}
            required
            className="w-full"
          />
        </div>

        {/* Description Input */}
        <div>
          <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="File description"
            disabled={isUploading}
            rows={3}
            className="w-full"
          />
        </div>

        {/* Tags Input */}
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
              disabled={isUploading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTag}
              disabled={isUploading || !tagInput.trim()}
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
                    disabled={isUploading}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isUploading || !formData.name.trim() || !formData.file}
            loading={isUploading}
          >
            Upload File
          </Button>
        </div>
      </form>
    </Modal>
  );
};

