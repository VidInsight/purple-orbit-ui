import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Badge } from '@/components/ui/badge';

interface UserCardProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  onSettings?: () => void;
  onLogout?: () => void;
}

export const UserCard = ({ user, onSettings, onLogout }: UserCardProps) => {
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-md transition-all hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                {user.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Welcome back! Select a workspace to continue.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="h-9 w-9 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            title="Settings"
            className="h-9 w-9 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            title="Logout"
            className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
