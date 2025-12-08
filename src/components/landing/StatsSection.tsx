import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useCountUp } from '@/hooks/useCountUp';
import { Plug, TrendingUp, Zap, Clock, Server } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description: string;
  delay: number;
  isVisible: boolean;
  color: string;
}

const StatCard = ({ icon: Icon, value, suffix = '', prefix = '', label, description, delay, isVisible, color }: StatCardProps) => {
  const { formattedValue } = useCountUp({
    end: value,
    duration: 2000,
    delay: delay * 200,
    suffix,
    prefix,
    decimals: suffix === 's' ? 1 : 0,
    isVisible,
  });

  return (
    <div
      className={`relative group bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay * 100}ms` }}
    >
      {/* Glow */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color} blur-xl -z-10`} />
      
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      
      <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
        {formattedValue}
      </div>
      
      <div className="text-lg font-medium text-foreground/80 mb-1">
        {label}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {description}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ 
            width: isVisible ? '100%' : '0%',
            transitionDelay: `${delay * 100 + 500}ms`
          }}
        />
      </div>
    </div>
  );
};

export const StatsSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const stats = [
    {
      icon: Plug,
      value: 50,
      suffix: '+',
      label: 'Entegrasyon',
      description: 'Popüler servislerle hazır bağlantılar',
      color: 'from-primary to-primary/70',
    },
    {
      icon: TrendingUp,
      value: 340,
      prefix: '%',
      label: 'Performans Artışı',
      description: 'Ortalama verimlilik kazanımı',
      color: 'from-success to-success/70',
    },
    {
      icon: Zap,
      value: 1,
      suffix: 'M+',
      label: 'İşlenen Task',
      description: 'Her ay milyonlarca görev',
      color: 'from-warning to-warning/70',
    },
    {
      icon: Server,
      value: 99.9,
      suffix: '%',
      label: 'Uptime',
      description: 'Kesintisiz güvenilir altyapı',
      color: 'from-primary to-primary/70',
    },
    {
      icon: Clock,
      value: 0.3,
      suffix: 's',
      label: 'Ortalama Hız',
      description: 'Milisaniyede yanıt süresi',
      color: 'from-success to-success/70',
    },
  ];

  return (
    <section ref={ref} className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Rakamlarla
            </span>{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              FlowMaster
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Binlerce işletmenin güvendiği performans ve güvenilirlik
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              {...stat}
              delay={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
