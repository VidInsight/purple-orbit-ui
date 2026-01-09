export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  lastActive: string;
  createdAt: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  sentAt: string;
  expiresAt: string;
}

export interface InviteUserData {
  emails: string[];
  roleId: string;
  message?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full access, manage users and settings',
  editor: 'Create and edit workflows, credentials, databases',
  viewer: 'View only, no edit permissions',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  editor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  viewer: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};
