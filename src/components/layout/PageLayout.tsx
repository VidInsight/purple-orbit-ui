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
    <div className="min-h-screen bg-background">
      <Navbar isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
      
      <main
        className={cn(
          'min-h-screen transition-all duration-300 ease-in-out px-4 md:px-5 lg:px-6 py-6 md:py-7 lg:py-8',
          isCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {children}
      </main>
    </div>
  );
};
