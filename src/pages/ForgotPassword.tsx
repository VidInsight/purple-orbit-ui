import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { MatrixBackground } from '@/components/auth/MatrixBackground';

export const ForgotPassword = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const emailSchema = z.object({
    email: z.string().email(t('auth:forgotPassword.errors.emailInvalid')),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      emailSchema.parse({ email });
      setLoading(true);

      // TODO: Implement actual forgot password logic with backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      toast({
        title: t('common:messages.success'),
        description: t('auth:forgotPassword.success'),
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        toast({
          title: t('common:messages.error'),
          description: 'Failed to send reset link',
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
            <KeyRound className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
            {t('auth:forgotPassword.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('auth:forgotPassword.subtitle')}
          </p>
        </div>

        <div className="bg-surface/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="transition-colors duration-200">{t('auth:forgotPassword.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10"
              />
              {error && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              loading={loading}
            >
              {t('auth:forgotPassword.sendResetLink')}
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 font-medium group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              {t('auth:forgotPassword.backToLogin')}
            </Link>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-success/20 to-success/5 border border-success/30 shadow-lg transition-all duration-300">
                <p className="text-success text-center font-medium text-lg">
                  {t('auth:forgotPassword.success')}
                </p>
              </div>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 font-medium group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                {t('auth:forgotPassword.backToLogin')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
