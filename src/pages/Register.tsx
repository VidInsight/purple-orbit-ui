import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { UserPlus } from 'lucide-react';
import { MatrixBackground } from '@/components/auth/MatrixBackground';
import type { RegisterRequest, Agreement } from '@/types/api';

export const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Get current locale from i18next and normalize to API format (tr -> tr-TR, en -> en-US)
  const normalizeLocale = (lang: string): string => {
    const langMap: Record<string, string> = {
      'tr': 'tr-TR',
      'en': 'en-US',
    };
    // If already in format like 'tr-TR', return as is
    if (lang.includes('-')) {
      return lang;
    }
    // Otherwise map to full format
    return langMap[lang] || 'tr-TR';
  };
  const currentLocale = normalizeLocale(i18n.language || 'tr');
  
  // Fetch active agreements
  const { data: termsAgreement, isLoading: isLoadingTerms, error: termsError } = useQuery({
    queryKey: ['activeAgreement', 'terms', currentLocale],
    queryFn: async () => {
      try {
        console.log('Fetching terms agreement...');
        const response = await apiClient.get<Agreement>(
          API_ENDPOINTS.agreement.getActive,
          { 
            skipAuth: true,
            params: {
              agreement_type: 'terms',
              locale: currentLocale,
            },
          }
        );
        console.log('Terms agreement response (full):', JSON.stringify(response, null, 2));
        console.log('Terms agreement response.data:', response.data);
        console.log('Terms agreement response.data.id:', response.data?.id);
        return response;
      } catch (error) {
        console.error('Terms agreement error:', error);
        console.error('Terms agreement error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    },
    retry: 1, // Retry sayısını azalt
    refetchOnWindowFocus: false, // Window focus'ta refetch yapma
    refetchOnMount: true, // Sadece mount'ta refetch yap
  });

  const { data: privacyAgreement, isLoading: isLoadingPrivacy, error: privacyError } = useQuery({
    queryKey: ['activeAgreement', 'privacy_policy', currentLocale],
    queryFn: async () => {
      try {
        console.log('Fetching privacy agreement...');
        const response = await apiClient.get<Agreement>(
          API_ENDPOINTS.agreement.getActive,
          { 
            skipAuth: true,
            params: {
              agreement_type: 'privacy_policy',
              locale: currentLocale,
            },
          }
        );
        console.log('Privacy agreement response (full):', JSON.stringify(response, null, 2));
        console.log('Privacy agreement response.data:', response.data);
        console.log('Privacy agreement response.data.id:', response.data?.id);
        return response;
      } catch (error) {
        console.error('Privacy agreement error:', error);
        console.error('Privacy agreement error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    },
    retry: 1, // Retry sayısını azalt
    refetchOnWindowFocus: false, // Window focus'ta refetch yapma
    refetchOnMount: true, // Sadece mount'ta refetch yap
  });

  // Debug: Log agreement data and button state
  useEffect(() => {
    console.log('=== Register Page Debug ===');
    console.log('Terms Agreement (full):', JSON.stringify(termsAgreement, null, 2));
    console.log('Terms Agreement Data:', termsAgreement?.data);
    console.log('Terms Agreement ID:', termsAgreement?.data?.id);
    console.log('Privacy Agreement (full):', JSON.stringify(privacyAgreement, null, 2));
    console.log('Privacy Agreement Data:', privacyAgreement?.data);
    console.log('Privacy Agreement ID:', privacyAgreement?.data?.id);
    console.log('Terms Loading:', isLoadingTerms);
    console.log('Privacy Loading:', isLoadingPrivacy);
    console.log('Terms Error:', termsError);
    console.log('Privacy Error:', privacyError);
    
    // Log button disabled state
    const hasTermsId = !!termsAgreement?.data?.id;
    const hasPrivacyId = !!privacyAgreement?.data?.id;
    const isDisabled = isLoadingTerms || isLoadingPrivacy || !hasTermsId || !hasPrivacyId || !!termsError || !!privacyError;
    
    console.log('Button State:', {
      isDisabled,
      isLoadingTerms,
      isLoadingPrivacy,
      hasTermsId,
      hasPrivacyId,
      hasTermsError: !!termsError,
      hasPrivacyError: !!privacyError,
    });
    
    // Log error details if any
    if (termsError) {
      console.error('Terms Error Details:', termsError);
    }
    if (privacyError) {
      console.error('Privacy Error Details:', privacyError);
    }
    
    console.log('========================');
  }, [termsAgreement, privacyAgreement, termsError, privacyError, isLoadingTerms, isLoadingPrivacy]);

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
    console.log('=== Form Submit Started ===');
    console.log('Form Data:', formData);
    console.log('Terms Agreement:', termsAgreement);
    console.log('Privacy Agreement:', privacyAgreement);
    console.log('Terms Agreement ID:', termsAgreement?.data?.id);
    console.log('Privacy Agreement ID:', privacyAgreement?.data?.id);
    
    setErrors({});

    try {
      // Validation
      registerSchema.parse(formData);
      console.log('Validation passed');
      setLoading(true);

      // Get agreement IDs
      const termsAgreementId = termsAgreement?.data?.id;
      const privacyAgreementId = privacyAgreement?.data?.id;

      console.log('Agreement IDs:', { termsAgreementId, privacyAgreementId });

      if (!termsAgreementId || !privacyAgreementId) {
        console.error('Agreement IDs missing!');
        setLoading(false);
        toast({
          title: t('common:messages.error'),
          description: 'Unable to load terms and privacy policy. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Prepare register request
      const registerData: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        marketing_consent: formData.marketing,
        terms_accepted_version: termsAgreementId,
        privacy_policy_accepted_version: privacyAgreementId,
      };

      console.log('Register Data:', { ...registerData, password: '***' });
      console.log('Calling register API...');

      // Call register API
      await register(registerData);
      
      console.log('Register API call successful!');

      toast({
        title: t('common:messages.success'),
        description: 'Account created successfully. Please login.',
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
        // API error
        const errorMessage = (error as any)?.message || 'Registration failed';
        toast({
          title: t('common:messages.error'),
          description: errorMessage,
          variant: 'destructive',
        });
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
            <Label htmlFor="confirmPassword" className="transition-colors duration-200">{t('auth:register.confirmPassword')}</Label>
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

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2 group">
              <Checkbox
                id="privacyPolicy"
                checked={formData.privacyPolicy}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, privacyPolicy: checked as boolean })
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
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, terms: checked as boolean })
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

          {(termsError || privacyError) && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-destructive">
                {termsError ? 'Failed to load terms and conditions. ' : ''}
                {privacyError ? 'Failed to load privacy policy. ' : ''}
                Please refresh the page and try again.
              </p>
            </div>
          )}
          
          <Button
            type="submit"
            variant="primary"
            className="w-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            loading={loading || isLoadingTerms || isLoadingPrivacy}
            disabled={isLoadingTerms || isLoadingPrivacy || !termsAgreement?.data?.id || !privacyAgreement?.data?.id || !!termsError || !!privacyError}
            onClick={(e) => {
              console.log('Button clicked!');
              console.log('Button disabled:', isLoadingTerms || isLoadingPrivacy || !termsAgreement?.data?.id || !privacyAgreement?.data?.id || !!termsError || !!privacyError);
              console.log('Terms Agreement:', termsAgreement);
              console.log('Privacy Agreement:', privacyAgreement);
            }}
          >
            {isLoadingTerms || isLoadingPrivacy 
              ? t('common:messages.loading') || 'Loading...'
              : !termsAgreement?.data?.id || !privacyAgreement?.data?.id
              ? 'Waiting for agreements...'
              : t('auth:register.createAccount')
            }
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth:register.hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium transition-all duration-200 hover:text-primary/80">
              {t('auth:register.signIn')}
            </Link>
          </p>
        </form>
        </div>
      </div>
    </div>
  );
};
