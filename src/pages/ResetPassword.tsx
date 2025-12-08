import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';
import { MatrixBackground } from '@/components/auth/MatrixBackground';

export const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetSchema = z.object({
    password: z.string().min(8, t('auth:resetPassword.errors.passwordMin')),
    confirmPassword: z.string().min(1, t('auth:resetPassword.errors.passwordMatch')),
  }).refine(data => data.password === data.confirmPassword, {
    message: t('auth:resetPassword.errors.passwordMatch'),
    path: ['confirmPassword'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      resetSchema.parse(formData);
      setLoading(true);

      // TODO: Implement actual password reset logic with backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: t('common:messages.success'),
        description: t('auth:resetPassword.success'),
      });

      navigate('/login');
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
          description: 'Password reset failed',
          variant: 'destructive',
        });
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
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
            {t('auth:resetPassword.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('auth:resetPassword.subtitle')}
          </p>
        </div>

        <div className="bg-surface/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="transition-colors duration-200">{t('auth:resetPassword.password')}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10"
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="transition-colors duration-200">{t('auth:resetPassword.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            loading={loading}
          >
            {t('auth:resetPassword.resetPassword')}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline font-medium transition-all duration-200 hover:text-primary/80">
              {t('auth:forgotPassword.backToLogin')}
            </Link>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
};
