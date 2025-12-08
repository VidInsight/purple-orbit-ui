import { Link } from 'react-router-dom';
import { ArrowRight, Play, Zap, Database, Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MatrixBackground } from '@/components/auth/MatrixBackground';

const FloatingCard = ({ 
  icon: Icon, 
  label, 
  delay, 
  position 
}: { 
  icon: React.ElementType; 
  label: string; 
  delay: number;
  position: string;
}) => (
  <div
    className={`absolute ${position} bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-xl animate-float`}
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: '6s'
    }}
  >
    <div className="flex items-center gap-2">
      <div className="bg-primary/20 p-1.5 rounded-lg">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-medium text-foreground/80">{label}</span>
    </div>
  </div>
);

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Matrix Background */}
      <MatrixBackground />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Floating Cards */}
      <FloatingCard icon={Zap} label="API Trigger" delay={0} position="top-32 left-[15%] hidden lg:flex" />
      <FloatingCard icon={Database} label="Database Query" delay={0.5} position="top-48 right-[12%] hidden lg:flex" />
      <FloatingCard icon={Bot} label="AI Processing" delay={1} position="bottom-40 left-[20%] hidden lg:flex" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-sm text-primary font-medium">Kurumsal AI Çözümleri Artık Aktif</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            İş Süreçlerinizi
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
            Dönüştürün
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Kurumsal düzeyde güvenlik, 50+ entegrasyon ve yapay zeka destekli 
          otomasyon platformuyla operasyonel verimliliğinizi maksimize edin.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Link to="/register">
            <Button size="lg" className="gap-2 px-8 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
              Ücretsiz Deneme Başlat
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="gap-2 px-8 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300">
            <Play className="h-4 w-4" />
            Ürün Tanıtımı
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">5,000+</div>
            <div className="text-sm text-muted-foreground">Kurumsal Kullanıcı</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">1M+</div>
            <div className="text-sm text-muted-foreground">İşlem Hacmi</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">99.9%</div>
            <div className="text-sm text-muted-foreground">Çalışma Süresi</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
