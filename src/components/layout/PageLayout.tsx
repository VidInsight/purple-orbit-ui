import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { useNavbar } from '@/hooks/useNavbar';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const { isCollapsed, toggleCollapsed } = useNavbar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <Navbar isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
      
      <main
        className={cn(
          'min-h-screen transition-all duration-300 ease-in-out px-6 md:px-8 lg:px-10 py-8 md:py-10 lg:py-12',
          isCollapsed ? 'ml-20' : 'ml-72'
        )}
      >
        {children}
      </main>
    </div>
  );
};
