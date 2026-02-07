import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Zap, GitBranch, Rocket } from 'lucide-react';

interface StepProps {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  isVisible: boolean;
  isLast?: boolean;
}

const Step = ({ number, icon: Icon, title, description, isVisible, isLast }: StepProps) => (
  <div className="relative flex flex-col items-center text-center">
    {/* Step Circle */}
    <div
      className={`relative z-10 transition-all duration-700 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
      style={{ transitionDelay: `${number * 200}ms` }}
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
      
      {/* Circle */}
      <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-xl shadow-primary/25">
        <Icon className="h-8 w-8 text-primary-foreground" />
      </div>
      
      {/* Number Badge */}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-card border-2 border-primary rounded-full flex items-center justify-center text-sm font-bold text-primary">
        {number}
      </div>
    </div>

    {/* Content */}
    <div
      className={`mt-6 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      style={{ transitionDelay: `${number * 200 + 100}ms` }}
    >
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs mx-auto">{description}</p>
    </div>

    {/* Connector Line */}
    {!isLast && (
      <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5">
        <div
          className={`h-full bg-gradient-to-r from-primary to-primary/30 transition-all duration-1000 origin-left ${
            isVisible ? 'scale-x-100' : 'scale-x-0'
          }`}
          style={{ transitionDelay: `${number * 200 + 300}ms` }}
        />
      </div>
    )}
  </div>
);

export const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const steps = [
    {
      icon: Zap,
      title: 'Create Trigger',
      description: 'Start your workflow with webhook, scheduler, or event',
    },
    {
      icon: GitBranch,
      title: 'Connect Nodes',
      description: 'Add actions and conditions with drag-and-drop',
    },
    {
      icon: Rocket,
      title: 'Go Live',
      description: 'Activate and monitor your workflow with one click',
    },
  ];

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-muted/50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              How It
            </span>{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Build and run your workflow in 3 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-0">
          {steps.map((step, index) => (
            <Step
              key={step.title}
              number={index + 1}
              {...step}
              isVisible={isVisible}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
