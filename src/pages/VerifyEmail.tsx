import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { MailCheck, MailX, Loader2 } from 'lucide-react';
import { MatrixBackground } from '@/components/auth/MatrixBackground';
import { verifyEmail as verifyEmailApi } from '@/services/authApi';

export const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    id: string;
    username: string;
    email: string;
    is_verified: boolean;
  } | null>(null);

  // URL'den token'ı al ve otomatik istek at
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    
    if (!tokenFromUrl) {
      setError('Verification token is missing from URL');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        setLoading(true);
        const response = await verifyEmailApi({
          verification_token: tokenFromUrl,
        });

        setVerified(true);
        setUserData(response.data);

        toast({
          title: t('common:messages.success'),
          description: response.message || 'Email verified successfully',
        });

        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
        setError(errorMessage);
        toast({
          title: t('common:messages.error'),
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast, t]);

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
        <MatrixBackground />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10 mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
              Verifying Email...
            </h1>
            <p className="text-muted-foreground text-lg">
              Please wait while we verify your email address
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
        <MatrixBackground />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/20 shadow-lg shadow-destructive/10 mb-6 transition-all duration-300">
              <MailX className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
              Verification Failed
            </h1>
            <p className="text-muted-foreground text-lg">
              {error}
            </p>
          </div>

          <div className="bg-surface/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl text-center">
            <p className="text-muted-foreground mb-6">
              Please check your verification link or contact support if the problem persists.
            </p>
            <Link
              to="/login"
              className="text-primary hover:underline font-medium transition-all duration-200 hover:text-primary/80"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Başarılı doğrulama ekranı
  if (verified && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
        <MatrixBackground />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 shadow-lg shadow-green-500/10 mb-6 transition-all duration-300 animate-pulse">
              <MailCheck className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-4xl font-semibold text-foreground mb-3 tracking-tight">
              Email Verified!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your email has been successfully verified.
            </p>
          </div>

          <div className="bg-surface/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="space-y-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Username</p>
                <p className="text-lg font-semibold text-foreground">{userData.username}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="text-lg font-semibold text-foreground">{userData.email}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="text-lg font-semibold text-green-500">
                  {userData.is_verified ? 'Verified ✓' : 'Not Verified'}
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              You will be redirected to the login page shortly...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

