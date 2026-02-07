import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { MatrixBackground } from '@/components/auth/MatrixBackground';
import { HeroWorkflowPreview } from './HeroWorkflowPreview';
import { TypewriterText } from './TypewriterText';
import { IntegrationLogos } from './IntegrationLogos';

// Floating particles component
const FloatingParticles = () => {
  const particlesRef = useRef<HTMLDivElement>(null);
  const [particles] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/30 blur-sm"
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

// Animated grid pattern
const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(hsla(var(--primary) / 0.1) 1px, transparent 1px),
          linear-gradient(90deg, hsla(var(--primary) / 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 20s linear infinite',
      }} />
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

const DEMO_VIDEO_URL = 'https://www.youtube.com/embed/3VixMr5ewyg?autoplay=1';

export const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [demoModalOpen, setDemoModalOpen] = useState(false);

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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Matrix Background */}
      <MatrixBackground />
      
      {/* Animated Grid Pattern */}
      <AnimatedGrid />
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Dynamic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background pointer-events-none" />
      <div 
        className="absolute inset-0 bg-gradient-radial from-primary/10 via-primary/5 to-transparent pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsla(var(--primary) / 0.15) 0%, transparent 50%)`,
        }}
      />
      
      {/* Premium Glow Effects - Multiple orbs */}
      <GlowingOrb className="top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/25" delay={0} />
      <GlowingOrb className="bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/15" delay={1} />
      <GlowingOrb className="top-1/2 right-1/3 w-[400px] h-[400px] bg-primary/20" delay={2} />
      <GlowingOrb className="bottom-1/3 left-1/3 w-[450px] h-[450px] bg-primary/10" delay={1.5} />

      {/* Animated gradient border effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-shimmer" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content - Split Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="mb-6"></div>

            {/* Premium Main Heading with enhanced gradients */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 animate-fade-in leading-tight" style={{ animationDelay: '0.1s' }}>
              <span className="block bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent drop-shadow-2xl">
                Workflow Automation
              </span>
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                Reimagined
              </span>
            </h1>

            {/* Enhanced Subheading */}
            <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Automate your business processes in minutes with a drag-and-drop interface, <span className="text-primary font-semibold">50+ integrations</span>, and{' '}
              <span className="text-primary font-semibold">AI support</span>.
            </p>

            {/* Premium Stats Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Quick Setup</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">80% Efficiency</span>
              </div>
            </div>

            {/* Typewriter Use Cases */}
            <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <TypewriterText />
            </div>

            {/* Premium CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10 animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <Link to="/login">
                <Button
                  size="lg"
                  className="group relative gap-2.5 px-10 py-6 text-lg font-semibold shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center gap-2.5">
                    Log In
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="group gap-2 px-10 py-6 text-base font-semibold border-2 hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 backdrop-blur-sm"
                onClick={() => setDemoModalOpen(true)}
              >
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Demo video modal */}
            <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
              <DialogContent className="max-w-4xl w-[95vw] pt-12 pb-0 px-0 gap-0 overflow-hidden border-primary/20 bg-background/95 backdrop-blur-sm">
                <DialogTitle className="sr-only">Demo Video</DialogTitle>
                <div className="relative aspect-video w-full">
                  <iframe
                    src={demoModalOpen ? DEMO_VIDEO_URL : ''}
                    title="Demo Video"
                    className="absolute inset-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* Integration Logos */}
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <IntegrationLogos />
            </div>
          </div>

          {/* Right Side - Animated Workflow Preview with enhanced effects */}
          <div className="hidden lg:block animate-fade-in relative" style={{ animationDelay: '0.5s' }}>
            {/* Glow effect behind preview */}
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl scale-110 animate-pulse" />
            <div className="relative transform hover:scale-105 transition-transform duration-500">
              <HeroWorkflowPreview />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
