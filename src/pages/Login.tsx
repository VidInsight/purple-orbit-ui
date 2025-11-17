import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginSchema = z.object({
    usernameOrEmail: z.string().min(1, t('auth:login.errors.required')),
    password: z.string().min(1, t('auth:login.errors.required')),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      loginSchema.parse(formData);
      setLoading(true);

      // TODO: Implement actual login logic with backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: t('common:messages.success'),
        description: 'Logged in successfully',
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
      } else {
        toast({
          title: t('common:messages.error'),
          description: t('auth:login.errors.invalidCredentials'),
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <div>
            <Label htmlFor="usernameOrEmail">{t('auth:login.usernameOrEmail')}</Label>
            <Input
              id="usernameOrEmail"
              type="text"
              value={formData.usernameOrEmail}
              onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
              className="mt-1"
            />
            {errors.usernameOrEmail && (
              <p className="text-sm text-destructive mt-1">{errors.usernameOrEmail}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">{t('auth:login.password')}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1"
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t('auth:login.forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full shadow-lg hover:shadow-xl transition-all duration-200"
            loading={loading}
          >
            {t('auth:login.signIn')}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth:login.noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline font-medium transition-colors">
              {t('auth:login.signUp')}
            </Link>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
};
