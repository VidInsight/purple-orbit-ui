import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Eye, EyeOff, Home, Sparkles } from 'lucide-react';
import { MatrixBackground } from '@/components/auth/MatrixBackground';
import { login as loginApi } from '@/services/authApi';
import { saveUserData } from '@/utils/tokenUtils';
import { handleError } from '@/utils/errorHandler';

// Floating particles component
const FloatingParticles = () => {
  const [particles] = useState(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/20 blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// Glowing orb component
const GlowingOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => {
  return (
    <div
      className={`absolute rounded-full blur-3xl animate-pulse ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '4s',
      }}
    />
  );
};

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loginSchema = z.object({
    usernameOrEmail: z.string().min(1, t('auth:login.errors.required')),
    password: z.string().min(1, t('auth:login.errors.required')),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    try {
      loginSchema.parse(formData);
      setLoading(true);

      const response = await loginApi({
        email_or_username: formData.usernameOrEmail,
        password: formData.password,
        device_type: 'web',
      });

      // Token'ları ve kullanıcı bilgilerini localStorage'a kaydet
      if (response.data.access_token && response.data.refresh_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Kullanıcı bilgilerini kaydet
        if (response.data.id && response.data.username && response.data.email) {
          saveUserData({
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
          });
        }
      }

      toast({
        title: t('common:messages.success'),
        description: response.message || 'Logged in successfully',
      });

      navigate('/workspaces');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        
        // Show general form error toast
        toast({
          title: t('common:errors.form.title'),
          description: t('common:errors.form.description'),
          variant: 'destructive',
        });
      } else {
        // API hatası - kullanıcı adı veya şifre hatalı
        const isInvalidCredentials = error instanceof Error && error.message === 'INVALID_CREDENTIALS';
        
        if (isInvalidCredentials) {
          const errorMessage = t('common:errors.auth.invalidCredentials');
          setGeneralError(errorMessage);
          toast({
            title: t('common:errors.client.title'),
            description: errorMessage,
            variant: 'destructive',
          });
        } else {
          const parsedError = await handleError(error);
          // Check if the error message contains "bad request" and replace with user-friendly message
          let errorDescription = parsedError.description;
          if (errorDescription.toLowerCase().includes('bad request') || 
              errorDescription.toLowerCase().includes('400') ||
              (parsedError.statusCode === 400 && errorDescription.toLowerCase().includes('invalid request'))) {
            errorDescription = t('common:errors.auth.invalidCredentials');
          }
          
          setGeneralError(errorDescription);
          toast({
            title: parsedError.title,
            description: errorDescription,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Matrix Background */}
      <MatrixBackground />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsla(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsla(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite',
        }} />
      </div>
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Dynamic Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-primary/10 via-primary/5 to-transparent pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsla(var(--primary) / 0.12) 0%, transparent 50%)`,
        }}
      />
      
      {/* Premium Glow Effects */}
      <GlowingOrb className="top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20" delay={0} />
      <GlowingOrb className="bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/15" delay={1.5} />
      <GlowingOrb className="top-1/2 right-1/3 w-[350px] h-[350px] bg-primary/18" delay={2} />

      {/* Animated gradient border effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-shimmer" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          {/* Premium Icon with enhanced effects */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-3xl animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-2 border-primary/30 shadow-2xl shadow-primary/20 mb-6 transition-all duration-300 hover:shadow-primary/30 hover:scale-105 group">
              <LogIn className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-primary animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {t('auth:login.title')}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('auth:login.subtitle')}
          </p>
        </div>

        {/* Premium Card with enhanced glassmorphism */}
        <div className="relative bg-surface/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
          
          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-50 -z-10">
            <div className="h-full w-full rounded-3xl bg-surface/60 backdrop-blur-xl" />
          </div>
          
          <div className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
          {generalError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm animate-fade-in">
              {generalError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="usernameOrEmail" className="text-sm font-semibold transition-colors duration-200">{t('auth:login.usernameOrEmail')}</Label>
            <Input
              id="usernameOrEmail"
              type="text"
              value={formData.usernameOrEmail}
              onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
              className="h-12 transition-all duration-300 focus:scale-[1.01] focus:shadow-xl focus:shadow-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
            />
            {errors.usernameOrEmail && (
              <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.usernameOrEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold transition-colors duration-200">{t('auth:login.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 transition-all duration-300 focus:scale-[1.01] focus:shadow-xl focus:shadow-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline transition-all duration-200 hover:text-primary/80"
            >
              {t('auth:login.forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            variant="default"
            className="group relative w-full h-12 text-base font-semibold shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            loading={loading}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative">{t('auth:login.signIn')}</span>
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth:login.noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline font-medium transition-all duration-200 hover:text-primary/80">
              {t('auth:login.signUp')}
            </Link>
          </p>
          </form>
          
          <div className="mt-6 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-2 hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 backdrop-blur-sm"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
