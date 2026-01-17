import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Eye, EyeOff, Home } from 'lucide-react';
import { MatrixBackground } from '@/components/auth/MatrixBackground';
import { login as loginApi } from '@/services/authApi';
import { saveUserData } from '@/utils/tokenUtils';
import { handleError } from '@/utils/errorHandler';

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

      console.log('Login successful:', response);

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
      <MatrixBackground />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10 mb-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:scale-105">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
            {t('auth:login.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('auth:login.subtitle')}
          </p>
        </div>

        <div className="bg-surface/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
          {generalError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm animate-fade-in">
              {generalError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="usernameOrEmail" className="transition-colors duration-200">{t('auth:login.usernameOrEmail')}</Label>
            <Input
              id="usernameOrEmail"
              type="text"
              value={formData.usernameOrEmail}
              onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
              className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10"
            />
            {errors.usernameOrEmail && (
              <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.usernameOrEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="transition-colors duration-200">{t('auth:login.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10 pr-10"
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
            className="w-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            loading={loading}
          >
            {t('auth:login.signIn')}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth:login.noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline font-medium transition-all duration-200 hover:text-primary/80">
              {t('auth:login.signUp')}
            </Link>
          </p>
          </form>
          
          <div className="mt-4 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
