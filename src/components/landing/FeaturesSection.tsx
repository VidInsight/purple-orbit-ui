import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { MousePointer2, Activity, Bot, Shield } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  delay: number;
  isVisible: boolean;
}

const FeatureCard = ({ icon: Icon, title, description, features, delay, isVisible }: FeatureCardProps) => (
  <div
    className={`group relative bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}
    style={{ transitionDelay: `${delay * 150}ms` }}
  >
    {/* Hover Glow */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    {/* Icon */}
    <div className="relative mb-4">
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative inline-flex p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
    
    {/* Content */}
    <h3 className="relative text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
      {title}
    </h3>
    <p className="relative text-muted-foreground mb-4">
      {description}
    </p>
    
    {/* Feature List */}
    <ul className="relative space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

export const FeaturesSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const features = [
    {
      icon: MousePointer2,
      title: 'Görsel Süreç Tasarımı',
      description: 'Teknik bilgi gerektirmeden profesyonel iş akışları oluşturun',
      features: [
        'Sezgisel sürükle-bırak arayüzü',
        '100+ hazır süreç şablonu',
        'Koşullu iş mantığı desteği',
        'Döngü ve iterasyon yapıları',
      ],
    },
    {
      icon: Activity,
      title: 'Anlık Süreç Takibi',
      description: 'Tüm operasyonlarınızı gerçek zamanlı izleyin',
      features: [
        'Canlı yürütme görünümü',
        'Performans analitiği',
        'Gelişmiş hata ayıklama',
        'Kapsamlı denetim kayıtları',
      ],
    },
    {
      icon: Bot,
      title: 'Yapay Zeka Çözümleri',
      description: 'Kurumsal AI teknolojileriyle güçlendirilmiş otomasyon',
      features: [
        'OpenAI ve Anthropic entegrasyonu',
        'Doğal dil işleme',
        'Akıllı veri dönüştürme',
        'Otonom karar mekanizmaları',
      ],
    },
    {
      icon: Shield,
      title: 'Kurumsal Güvenlik',
      description: 'Enterprise düzeyde koruma ve uyumluluk standartları',
      features: [
        'Uçtan uca şifreleme',
        'SOC 2 Type II sertifikası',
        'Rol tabanlı erişim kontrolü',
        'Denetim günlüğü yönetimi',
      ],
    },
  ];

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Kapsamlı
            </span>{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Platform Özellikleri
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Kurumsal iş süreçlerinizi dijitalleştirmek için gereken tüm araçlar tek platformda
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
