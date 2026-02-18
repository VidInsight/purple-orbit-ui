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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#05010d] dark:via-[#060015] dark:to-[#020008] transition-colors duration-300">
      <Navbar isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
      
      <main
        className={cn(
          'min-h-screen min-w-0 transition-all duration-300 ease-in-out overflow-x-auto',
          'px-3 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-8 md:py-10 lg:py-12',
          // Width = viewport minus sidebar so content fits exactly (no horizontal scroll from layout)
          isCollapsed
            ? 'ml-16 sm:ml-20 w-[calc(100vw-4rem)] sm:w-[calc(100vw-5rem)]'
            : 'ml-64 sm:ml-72 w-[calc(100vw-16rem)] sm:w-[calc(100vw-18rem)]'
        )}
      >
        {children}
      </main>
    </div>
  );
};
