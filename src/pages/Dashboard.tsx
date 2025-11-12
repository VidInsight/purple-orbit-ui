import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpdatesFeed } from '@/components/dashboard/UpdatesFeed';
import { QuotasWidget } from '@/components/dashboard/QuotasWidget';

const Dashboard = () => {

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Dashboard"
          description="Overview of your automation workspace"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Side - Empty for now */}
          <div className="lg:col-span-2">
            {/* Content removed */}
          </div>

          {/* Right Side - Updates & Quotas (Sticky) */}
          <div className="space-y-6 sticky top-6 self-start">
            <UpdatesFeed />
            <QuotasWidget />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
