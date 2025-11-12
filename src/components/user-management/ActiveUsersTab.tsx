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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                User
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Role
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Last Active
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border hover:bg-surface/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">
                        {user.name}
                        {user.id === currentUserId && (
                          <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {user.email}
                </td>
                <td className="py-4 px-4">
                  {isCurrentUserAdmin && user.id !== currentUserId ? (
                    <RoleSelector
                      value={user.role}
                      onChange={(newRole) => onRoleChange(user.id, newRole)}
                    />
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        ROLE_COLORS[user.role]
                      }`}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {formatLastActive(user.lastActive)}
                </td>
                <td className="py-4 px-4 text-right">
                  {isCurrentUserAdmin && user.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveClick(user)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found</p>
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
