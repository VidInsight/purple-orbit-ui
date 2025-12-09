import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MatrixBackground } from '@/components/auth/MatrixBackground';
import { HeroWorkflowPreview } from './HeroWorkflowPreview';
import { TypewriterText } from './TypewriterText';
import { IntegrationLogos } from './IntegrationLogos';

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

      {/* Content - Split Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm text-primary font-medium">Yeni: AI Entegrasyonları Aktif</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Workflow Otomasyonunu
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Yeniden Keşfedin
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Sürükle-bırak arayüzü, 50+ entegrasyon ve yapay zeka desteğiyle 
              iş süreçlerinizi dakikalar içinde otomatikleştirin.
            </p>

            {/* Typewriter Use Cases */}
            <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <TypewriterText />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/register">
                <Button size="lg" className="gap-2 px-8 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                  Ücretsiz Başla
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 px-8 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300">
                <Play className="h-4 w-4" />
                Demo İzle
              </Button>
            </div>

            {/* Integration Logos */}
            <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <IntegrationLogos />
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-foreground">5,000+</div>
                <div className="text-xs text-muted-foreground">Aktif Kullanıcı</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-foreground">1M+</div>
                <div className="text-xs text-muted-foreground">İşlenen Task</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Side - Animated Workflow Preview */}
          <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <HeroWorkflowPreview />
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
