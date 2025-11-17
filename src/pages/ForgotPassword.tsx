import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            {t('auth:forgotPassword.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('auth:forgotPassword.subtitle')}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">{t('auth:forgotPassword.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              {t('auth:forgotPassword.sendResetLink')}
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth:forgotPassword.backToLogin')}
            </Link>
          </form>
        ) : (
            <div className="space-y-6">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-success text-center">
                {t('auth:forgotPassword.success')}
              </p>
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth:forgotPassword.backToLogin')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
