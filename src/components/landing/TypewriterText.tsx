import { useState, useEffect } from 'react';

const useCases = [
  'E-posta bildirimleri otomatikleştirin',
  'Veri senkronizasyonu yapın',
  'AI ile içerik üretin',
  'Raporları otomatik gönderin',
  'CRM entegrasyonları kurun',
];

export const TypewriterText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % useCases.length);
        setIsVisible(true);
      }, 500);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-8 flex items-center justify-center lg:justify-start">
      <span className="text-muted-foreground mr-2">Örneğin:</span>
      <span 
        className={`
          text-primary font-medium transition-all duration-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
      >
        {useCases[currentIndex]}
      </span>
    </div>
  );
};
