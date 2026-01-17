import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Eye, EyeOff, Check, X, Home } from 'lucide-react';
import { MatrixBackground } from '@/components/auth/MatrixBackground';
import i18n from '@/i18n/config';
import { register as registerApi, fetchAgreement as fetchAgreementApi } from '@/services/authApi';
import { handleError } from '@/utils/errorHandler';

export const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [loadingAgreement, setLoadingAgreement] = useState<{ privacyPolicy: boolean; terms: boolean }>({
    privacyPolicy: false,
    terms: false,
  });

  // Şifre kurallarını kontrol et
  const passwordRules = useMemo(() => {
    const password = formData.password;
    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [formData.password]);
  const [agreementVersions, setAgreementVersions] = useState<{
    privacyPolicy: string | null;
    terms: string | null;
  }>({
    privacyPolicy: null,
    terms: null,
  });

  const fetchAgreement = async (agreementType: 'terms' | 'privacy_policy'): Promise<{ id: string } | null> => {
    try {
      const locale = i18n.language || 'en';
      console.log('Fetching agreement for type:', agreementType, 'locale:', locale);
      
      const responseData = await fetchAgreementApi(locale);
      console.log('Agreement response:', responseData);
      
      // agreement_type'a göre doğru agreement'ı bul
      const agreement = responseData.data.items.find(
        (item) => item.agreement_type === agreementType
      );
      
      if (!agreement || !agreement.id) {
        console.error(`Agreement not found for type: ${agreementType}`, responseData.data.items);
        throw new Error(`Agreement not found for type: ${agreementType}`);
      }
      
      console.log('Found agreement:', agreement);
      return { id: String(agreement.id) };
    } catch (error) {
      console.error('Error fetching agreement:', error);
      return null;
    }
  };

  const handleAgreementCheck = async (type: 'privacyPolicy' | 'terms', checked: boolean) => {
    if (checked) {
      setLoadingAgreement(prev => ({ ...prev, [type]: true }));
      
      try {
        // API'deki agreement_type formatına çevir
        const agreementType = type === 'privacyPolicy' ? 'privacy_policy' : 'terms';
        const agreementData = await fetchAgreement(agreementType);
        
        if (agreementData && agreementData.id) {
          setFormData(prev => ({ ...prev, [type]: true }));
          setAgreementVersions(prev => ({ ...prev, [type]: agreementData.id }));
        } else {
          toast({
            title: t('common:errors.generic.title'),
            description: t('common:errors.api.description'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error in handleAgreementCheck:', error);
        const parsedError = await handleError(error);
        toast({
          title: parsedError.title,
          description: parsedError.description,
          variant: 'destructive',
        });
      } finally {
        setLoadingAgreement(prev => ({ ...prev, [type]: false }));
      }
    } else {
      setFormData(prev => ({ ...prev, [type]: false }));
      setAgreementVersions(prev => ({ ...prev, [type]: null }));
    }
  };

  const registerSchema = z.object({
    username: z.string().min(3, t('auth:register.errors.usernameMin')),
    name: z.string().min(1, t('auth:register.errors.nameRequired')),
    surname: z.string().min(1, t('auth:register.errors.surnameRequired')),
    email: z.string().email(t('auth:register.errors.emailInvalid')),
    password: z
      .string()
      .min(8, t('auth:register.errors.passwordMin'))
      .regex(/[A-Z]/, t('auth:register.errors.passwordUppercase'))
      .regex(/[a-z]/, t('auth:register.errors.passwordLowercase'))
      .regex(/[0-9]/, t('auth:register.errors.passwordNumber'))
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, t('auth:register.errors.passwordSpecial')),
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
      
      // Agreement version ID'lerini kontrol et
      if (!agreementVersions.terms || !agreementVersions.privacyPolicy) {
        toast({
          title: t('common:errors.validation.title'),
          description: t('auth:register.errors.termsRequired'),
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);

      const registerPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        marketing_consent: formData.marketing,
        terms_accepted_version_id: agreementVersions.terms!,
        privacy_policy_accepted_version_id: agreementVersions.privacyPolicy!,
      };

      const response = await registerApi(registerPayload);

      console.log('Registration successful:', response);

      toast({
        title: t('common:messages.success'),
        description: response.message || 'Account created successfully',
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
        
        // Show general form error toast
        toast({
          title: t('common:errors.form.title'),
          description: t('common:errors.form.description'),
          variant: 'destructive',
        });
      } else {
        const parsedError = await handleError(error);
        toast({
          title: parsedError.title,
          description: parsedError.description,
          variant: 'destructive',
        });
        
        // If there are field-specific errors, set them
        if (parsedError.fieldErrors) {
          setErrors(parsedError.fieldErrors);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <MatrixBackground />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10 mb-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:scale-105">
            <UserPlus className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
            {t('auth:register.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('auth:register.subtitle')}
          </p>
        </div>

        <div className="bg-surface/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="transition-colors duration-200">{t('auth:register.username')}</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10"
              />
              {errors.username && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.username}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="transition-colors duration-200">{t('auth:register.name')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname" className="transition-colors duration-200">{t('auth:register.surname')}</Label>
                <Input
                  id="surname"
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10"
                />
                {errors.surname && (
                  <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.surname}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="transition-colors duration-200">{t('auth:register.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.email}</p>
              )}
            </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="transition-colors duration-200">{t('auth:register.password')}</Label>
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
            {formData.password && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                <p className="text-xs font-medium text-foreground mb-2">{t('auth:register.passwordRules.title')}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordRules.minLength ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={passwordRules.minLength ? 'text-green-500' : 'text-muted-foreground'}>
                      {t('auth:register.passwordRules.minLength')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordRules.uppercase ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={passwordRules.uppercase ? 'text-green-500' : 'text-muted-foreground'}>
                      {t('auth:register.passwordRules.uppercase')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordRules.lowercase ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={passwordRules.lowercase ? 'text-green-500' : 'text-muted-foreground'}>
                      {t('auth:register.passwordRules.lowercase')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordRules.number ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={passwordRules.number ? 'text-green-500' : 'text-muted-foreground'}>
                      {t('auth:register.passwordRules.number')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordRules.special ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={passwordRules.special ? 'text-green-500' : 'text-muted-foreground'}>
                      {t('auth:register.passwordRules.special')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="transition-colors duration-200">{t('auth:register.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="transition-all duration-200 focus:scale-[1.01] focus:shadow-lg focus:shadow-primary/10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2 group">
              <Checkbox
                id="privacyPolicy"
                checked={formData.privacyPolicy}
                disabled={loadingAgreement.privacyPolicy}
                onCheckedChange={(checked) =>
                  handleAgreementCheck('privacyPolicy', checked as boolean)
                }
                className="transition-transform duration-200 hover:scale-110"
              />
              <label
                htmlFor="privacyPolicy"
                className="text-sm text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer transition-colors duration-200 group-hover:text-primary"
              >
                {t('auth:register.privacyPolicy')}
              </label>
            </div>
            {errors.privacyPolicy && (
              <p className="text-sm text-destructive animate-fade-in">{errors.privacyPolicy}</p>
            )}

            <div className="flex items-start gap-2 group">
              <Checkbox
                id="terms"
                checked={formData.terms}
                disabled={loadingAgreement.terms}
                onCheckedChange={(checked) =>
                  handleAgreementCheck('terms', checked as boolean)
                }
                className="transition-transform duration-200 hover:scale-110"
              />
              <label
                htmlFor="terms"
                className="text-sm text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer transition-colors duration-200 group-hover:text-primary"
              >
                {t('auth:register.terms')}
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-destructive animate-fade-in">{errors.terms}</p>
            )}

            <div className="flex items-start gap-2 group">
              <Checkbox
                id="marketing"
                checked={formData.marketing}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, marketing: checked as boolean })
                }
                className="transition-transform duration-200 hover:scale-110"
              />
              <label
                htmlFor="marketing"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer transition-colors duration-200 group-hover:text-foreground"
              >
                {t('auth:register.marketing')}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="default"
            className="w-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            loading={loading}
            disabled={loading}
          >
            {t('auth:register.createAccount')}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth:register.hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium transition-all duration-200 hover:text-primary/80">
              {t('auth:register.signIn')}
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
