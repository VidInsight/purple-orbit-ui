import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "FlowMaster platformu nedir ve nasıl çalışır?",
    answer: "FlowMaster, kurumsal iş süreçlerinizi otomatikleştirmenizi sağlayan enterprise düzeyde bir otomasyon platformudur. Görsel süreç tasarımcısı ile teknik bilgi gerektirmeden karmaşık iş akışları oluşturabilir, 50+ hazır entegrasyon ile mevcut sistemlerinizi sorunsuz şekilde bağlayabilirsiniz."
  },
  {
    question: "Teknik bilgi olmadan otomasyon süreçleri oluşturabilir miyim?",
    answer: "Evet. FlowMaster, sezgisel sürükle-bırak arayüzü sayesinde programlama bilgisi gerektirmeden iş akışları oluşturmanıza olanak tanır. İş analistleri ve süreç yöneticileri, teknik ekip desteği olmaksızın operasyonel süreçleri optimize edebilir."
  },
  {
    question: "Hangi kurumsal uygulamalarla entegrasyon sağlanmaktadır?",
    answer: "FlowMaster; Slack, Google Workspace, Salesforce, HubSpot, Stripe, OpenAI ve daha birçok kurumsal uygulama ile hazır entegrasyonlar sunmaktadır. Ayrıca REST API ve webhook desteği ile özel entegrasyonlar da geliştirilebilir."
  },
  {
    question: "Ücretsiz değerlendirme süreci mevcut mudur?",
    answer: "Evet. FlowMaster platformunu 14 gün boyunca tüm özellikleriyle ücretsiz değerlendirebilirsiniz. Deneme süreci için kredi kartı bilgisi talep edilmez. Değerlendirme sonrasında kurumsal ihtiyaçlarınıza uygun lisans planını seçebilirsiniz."
  },
  {
    question: "Veri güvenliği ve uyumluluk standartları nelerdir?",
    answer: "FlowMaster, enterprise düzeyde güvenlik standartlarını karşılamaktadır. Tüm veriler uçtan uca şifrelenir. Platform, GDPR ve SOC 2 Type II uyumluluğuna sahiptir. %99.9 çalışma süresi garantisi ile kesintisiz hizmet sunulmaktadır."
  },
  {
    question: "Teknik destek seçenekleri nelerdir?",
    answer: "Tüm lisans planlarında e-posta desteği sağlanmaktadır. Pro ve Business planlarında öncelikli destek, canlı sohbet ve özel müşteri temsilcisi hizmetleri mevcuttur. Ayrıca kapsamlı teknik dokümantasyon ve kullanıcı topluluğu forumu aktif olarak hizmet vermektedir."
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
            Sıkça Sorulan Sorular
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Bilmeniz Gerekenler
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            FlowMaster platformu hakkında sık sorulan sorular ve yanıtları
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
