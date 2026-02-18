import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';

/** Persist sidebar scroll across route changes (Navbar remounts on each page) */
let sidebarScrollTop = 0;
import {
  Workflow,
  PlayCircle,
  Bot,
  Key,
  Database,
  Code,
  Folder,
  Server,
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
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, iconColor: 'text-primary', borderColor: 'border-primary', dotColor: 'bg-primary' },
  ],
  workflow: [
    { name: 'Agents ', path: '/agents-workflow', icon: Bot, iconColor: 'text-green-400', borderColor: 'border-green-400', dotColor: 'bg-green-400' },
    { name: 'Workflows', path: '/workflows', icon: Workflow, iconColor: 'text-blue-400', borderColor: 'border-blue-400', dotColor: 'bg-blue-400' },
    { name: 'Executions', path: '/executions', icon: PlayCircle, iconColor: 'text-cyan-400', borderColor: 'border-cyan-400', dotColor: 'bg-cyan-400' },
  ],
  resources: [
    { name: 'Credentials', path: '/credentials', icon: Key, iconColor: 'text-emerald-400', borderColor: 'border-emerald-400', dotColor: 'bg-emerald-400' },
    { name: 'Variables', path: '/variables', icon: Code, iconColor: 'text-indigo-400', borderColor: 'border-indigo-400', dotColor: 'bg-indigo-400' },
    { name: 'Databases', path: '/databases', icon: Database, iconColor: 'text-teal-400', borderColor: 'border-teal-400', dotColor: 'bg-teal-400' },
    { name: 'MCP Server', path: '/mcp-server', icon: Server, iconColor: 'text-sky-400', borderColor: 'border-sky-400', dotColor: 'bg-sky-400' },
    { name: 'Files', path: '/files', icon: Folder, iconColor: 'text-violet-400', borderColor: 'border-violet-400', dotColor: 'bg-violet-400' },
  ],
  nodes: [
    { name: 'Global Nodes', path: '/global-nodes', icon: Network, iconColor: 'text-orange-400', borderColor: 'border-orange-400', dotColor: 'bg-orange-400' },
    { name: 'Custom Nodes', path: '/custom-nodes', icon: Package, iconColor: 'text-amber-400', borderColor: 'border-amber-400', dotColor: 'bg-amber-400' },
  ],
  management: [
    { name: 'API Keys', path: '/api-keys', icon: Shield, iconColor: 'text-pink-400', borderColor: 'border-pink-400', dotColor: 'bg-pink-400' },
    { name: 'Users', path: '/users', icon: Users, iconColor: 'text-purple-400', borderColor: 'border-purple-400', dotColor: 'bg-purple-400' },
    { name: 'Billing', path: '/billing', icon: CreditCard, iconColor: 'text-rose-400', borderColor: 'border-rose-400', dotColor: 'bg-rose-400' },
    { name: 'Settings', path: '/workspace/settings', icon: Settings, iconColor: 'text-slate-400', borderColor: 'border-slate-400', dotColor: 'bg-slate-400' },
  ],
};

