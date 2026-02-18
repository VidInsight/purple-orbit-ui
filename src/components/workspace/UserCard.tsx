import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/user';

interface UserCardProps {
  onSettings?: () => void;
  onLogout?: () => void;
}

export const UserCard = ({ onSettings, onLogout }: UserCardProps) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useUser();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Eğer kullanıcı yüklenmediyse veya yoksa, placeholder göster
  if (!currentUser) {
    return (
      <div className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/40 transition-all">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/10 animate-pulse" />
          <div className="flex-1">
            <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 border border-white/12 bg-white/8 backdrop-blur-2xl shadow-xl shadow-black/40 transition-all hover:border-primary/60 hover:bg-white/12 hover:shadow-primary/30 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-sm">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate mb-1">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground truncate mb-2">{currentUser.email}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_COLORS[currentUser.role]}`}>
                {ROLE_LABELS[currentUser.role]}
              </span>
             </div>
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
