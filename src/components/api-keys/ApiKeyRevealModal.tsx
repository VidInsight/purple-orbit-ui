import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy, Eye, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApiKeyRevealModalProps {
  isOpen: boolean;
  apiKey: string;
  keyName: string;
  onClose: () => void;
}

export const ApiKeyRevealModal = ({
  isOpen,
  apiKey,
  keyName,
  onClose,
}: ApiKeyRevealModalProps) => {
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '') {
      toast({
        title: 'Error',
        description: 'API key is not available. Please check the console for details.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the key manually',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    if (!hasConfirmed) {
      return;
    }
    setHasConfirmed(false);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="API Key Generated"
      size="md"
      closeOnBackdropClick={false}
    >
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Save this key immediately
            </p>
            <p className="text-xs text-muted-foreground">
              For security reasons, you won't be able to view this key again. Make
              sure to copy and store it in a safe place.
            </p>
          </div>
        </div>

        {/* Key Name */}
        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Key Name
          </Label>
          <p className="text-sm text-muted-foreground">{keyName}</p>
        </div>

        {/* API Key Display */}
        <div>
          <Label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Your API Key
          </Label>
          <div className="relative">
            {!apiKey || apiKey === 'undefined' || apiKey.trim() === '' ? (
              <div className="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500 font-medium">
                  API key could not be retrieved. Please check the browser console for details.
                </p>
              </div>
            ) : (
              <>
                <code className="block w-full px-4 py-3 pr-12 rounded-lg bg-muted border border-border text-foreground font-mono text-sm break-all">
                  {apiKey}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-background/50 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy
                    className={`h-4 w-4 ${
                      copied ? 'text-green-500' : 'text-muted-foreground'
                    }`}
                  />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-surface rounded-lg border border-border">
          <Checkbox
            id="confirm-saved"
            checked={hasConfirmed}
            onCheckedChange={(checked) => setHasConfirmed(checked === true)}
          />
          <div className="flex-1">
            <Label
              htmlFor="confirm-saved"
              className="text-sm text-foreground cursor-pointer font-medium"
            >
              I have saved this API key securely
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              You must confirm that you've saved the key before closing this window.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="primary"
            onClick={handleClose}
            disabled={!hasConfirmed}
            className="min-w-[120px]"
          >
            Done
          </Button>
        </div>

        {!hasConfirmed && (
          <p className="text-xs text-center text-muted-foreground">
            Check the box above to close this window
          </p>
        )}
      </div>
    </Modal>
  );
};
