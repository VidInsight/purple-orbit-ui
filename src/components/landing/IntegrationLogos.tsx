import { 
  Mail, 
  MessageSquare, 
  Database, 
  Cloud, 
  CreditCard, 
  FileText,
  Webhook,
  Bot
} from 'lucide-react';

const integrations = [
  { icon: Mail, name: 'Email' },
  { icon: MessageSquare, name: 'Slack' },
  { icon: Database, name: 'Database' },
  { icon: Cloud, name: 'Cloud' },
  { icon: CreditCard, name: 'Stripe' },
  { icon: FileText, name: 'Docs' },
  { icon: Webhook, name: 'Webhooks' },
  { icon: Bot, name: 'AI' },
];

export const IntegrationLogos = () => {
  return (
    <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
      <span className="text-xs text-muted-foreground">Entegrasyonlar:</span>
      <div className="flex items-center gap-2">
        {integrations.map((integration, index) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.name}
              className="group relative p-2 rounded-lg bg-surface/50 border border-border/50 
                         hover:border-primary/50 hover:bg-primary/5 transition-all duration-300
                         hover:scale-110 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-card border border-border
                              text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              pointer-events-none whitespace-nowrap">
                {integration.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
