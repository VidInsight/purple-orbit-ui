import { useState } from 'react';
import { User, UserRole, ROLE_COLORS, ROLE_LABELS } from '@/types/user';
import { RoleSelector } from './RoleSelector';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ActiveUsersTabProps {
  users: User[];
  currentUserId: string;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onRemoveUser: (userId: string) => Promise<void>;
}

export const ActiveUsersTab = ({
  users,
  currentUserId,
  onRoleChange,
  onRemoveUser,
}: ActiveUsersTabProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = users.find((u) => u.id === currentUserId);
  const isCurrentUserAdmin = currentUser?.role === 'admin';

  const handleRemoveClick = (user: User) => {
    if (user.id === currentUserId) {
      toast({
        title: 'Cannot remove yourself',
        description: 'You cannot remove your own account',
        variant: 'destructive',
      });
      return;
    }

    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await onRemoveUser(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastActive = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <div className="space-y-1">
        {users.map((user) => (
          <div
            key={user.id}
            className="group flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  {user.id === currentUserId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      YOU
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="hidden sm:block text-xs text-muted-foreground min-w-[80px]">
                {formatLastActive(user.lastActive)}
              </div>
              
              <div className="min-w-[100px]">
                {isCurrentUserAdmin && user.id !== currentUserId ? (
                  <RoleSelector
                    value={user.role}
                    onChange={(newRole) => onRoleChange(user.id, newRole)}
                  />
                ) : (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                      ROLE_COLORS[user.role]
                    }`}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                )}
              </div>

              <div className="w-7">
                {isCurrentUserAdmin && user.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClick(user)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setUserToDelete(null);
          }
        }}
        onConfirm={handleRemoveConfirm}
        itemName={userToDelete?.name || ''}
        itemType="user"
        isDeleting={isDeleting}
      />
    </>
  );
};
