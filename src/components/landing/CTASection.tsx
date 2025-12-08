import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const CTASection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div
          className={`bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 md:p-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">14 Gün Ücretsiz Deneme - Kredi Kartı Gerektirmez</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Dijital Dönüşümünüzü
            </span>{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Başlatın
            </span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Kurumsal iş süreçlerinizi otomatikleştirin, operasyonel verimliliğinizi 
            artırın ve rekabet avantajı elde edin.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="gap-2 px-8 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                Ücretsiz Deneme Başlat
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="gap-2 px-8 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300">
                Hesabınıza Giriş Yapın
              </Button>
            </Link>
          </div>

          {/* Trust Text */}
          <p className="mt-8 text-sm text-muted-foreground">
            5,000+ kurumsal müşteri tarafından tercih edilmektedir
          </p>
        </div>
      </div>
    </section>
  );
};
