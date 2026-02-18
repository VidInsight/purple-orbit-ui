import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { HeroWorkflowPreview } from './HeroWorkflowPreview';
import { TypewriterText } from './TypewriterText';
import { IntegrationLogos } from './IntegrationLogos';
import DarkVeil from '../ui/DarkVeil';

const DEMO_VIDEO_URL = 'https://www.youtube.com/embed/3VixMr5ewyg?autoplay=1';

export const HeroSection = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* DarkVeil as full-page animated background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <DarkVeil
            hueShift={326}
            noiseIntensity={0}
            scanlineIntensity={1}
            speed={1.6}
            scanlineFrequency={0}
            warpAmount={0.05}
            resolutionScale={1.25}
        />
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
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
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

          {/* Right Side - Workflow Preview */}
          <div className="hidden lg:block animate-fade-in relative" style={{ animationDelay: '0.5s' }}>
            <div className="relative">
              <HeroWorkflowPreview />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
