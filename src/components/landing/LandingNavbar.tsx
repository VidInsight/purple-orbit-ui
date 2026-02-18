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
      className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
    >
      <div
        className={`mt-4 mx-4 max-w-6xl w-full rounded-2xl border transition-all duration-300 backdrop-blur-xl bg-background/30 shadow-xl pointer-events-auto ${
          isScrolled ? 'bg-background/20 shadow-2xl border-border' : 'border-border/60'
        }`}
      >
        <div className="px-6 py-3 md:px-8 md:py-4">
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
      </div>
    </nav>
  );
};
