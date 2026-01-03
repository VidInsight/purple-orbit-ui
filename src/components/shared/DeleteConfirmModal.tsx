import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isDeleting = false,
}: DeleteConfirmModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdropClick={!isDeleting}
    >
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Delete {itemType}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-1">
          Are you sure you want to delete:
        </p>
        
        <p className="text-sm font-medium text-foreground mb-4">
          "{itemName}"
        </p>
        
        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Delete {itemType}
        </Button>
      </div>
    </Modal>
  );
};
