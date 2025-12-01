import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

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

  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name
      .split(' ')
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
      <div className="flex items-start justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-sm">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate mb-1">{user.name}</h2>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        {/* Action Buttons - More Descriptive */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 px-3 hover:bg-accent/70 hover:scale-105 transition-all"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs font-medium">Dark</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onSettings}
              className="h-8 px-3 hover:bg-accent/70 hover:scale-105 transition-all"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs font-medium">Settings</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="h-8 px-3 text-destructive border border-destructive/30 hover:bg-destructive/10 hover:border-destructive hover:scale-105 transition-all"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs font-medium">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