export const Navbar = ({ isCollapsed, onToggle }: NavbarProps) => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useUser();
  const navScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = navScrollRef.current;
    if (el && sidebarScrollTop > 0) {
      el.scrollTop = sidebarScrollTop;
    }
  }, []);

  const saveSidebarScroll = () => {
    if (navScrollRef.current) sidebarScrollTop = navScrollRef.current.scrollTop;
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className={cn(
        'fixed left-0 top-0 h-screen max-h-screen max-w-[100vw] bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#05010d] dark:via-[#060015] dark:to-[#020008] backdrop-blur-xl border-r border-primary/30 flex flex-col z-30 transition-all duration-300 ease-in-out shadow-2xl shadow-primary/20 overflow-x-hidden',
        isCollapsed ? 'w-16 sm:w-20' : 'w-64 sm:w-72'
      )}
    >
      {/* Workspace Info */}
      <div className="p-3 sm:p-5 border-b border-border/50 bg-gradient-to-r from-primary/8 via-primary/3 to-transparent transition-all duration-200 relative z-10 min-w-0 shrink-0">
        {!isCollapsed ? (
          <div className="space-y-3 min-w-0">
            <button
              onClick={() => navigate('/workspaces')}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-all duration-200 group px-2 py-1.5 rounded-lg hover:bg-primary/10"
            >
              <ArrowLeft className="h-3.5 w-3.5 flex-shrink-0 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to workspaces</span>
            </button>
            <div className="px-2 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-foreground truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {currentWorkspace?.name || 'My Workspace'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">                {currentUser?.email || 'No email'}
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:scale-110 transition-all duration-200 rounded-lg mx-auto"
            title="Back to workspaces"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div
        ref={navScrollRef}
        className="flex-1 min-h-0 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar"
        onScroll={saveSidebarScroll}
      >
        <div className="space-y-3 px-2 sm:px-3 min-w-0">
          {/* Workspace Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.15em]">
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
                      'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 font-medium group relative',
                      'text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-foreground',
                      'hover:translate-x-1 hover:shadow-lg hover:shadow-primary/10',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
                    )}
                    activeClassName={cn('font-semibold', item.iconColor, '[&_.nav-item-dot]:opacity-100 [&_.nav-item-dot>div]:ring-2 [&_.nav-item-dot>div]:ring-primary/40 [&_.nav-item-dot>div]:scale-125 [&_.nav-item-dot>div]:shadow-[0_0_6px_currentColor] [&_.nav-item-dot>div]:transition-all [&_.nav-item-dot>div]:duration-300')}
                  >
                    <item.icon className={cn('h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:brightness-110', item.iconColor, 'group-hover:drop-shadow-[0_0_8px_currentColor] opacity-70 group-hover:opacity-100')} />
                    {!isCollapsed && (
                      <span className="text-sm truncate font-medium">{item.name}</span>
                    )}
                    {!isCollapsed && (
                      <div className="nav-item-dot absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={cn('h-1.5 w-1.5 rounded-full', item.dotColor)} />
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Section Separator */}
          <div className="my-2 mx-3 border-t border-border/30" />

          {/* Workflow Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.15em]">
                  Automation
                </span>
              </div>
            )}
            <ul className="space-y-0.5">
              {navigationSections.workflow.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 font-medium group relative',
                      'text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-foreground',
                      'hover:translate-x-1 hover:shadow-lg hover:shadow-primary/10',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
                    )}
                    activeClassName={cn('font-semibold', item.iconColor, '[&_.nav-item-dot]:opacity-100 [&_.nav-item-dot>div]:ring-2 [&_.nav-item-dot>div]:ring-primary/40 [&_.nav-item-dot>div]:scale-125 [&_.nav-item-dot>div]:shadow-[0_0_6px_currentColor] [&_.nav-item-dot>div]:transition-all [&_.nav-item-dot>div]:duration-300')}
                  >
                    <item.icon className={cn('h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:brightness-110', item.iconColor, 'group-hover:drop-shadow-[0_0_8px_currentColor] opacity-70 group-hover:opacity-100')} />
                    {!isCollapsed && (
                      <span className="text-sm truncate font-medium">{item.name}</span>
                    )}
                    {!isCollapsed && (
                      <div className="nav-item-dot absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={cn('h-1.5 w-1.5 rounded-full', item.dotColor)} />
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Section Separator */}
          <div className="my-2 mx-3 border-t border-border/30" />

          {/* Resources Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <span className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.15em]">
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
                      'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 font-medium group relative',
                      'text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-foreground',
                      'hover:translate-x-1 hover:shadow-lg hover:shadow-primary/10',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
                    )}
                    activeClassName={cn('font-semibold', item.iconColor, '[&_.nav-item-dot]:opacity-100 [&_.nav-item-dot>div]:ring-2 [&_.nav-item-dot>div]:ring-primary/40 [&_.nav-item-dot>div]:scale-125 [&_.nav-item-dot>div]:shadow-[0_0_6px_currentColor] [&_.nav-item-dot>div]:transition-all [&_.nav-item-dot>div]:duration-300')}
                  >
                    <item.icon className={cn('h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:brightness-110', item.iconColor, 'group-hover:drop-shadow-[0_0_8px_currentColor] opacity-70 group-hover:opacity-100')} />
                    {!isCollapsed && (
                      <span className="text-sm truncate font-medium">{item.name}</span>
                    )}
                    {!isCollapsed && (
                      <div className="nav-item-dot absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={cn('h-1.5 w-1.5 rounded-full', item.dotColor)} />
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Section Separator */}
          <div className="my-2 mx-3 border-t border-border/30" />

          {/* Nodes Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <span className="text-[10px] font-bold text-orange-400/60 uppercase tracking-[0.15em]">
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
                      'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 font-medium group relative',
                      'text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-foreground',
                      'hover:translate-x-1 hover:shadow-lg hover:shadow-primary/10',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
                    )}
                    activeClassName={cn('font-semibold', item.iconColor, '[&_.nav-item-dot]:opacity-100 [&_.nav-item-dot>div]:ring-2 [&_.nav-item-dot>div]:ring-primary/40 [&_.nav-item-dot>div]:scale-125 [&_.nav-item-dot>div]:shadow-[0_0_6px_currentColor] [&_.nav-item-dot>div]:transition-all [&_.nav-item-dot>div]:duration-300')}
                  >
                    <item.icon className={cn('h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:brightness-110', item.iconColor, 'group-hover:drop-shadow-[0_0_8px_currentColor] opacity-70 group-hover:opacity-100')} />
                    {!isCollapsed && (
                      <span className="text-sm truncate font-medium">{item.name}</span>
                    )}
                    {!isCollapsed && (
                      <div className="nav-item-dot absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={cn('h-1.5 w-1.5 rounded-full', item.dotColor)} />
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Section Separator */}
          <div className="my-2 mx-3 border-t border-border/30" />

          {/* Management Section */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <span className="text-[10px] font-bold text-pink-400/60 uppercase tracking-[0.15em]">
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
                      'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 font-medium group relative',
                      'text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-foreground',
                      'hover:translate-x-1 hover:shadow-lg hover:shadow-primary/10',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
                    )}
                    activeClassName={cn('font-semibold', item.iconColor, '[&_.nav-item-dot]:opacity-100 [&_.nav-item-dot>div]:ring-2 [&_.nav-item-dot>div]:ring-primary/40 [&_.nav-item-dot>div]:scale-125 [&_.nav-item-dot>div]:shadow-[0_0_6px_currentColor] [&_.nav-item-dot>div]:transition-all [&_.nav-item-dot>div]:duration-300')}
                  >
                    <item.icon className={cn('h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:brightness-110', item.iconColor, 'group-hover:drop-shadow-[0_0_8px_currentColor] opacity-70 group-hover:opacity-100')} />
                    {!isCollapsed && (
                      <span className="text-sm truncate font-medium">{item.name}</span>
                    )}
                    {!isCollapsed && (
                      <div className="nav-item-dot absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={cn('h-1.5 w-1.5 rounded-full', item.dotColor)} />
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section - User Info with Actions */}
      <div className="px-1 py-2 border-t border-primary/30 bg-gradient-to-t from-white via-slate-50 to-transparent dark:from-[#05010d]/90 dark:via-[#060015]/80 dark:to-transparent shrink-0 min-w-0 transition-colors duration-300">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={() => {/* Add help handler */}}
                className="flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md"
                title="Help"
              >
                <HelpCircle className="h-4.5 w-4.5" />
              </button>
              
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4.5 w-4.5" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )}
              </button>
              
              <button
                className="flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md"
                title="User Preferences"
                onClick={() => navigate('/workspace/settings')}
              >
                <Settings className="h-4.5 w-4.5" />
              </button>
            </div>
          </>
        )}
        
        
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 h-8 w-8 rounded-full border-2 border-border/80 bg-surface backdrop-blur-md',
          'flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground',
          'hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/40',
          'group z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
          'hover:rotate-3'
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4.5 w-4.5 text-foreground group-hover:text-primary-foreground transition-colors" />
        ) : (
          <ChevronLeft className="h-4.5 w-4.5 text-foreground group-hover:text-primary-foreground transition-colors" />
        )}
      </button>
    </nav>
  );
};
