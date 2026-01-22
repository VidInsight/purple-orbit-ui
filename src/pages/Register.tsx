import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Eye, EyeOff, Check, X, Home, Sparkles } from 'lucide-react';
import { MatrixBackground } from '@/components/auth/MatrixBackground';
import i18n from '@/i18n/config';
import { register as registerApi, fetchAgreement as fetchAgreementApi } from '@/services/authApi';
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
              <UserPlus className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-primary animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {t('auth:register.title')}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('auth:register.subtitle')}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold transition-colors duration-200">{t('auth:register.username')}</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="h-12 transition-all duration-300 focus:scale-[1.01] focus:shadow-xl focus:shadow-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
              />
              {errors.username && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.username}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold transition-colors duration-200">{t('auth:register.name')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 transition-all duration-300 focus:scale-[1.01] focus:shadow-xl focus:shadow-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname" className="text-sm font-semibold transition-colors duration-200">{t('auth:register.surname')}</Label>
                <Input
                  id="surname"
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="h-12 transition-all duration-300 focus:scale-[1.01] focus:shadow-xl focus:shadow-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
                />
                {errors.surname && (
                  <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.surname}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold transition-colors duration-200">{t('auth:register.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 transition-all duration-300 focus:scale-[1.01] focus:shadow-xl focus:shadow-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.email}</p>
              )}
            </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold transition-colors duration-200">{t('auth:register.password')}</Label>
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
            {formData.password && (
              <div className="mt-2 p-4 bg-muted/60 backdrop-blur-sm rounded-xl border border-border/60 shadow-lg">
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
            <Label htmlFor="confirmPassword" className="text-sm font-semibold transition-colors duration-200">{t('auth:register.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-12 transition-all duration-300 focus:scale-[1.01] focus:shadow-xl focus:shadow-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm pr-10"
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
            className="group relative w-full h-12 text-base font-semibold shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            loading={loading}
            disabled={loading}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative">{t('auth:register.createAccount')}</span>
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth:register.hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium transition-all duration-200 hover:text-primary/80">
              {t('auth:register.signIn')}
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
