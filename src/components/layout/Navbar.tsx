import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTheme } from '@/context/ThemeContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
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
  HelpCircle,
  Settings,
  Sun,
  Moon,
  Network,
  Package,
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
  nodes: [
    { name: 'Global Nodes', path: '/global-nodes', icon: Network },
    { name: 'Custom Nodes', path: '/custom-nodes', icon: Package },
  ],
  management: [
    { name: 'API Keys', path: '/api-keys', icon: Shield },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ],
};

export const Navbar = ({ isCollapsed, onToggle }: NavbarProps) => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className={cn(
        'fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col z-30 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Workspace Info */}
      <div className="p-4 border-b border-border transition-all duration-200">
        {!isCollapsed ? (
          <div className="space-y-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-all duration-200 group"
            >
              <ArrowLeft className="h-3 w-3 flex-shrink-0 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to workspaces</span>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-foreground truncate">
                {currentWorkspace?.name || 'My Workspace'}
              </h2>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200"
            title="Back to workspaces"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-2 overflow-y-auto">
        <div className="space-y-2 px-2">
          {/* Workspace Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workspace
                </span>
              </div>
            )}
            <ul className="space-y-0.5">
              {navigationSections.workspace.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-1 rounded-lg transition-all duration-200',
                      'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground hover:translate-x-1'
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium shadow-sm"
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
              <div className="px-3 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workflow
                </span>
              </div>
            )}
            <ul className="space-y-0.5">
              {navigationSections.workflow.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-1 rounded-lg transition-all duration-200',
                      'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground hover:translate-x-1'
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium shadow-sm"
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
              <div className="px-3 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resources
                </span>
              </div>
            )}
            <ul className="space-y-0.5">
              {navigationSections.resources.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-1 rounded-lg transition-all duration-200',
                      'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground hover:translate-x-1'
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium shadow-sm"
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

          {/* Nodes Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nodes
                </span>
              </div>
            )}
            <ul className="space-y-0.5">
              {navigationSections.nodes.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-1 rounded-lg transition-all duration-200',
                      'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground hover:translate-x-1'
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium shadow-sm"
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
              <div className="px-3 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Management
                </span>
              </div>
            )}
            <ul className="space-y-0.5">
              {navigationSections.management.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-1 rounded-lg transition-all duration-200',
                      'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground hover:translate-x-1'
                    )}
                    activeClassName="bg-accent text-accent-foreground font-medium shadow-sm"
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

      {/* Bottom Section - User Info with Actions */}
      <div className="px-2 py-2">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <button
                onClick={() => {/* Add help handler */}}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground hover:scale-110 transition-all duration-200"
                title="Help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
              
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground hover:scale-110 transition-all duration-200"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              
              <LanguageSwitcher />
              
              <button
                onClick={() => {/* Add user preferences handler */}}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground hover:scale-110 transition-all duration-200"
                title="User Preferences"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
            
            <div className="border-t border-border my-1.5" />
          </>
        )}
        
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer group">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 group-hover:shadow-glow-primary transition-all duration-200">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Sarah Johnson
              </p>
              <p className="text-xs text-foreground/70 truncate">
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
          'flex items-center justify-center hover:bg-accent hover:scale-110 transition-all duration-200',
          'shadow-md hover:shadow-glow-primary'
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
