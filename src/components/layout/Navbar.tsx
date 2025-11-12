import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import {
  Workflow,
  PlayCircle,
  Key,
  Database,
  Code,
  Folder,
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  LayoutDashboard,
} from 'lucide-react';

interface NavbarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Workflows', path: '/workflows', icon: Workflow },
  { name: 'Executions', path: '/executions', icon: PlayCircle },
  { name: 'Credentials', path: '/credentials', icon: Key },
  { name: 'Databases', path: '/databases', icon: Database },
  { name: 'Variables', path: '/variables', icon: Code },
  { name: 'Files', path: '/files', icon: Folder },
  { name: 'API Keys', path: '/api-keys', icon: Shield },
];

export const Navbar = ({ isCollapsed, onToggle }: NavbarProps) => {
  return (
    <nav
      className={cn(
        'fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-300 ease-in-out flex flex-col z-30',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo & Workspace */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Workflow className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="text-sm font-semibold text-foreground truncate">
                My Workspace
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                activeClassName="bg-accent text-accent-foreground font-medium"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm truncate">{item.name}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                John Doe
              </p>
              <p className="text-xs text-muted-foreground truncate">
                john@example.com
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-surface',
          'flex items-center justify-center hover:bg-accent transition-colors',
          'shadow-md'
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-foreground" />
        )}
      </button>
    </nav>
  );
};
