import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CreditCard, Sparkles } from 'lucide-react';

const Billing = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <PageHeader
          title="Billing"
          description="Subscription and payment management
"
        />

        <div className="relative mt-12 flex flex-col items-center justify-center min-h-[60vh]">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl blur-3xl -z-10 max-w-2xl mx-auto" />

          <div className="relative flex flex-col items-center text-center max-w-lg mx-auto p-8 sm:p-12 bg-surface/60 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl shadow-primary/5">
            <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <CreditCard className="h-14 w-14 text-primary mx-auto" strokeWidth={1.5} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Coming Soon
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-6">
            We're working on billing and subscription management features. Plans, payment methods, and billing history will be here shortly.            </p>

            <div className="flex items-center gap-2 text-sm text-primary/80">
              <Sparkles className="h-4 w-4" />
              <span>To be added soon</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Billing;
