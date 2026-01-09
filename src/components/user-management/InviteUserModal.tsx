import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RoleSelector } from './RoleSelector';
import { InviteUserData } from '@/types/user';
import { Mail } from 'lucide-react';
import { getUserRoles, UserRole } from '@/services/membersApi';
import { toast } from '@/hooks/use-toast';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InviteUserData) => void;
  existingEmails: string[];
}

export const InviteUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingEmails,
}: InviteUserModalProps) => {
  const [emailsInput, setEmailsInput] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // Fetch roles when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          setIsLoadingRoles(true);
          const response = await getUserRoles();
          if (response.status === 'success' && response.data.items) {
            setRoles(response.data.items);
            // Set default role to first role (or Editor if available)
            if (response.data.items.length > 0) {
              const editorRole = response.data.items.find(r => r.name.toLowerCase() === 'editor');
              setSelectedRoleId(editorRole?.id || response.data.items[0].id);
            }
          }
        } catch (error) {
          console.error('Error fetching roles:', error);
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to load roles',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingRoles(false);
        }
      };

      fetchRoles();
    }
  }, [isOpen]);

  const validateEmails = (input: string): string[] => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = input
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const invalidEmails = emails.filter((e) => !emailRegex.test(e));
    const duplicateEmails = emails.filter((e) => existingEmails.includes(e));

    if (invalidEmails.length > 0) {
      setErrors({ emails: `Invalid email(s): ${invalidEmails.join(', ')}` });
      return [];
    }

    if (duplicateEmails.length > 0) {
      setErrors({ emails: `Already invited: ${duplicateEmails.join(', ')}` });
      return [];
    }

    return emails;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!emailsInput.trim()) {
      setErrors({ emails: 'Enter at least one email address' });
      return;
    }

    const emails = validateEmails(emailsInput);
    if (emails.length === 0) return;

    if (!selectedRoleId) {
      setErrors({ role: 'Please select a role' });
      return;
    }

    onSubmit({ emails, roleId: selectedRoleId, message });
    handleClose();
  };

  const handleClose = () => {
    setEmailsInput('');
    setSelectedRoleId('');
    setMessage('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Users"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Email Addresses
          </Label>
          <Input
            placeholder="user@example.com, another@example.com"
            value={emailsInput}
            onChange={(e) => {
              setEmailsInput(e.target.value);
              setErrors((prev) => ({ ...prev, emails: '' }));
            }}
            error={errors.emails}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Separate multiple emails with commas
          </p>
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Role
          </Label>
          {isLoadingRoles ? (
            <div className="text-sm text-muted-foreground">Loading roles...</div>
          ) : (
            <RoleSelector 
              roles={roles} 
              value={selectedRoleId} 
              onChange={setSelectedRoleId}
              error={errors.role}
            />
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-2">
            Custom Message (Optional)
          </Label>
          <Textarea
            placeholder="Add a personal message to the invitation..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-surface border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Invitations will be sent via email and expire after 7 days
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Send Invitation{emailsInput.split(',').filter(e => e.trim()).length > 1 ? 's' : ''}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
