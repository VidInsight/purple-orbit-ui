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

        <div className="flex gap-6">
          {/* Left Side - Empty for now */}
          <div className="flex-1">
            {/* Content removed */}
          </div>

          {/* Right Side - Quotas & Updates (Sticky) - Fixed width to match sidebar */}
          <div className="w-64 space-y-6 sticky top-6 self-start flex-shrink-0">
            <QuotasWidget />
            <UpdatesFeed />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
