import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
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
  Users,
  LayoutDashboard,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';

interface NavbarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationSections = {
  workspace: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ],
  workflow: [
    { name: 'Workflows', path: '/workflows', icon: Workflow },
    { name: 'Executions', path: '/executions', icon: PlayCircle },
  ],
  resources: [
    { name: 'Credentials', path: '/credentials', icon: Key },
    { name: 'Databases', path: '/databases', icon: Database },
    { name: 'Variables', path: '/variables', icon: Code },
    { name: 'Files', path: '/files', icon: Folder },
  ],
  management: [
    { name: 'API Keys', path: '/api-keys', icon: Shield },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Billing', path: '/billing', icon: CreditCard },
  ],
};

export const Navbar = ({ isCollapsed, onToggle }: NavbarProps) => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();

  return (
    <nav
      className={cn(
        'fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-300 ease-in-out flex flex-col z-30',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Workspace Info */}
      <div className="p-4 border-b border-border">
        {!isCollapsed ? (
          <div className="space-y-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to workspaces</span>
            </button>
            <div>
              <h2 className="text-sm font-semibold text-foreground truncate">
                {currentWorkspace?.name || 'My Workspace'}
              </h2>
              {currentWorkspace?.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {currentWorkspace.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Back to workspaces"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-6 px-2">
          {/* Workspace Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workspace
                </span>
              </div>
            )}
            <ul className="space-y-1">
              {navigationSections.workspace.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{item.name}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Workflow Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workflow
                </span>
              </div>
            )}
            <ul className="space-y-1">
              {navigationSections.workflow.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{item.name}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resources
                </span>
              </div>
            )}
            <ul className="space-y-1">
              {navigationSections.resources.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{item.name}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Management Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Management
                </span>
              </div>
            )}
            <ul className="space-y-1">
              {navigationSections.management.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{item.name}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
                Sarah Johnson
              </p>
              <p className="text-xs text-muted-foreground truncate">
                sarah@company.com
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
