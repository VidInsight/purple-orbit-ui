import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Workflow, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full group-hover:bg-primary/50 transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl">
                <Workflow className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              FlowMaster
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Giriş Yap</span>
              </Button>
            </Link>
            <Link to="/register">
              <Button className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Kayıt Ol</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
