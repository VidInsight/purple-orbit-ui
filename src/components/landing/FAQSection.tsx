import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "AutoFlow nedir ve nasıl çalışır?",
    answer: "AutoFlow, iş süreçlerinizi otomatikleştirmenizi sağlayan güçlü bir no-code platform'dur. Görsel workflow builder ile dakikalar içinde karmaşık otomasyonlar oluşturabilir, 50+ entegrasyon ile sistemlerinizi birbirine bağlayabilirsiniz."
  },
  {
    question: "Kod yazmadan otomasyon oluşturabilir miyim?",
    answer: "Evet! AutoFlow tamamen no-code bir platformdur. Sürükle-bırak arayüzü ile herhangi bir programlama bilgisi olmadan workflow'lar oluşturabilirsiniz. Teknik ekip gerektirmeden iş süreçlerinizi optimize edebilirsiniz."
  },
  {
    question: "Hangi uygulamalarla entegrasyon yapabilirim?",
    answer: "AutoFlow, Slack, Google Workspace, Salesforce, HubSpot, Stripe, OpenAI ve daha birçok popüler uygulama ile hazır entegrasyonlar sunar. Ayrıca API ve webhook desteği ile özel entegrasyonlar da oluşturabilirsiniz."
  },
  {
    question: "Ücretsiz deneme süresi var mı?",
    answer: "Evet, AutoFlow'u 14 gün boyunca ücretsiz deneyebilirsiniz. Kredi kartı gerektirmez ve tüm özelliklere tam erişim sağlarsınız. Deneme süresinin sonunda planınızı seçebilirsiniz."
  },
  {
    question: "Verilerim güvende mi?",
    answer: "Kesinlikle. AutoFlow, enterprise-grade güvenlik standartlarını karşılar. Verileriniz şifrelenir, GDPR ve SOC 2 uyumluluğu sağlanır. %99.9 uptime garantisi ile kesintisiz hizmet sunuyoruz."
  },
  {
    question: "Destek seçenekleri nelerdir?",
    answer: "Tüm planlarda email desteği sunuyoruz. Pro ve Business planlarında öncelikli destek, canlı chat ve dedicated account manager seçenekleri mevcuttur. Ayrıca kapsamlı dokümantasyon ve topluluk forumu da aktiftir."
  }
];

export const FAQSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-background" id="faq">
      <div className="container max-w-4xl mx-auto px-6">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            SSS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sık Sorulan Sorular
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AutoFlow hakkında merak ettikleriniz
          </p>
        </div>

        <div
          className={`transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-card/50 hover:bg-card/80 transition-colors duration-200"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-5">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
