import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
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
            <img
              src="/qbitra_pv-nobg.svg"
              alt="Qbitra"
              className="h-12 w-auto"
            />
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button
                size="lg"
                className="gap-2.5 px-6 py-5 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
              >
                <LogIn className="h-5 w-5" />
                <span>Log In</span>
              </Button>
            </Link>
            <Link to="/register">
              <Button className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </Button>
            </Link>
           
          </div>
        </div>
      </div>
    </nav>
  );
};
