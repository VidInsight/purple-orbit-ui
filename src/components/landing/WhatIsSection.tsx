import { useState, useEffect } from 'react';
import { 
  Workflow, 
  Zap, 
  Clock, 
  TrendingDown, 
  TrendingUp,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const problems = [
  { icon: Clock, text: 'Repetitive manual tasks', color: 'text-destructive' },
  { icon: TrendingDown, text: 'Low efficiency', color: 'text-destructive' },
  { icon: XCircle, text: 'Human errors', color: 'text-destructive' },
];

const solutions = [
  { icon: Zap, text: 'Automated workflows', color: 'text-success' },
  { icon: TrendingUp, text: 'High efficiency', color: 'text-success' },
  { icon: CheckCircle, text: 'Error-free processes', color: 'text-success' },
];

export const WhatIsSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 3);
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background backdrop-blur-xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Workflow className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Workflow Automation Platform</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Automate Your
            </span>{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Business Processes
            </span>
          </h2>
          <p className={`text-muted-foreground text-lg max-w-3xl mx-auto transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Qbitra is a powerful automation platform that turns repetitive manual tasks into automated workflows. Automate complex processes in minutes with a drag-and-drop interface—no coding required.
          </p>
        </div>

        {/* Problem → Solution Visual */}
        <div className={`grid md:grid-cols-3 gap-8 items-center transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Problems Card */}
          <div className="bg-card/50 backdrop-blur border border-destructive/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive/50 to-destructive/20" />
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Problems
            </h3>
            <div className="space-y-4">
              {problems.map((problem, index) => {
                const Icon = problem.icon;
                const isActive = activeStep === index;
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                      isActive ? 'bg-destructive/10 scale-105 shadow-lg shadow-destructive/10' : 'bg-surface/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-destructive/20' : 'bg-muted'
                    }`}>
                      <Icon className={`h-4 w-4 transition-colors duration-300 ${
                        isActive ? 'text-destructive' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {problem.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow / Transformation */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              </div>
              
              {/* Center icon */}
              <div className="relative w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-glow-primary">
                <Workflow className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-sm font-semibold text-primary">Qbitra</div>
              <div className="text-xs text-muted-foreground">transforms them</div>
            </div>

            {/* Animated arrows */}
            <div className="hidden md:flex items-center gap-2 mt-4">
              <ArrowRight className="h-5 w-5 text-primary animate-pulse" />
              <ArrowRight className="h-5 w-5 text-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
              <ArrowRight className="h-5 w-5 text-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>

          {/* Solutions Card */}
          <div className="bg-card/50 backdrop-blur border border-success/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success/50 to-success/20" />
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Solutions
            </h3>
            <div className="space-y-4">
              {solutions.map((solution, index) => {
                const Icon = solution.icon;
                const isActive = activeStep === index;
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                      isActive ? 'bg-success/10 scale-105 shadow-lg shadow-success/10' : 'bg-surface/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-success/20' : 'bg-muted'
                    }`}>
                      <Icon className={`h-4 w-4 transition-colors duration-300 ${
                        isActive ? 'text-success' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {solution.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className={`grid sm:grid-cols-3 gap-6 mt-16 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {[
            { value: '80%', label: 'Time Saved', desc: 'On manual tasks' },
            { value: '0', label: 'Code Required', desc: 'Drag-and-drop only' },
            { value: '24/7', label: 'Always Running', desc: 'Uninterrupted automation' },
          ].map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-card/30 backdrop-blur border border-border/50 rounded-xl hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-foreground font-medium">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
