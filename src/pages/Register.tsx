import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

export const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    privacyPolicy: false,
    terms: false,
    marketing: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerSchema = z.object({
    username: z.string().min(3, t('auth:register.errors.usernameMin')),
    name: z.string().min(1, t('auth:register.errors.nameRequired')),
    surname: z.string().min(1, t('auth:register.errors.surnameRequired')),
    email: z.string().email(t('auth:register.errors.emailInvalid')),
    password: z.string().min(8, t('auth:register.errors.passwordMin')),
    confirmPassword: z.string().min(1, t('auth:register.errors.passwordMatch')),
    privacyPolicy: z.boolean().refine(val => val === true, {
      message: t('auth:register.errors.privacyRequired'),
    }),
    terms: z.boolean().refine(val => val === true, {
      message: t('auth:register.errors.termsRequired'),
    }),
    marketing: z.boolean(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t('auth:register.errors.passwordMatch'),
    path: ['confirmPassword'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      registerSchema.parse(formData);
      setLoading(true);

      // TODO: Implement actual registration logic with backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: t('common:messages.success'),
        description: 'Account created successfully',
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
          description: 'Registration failed',
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
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            {t('auth:register.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('auth:register.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">{t('auth:register.username')}</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1"
            />
            {errors.username && (
              <p className="text-sm text-destructive mt-1">{errors.username}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('auth:register.name')}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="surname">{t('auth:register.surname')}</Label>
              <Input
                id="surname"
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="mt-1"
              />
              {errors.surname && (
                <p className="text-sm text-destructive mt-1">{errors.surname}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">{t('auth:register.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">{t('auth:register.password')}</Label>
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

          <div>
            <Label htmlFor="confirmPassword">{t('auth:register.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="mt-1"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="privacyPolicy"
                checked={formData.privacyPolicy}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, privacyPolicy: checked as boolean })
                }
              />
              <label
                htmlFor="privacyPolicy"
                className="text-sm text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('auth:register.privacyPolicy')}
              </label>
            </div>
            {errors.privacyPolicy && (
              <p className="text-sm text-destructive">{errors.privacyPolicy}</p>
            )}

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, terms: checked as boolean })
                }
              />
              <label
                htmlFor="terms"
                className="text-sm text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('auth:register.terms')}
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-destructive">{errors.terms}</p>
            )}

            <div className="flex items-start gap-2">
              <Checkbox
                id="marketing"
                checked={formData.marketing}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, marketing: checked as boolean })
                }
              />
              <label
                htmlFor="marketing"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('auth:register.marketing')}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            {t('auth:register.createAccount')}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth:register.hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline">
              {t('auth:register.signIn')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
