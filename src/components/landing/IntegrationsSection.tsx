import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { 
  Database, 
  Mail, 
  MessageSquare, 
  Cloud, 
  CreditCard, 
  Calendar,
  FileText,
  Bell,
  Globe,
  Lock,
  Webhook,
  Bot
} from 'lucide-react';

const integrations = [
  { icon: Database, name: 'PostgreSQL', color: 'from-blue-500 to-blue-600' },
  { icon: Mail, name: 'SendGrid', color: 'from-blue-400 to-blue-500' },
  { icon: MessageSquare, name: 'Slack', color: 'from-purple-500 to-purple-600' },
  { icon: Cloud, name: 'AWS', color: 'from-orange-500 to-orange-600' },
  { icon: CreditCard, name: 'Stripe', color: 'from-violet-500 to-violet-600' },
  { icon: Calendar, name: 'Google Calendar', color: 'from-green-500 to-green-600' },
  { icon: FileText, name: 'Google Docs', color: 'from-blue-500 to-blue-600' },
  { icon: Bell, name: 'Twilio', color: 'from-red-500 to-red-600' },
  { icon: Globe, name: 'Webhooks', color: 'from-gray-500 to-gray-600' },
  { icon: Lock, name: 'Auth0', color: 'from-orange-500 to-orange-600' },
  { icon: Webhook, name: 'Zapier', color: 'from-orange-400 to-orange-500' },
  { icon: Bot, name: 'OpenAI', color: 'from-green-500 to-green-600' },
];

const IntegrationCard = ({ icon: Icon, name, color }: { icon: React.ElementType; name: string; color: string }) => (
  <div className="group flex-shrink-0 bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="font-medium text-foreground whitespace-nowrap">{name}</span>
    </div>
  </div>
);

export const IntegrationsSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              50+ Hazır
            </span>{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Entegrasyon
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mevcut iş uygulamalarınızla kesintisiz entegrasyon
          </p>
        </div>

        {/* Scrolling Integration Rows */}
        <div className="space-y-4">
          {/* Row 1 - Scrolling Left */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex gap-4 animate-scroll-left">
              {[...integrations, ...integrations].map((integration, index) => (
                <IntegrationCard key={`${integration.name}-${index}`} {...integration} />
              ))}
            </div>
          </div>

          {/* Row 2 - Scrolling Right */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex gap-4 animate-scroll-right">
              {[...integrations.slice().reverse(), ...integrations.slice().reverse()].map((integration, index) => (
                <IntegrationCard key={`${integration.name}-rev-${index}`} {...integration} />
              ))}
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className={`text-center mt-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
          <button className="text-primary hover:text-primary/80 font-medium transition-colors">
            Tüm Entegrasyonları İnceleyin →
          </button>
        </div>
      </div>
    </section>
  );
};
