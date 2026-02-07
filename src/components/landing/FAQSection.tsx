import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "What is Qbitra and how does it work?",
    answer: "Qbitra is a powerful no-code platform that lets you automate your business processes. Create complex automations in minutes with the visual workflow builder and connect your systems with 50+ integrations."
  },
  {
    question: "Can I create automations without writing code?",
    answer: "Yes! Qbitra is a fully no-code platform. Build workflows with the drag-and-drop interface without any programming knowledge. Optimize your business processes without needing a technical team."
  },
  {
    question: "What apps can I integrate with?",
    answer: "Qbitra offers ready integrations with Slack, Google Workspace, Salesforce, HubSpot, Stripe, OpenAI, and many other popular apps. You can also create custom integrations with API and webhook support."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, you can try Qbitra free for 14 days. No credit card required, with full access to all features. Choose your plan when the trial ends."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. Qbitra meets enterprise-grade security standards. Your data is encrypted, with GDPR and SOC 2 compliance. We offer uninterrupted service with a 99.9% uptime guarantee."
  },
  {
    question: "What support options are available?",
    answer: "We offer email support on all plans. Pro and Business plans include priority support, live chat, and dedicated account manager options. Comprehensive documentation and community forum are also available."
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
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you want to know about Qbitra
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
