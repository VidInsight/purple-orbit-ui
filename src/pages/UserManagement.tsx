import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveUsersTab } from '@/components/user-management/ActiveUsersTab';
import { PendingInvitationsTab } from '@/components/user-management/PendingInvitationsTab';
import { InviteUserModal } from '@/components/user-management/InviteUserModal';
import { User, PendingInvitation, UserRole, InviteUserData } from '@/types/user';
import { UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock current user ID
const CURRENT_USER_ID = 'user-1';

// Mock data
const generateMockUsers = (): User[] => [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    avatar: undefined,
    role: 'admin',
    lastActive: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    email: 'michael@company.com',
    avatar: undefined,
    role: 'editor',
    lastActive: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'user-3',
    name: 'Emily Rodriguez',
    email: 'emily@company.com',
    avatar: undefined,
    role: 'editor',
    lastActive: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'user-4',
    name: 'David Kim',
    email: 'david@company.com',
    avatar: undefined,
    role: 'viewer',
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString(),
  },
];

const generateMockInvitations = (): PendingInvitation[] => [
  {
    id: 'inv-1',
    email: 'john@newcompany.com',
    role: 'editor',
    invitedBy: 'Sarah Johnson',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(), // 2 days ago
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60000).toISOString(), // 5 days from now
  },
  {
    id: 'inv-2',
    email: 'alice@partner.com',
    role: 'viewer',
    invitedBy: 'Sarah Johnson',
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(), // 5 days ago
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60000).toISOString(), // 2 days from now
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(generateMockUsers());
  const [invitations, setInvitations] = useState<PendingInvitation[]>(
    generateMockInvitations()
  );
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const currentUser = users.find((u) => u.id === CURRENT_USER_ID);
  const isAdmin = currentUser?.role === 'admin';

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
    );

    toast({
      title: 'Role Updated',
      description: 'User role has been changed successfully.',
    });
  };

  const handleRemoveUser = async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const user = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    toast({
      title: 'User Removed',
      description: `${user?.name} has been removed from the workspace.`,
    });
  };

  const handleInviteSubmit = (data: InviteUserData) => {
    const newInvitations: PendingInvitation[] = data.emails.map((email) => ({
      id: `inv-${Date.now()}-${Math.random()}`,
      email,
      role: data.role,
      invitedBy: currentUser?.name || 'Unknown',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60000).toISOString(), // 7 days
    }));

    setInvitations((prev) => [...newInvitations, ...prev]);
    setActiveTab('invitations');

    toast({
      title: 'Invitation Sent',
      description: `Sent ${data.emails.length} invitation${
        data.emails.length > 1 ? 's' : ''
      } successfully.`,
    });
  };

  const handleResendInvitation = (invitationId: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? {
              ...inv,
              sentAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60000).toISOString(),
            }
          : inv
      )
    );

    toast({
      title: 'Invitation Resent',
      description: 'The invitation has been sent again.',
    });
  };

  const handleCancelInvitation = async (invitationId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const invitation = invitations.find((inv) => inv.id === invitationId);
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

    toast({
      title: 'Invitation Cancelled',
      description: `Invitation to ${invitation?.email} has been cancelled.`,
    });
  };

  const existingEmails = [
    ...users.map((u) => u.email),
    ...invitations.map((inv) => inv.email),
  ];

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="User Management"
          description="Manage workspace members and permissions"
          actions={
            isAdmin ? (
              <Button variant="primary" onClick={() => setInviteModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Users
              </Button>
            ) : undefined
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6 animate-fade-in">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
            <TabsTrigger value="users" className="text-sm">
              Active Users <span className="ml-1.5 text-xs text-muted-foreground">({users.length})</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="text-sm">
              Pending <span className="ml-1.5 text-xs text-muted-foreground">({invitations.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <ActiveUsersTab
                users={users}
                currentUserId={CURRENT_USER_ID}
                onRoleChange={handleRoleChange}
                onRemoveUser={handleRemoveUser}
              />
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="mt-4">
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <PendingInvitationsTab
                invitations={invitations}
                onResend={handleResendInvitation}
                onCancel={handleCancelInvitation}
              />
            </div>
          </TabsContent>
        </Tabs>

        {isAdmin && (
          <InviteUserModal
            isOpen={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            onSubmit={handleInviteSubmit}
            existingEmails={existingEmails}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default UserManagement;
