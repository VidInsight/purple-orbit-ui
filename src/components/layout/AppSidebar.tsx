import { NavLink } from '@/components/NavLink';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Workflow,
  PlayCircle,
  Key,
  Database,
  Code,
  Folder,
  Shield,
  Users,
  LayoutDashboard,
  CreditCard,
  ArrowLeft,
  Settings,
  Sun,
  Moon,
  Network,
  Package,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationSections = [
  {
    label: 'Workspace',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Workflow',
    items: [
      { name: 'Workflows', path: '/workflows', icon: Workflow },
      { name: 'Executions', path: '/executions', icon: PlayCircle },
    ],
  },
  {
    label: 'Resources',
    items: [
      { name: 'Credentials', path: '/credentials', icon: Key },
      { name: 'Databases', path: '/databases', icon: Database },
      { name: 'Variables', path: '/variables', icon: Code },
      { name: 'Files', path: '/files', icon: Folder },
    ],
  },
  {
    label: 'Nodes',
    items: [
      { name: 'Global Nodes', path: '/global-nodes', icon: Network },
      { name: 'Custom Nodes', path: '/custom-nodes', icon: Package },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'API Keys', path: '/api-keys', icon: Shield },
      { name: 'Users', path: '/users', icon: Users },
      { name: 'Billing', path: '/billing', icon: CreditCard },
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Workspace Info */}
        <div className="p-3 border-b border-border">
          {open ? (
            <div className="space-y-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Workspaces</span>
              </button>
              <h2 className="text-sm font-semibold text-foreground truncate">
                {currentWorkspace?.name || 'My Workspace'}
              </h2>
            </div>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              title="Back to workspaces"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-2">
          {navigationSections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="text-xs">{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.path}
                          className="flex items-center gap-3 hover:bg-accent/70"
                          activeClassName="bg-accent text-accent-foreground font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-border p-2 space-y-2">
          {open && (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">Sarah Johnson</p>
                <p className="text-[10px] text-muted-foreground truncate">sarah@company.com</p>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
