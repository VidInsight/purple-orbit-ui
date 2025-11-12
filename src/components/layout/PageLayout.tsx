import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b border-border px-4 bg-surface/50">
            <SidebarTrigger />
          </header>
          
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
