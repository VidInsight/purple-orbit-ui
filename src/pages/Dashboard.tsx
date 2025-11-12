import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpdatesFeed } from '@/components/dashboard/UpdatesFeed';
import { QuotasWidget } from '@/components/dashboard/QuotasWidget';
import { ExecutionSuccessChart } from '@/components/dashboard/ExecutionSuccessChart';
import { PeakUsageChart } from '@/components/dashboard/PeakUsageChart';
import { ExpiringCredentialsAlert } from '@/components/dashboard/ExpiringCredentialsAlert';
import { QuotaWarningsCard } from '@/components/dashboard/QuotaWarningsCard';
import {
  generateExecutionStats,
  generatePeakUsageData,
  generateExpiringCredentials,
  generateQuotaWarnings,
  ExecutionStats,
  PeakUsageData,
  ExpiringCredential,
  QuotaWarning,
} from '@/utils/dashboardData';

const Dashboard = () => {
  const [executionStats, setExecutionStats] = useState<ExecutionStats | null>(null);
  const [peakUsageData, setPeakUsageData] = useState<PeakUsageData[]>([]);
  const [expiringCredentials, setExpiringCredentials] = useState<ExpiringCredential[]>([]);
  const [quotaWarnings, setQuotaWarnings] = useState<QuotaWarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setExecutionStats(generateExecutionStats());
    setPeakUsageData(generatePeakUsageData());
    setExpiringCredentials(generateExpiringCredentials());
    setQuotaWarnings(generateQuotaWarnings());
    setIsLoading(false);
  };

  // Loading Skeleton
  if (isLoading || !executionStats) {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-[1400px] px-6 py-8">
          <PageHeader title="Dashboard" description="Overview of your automation workspace" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-surface rounded-lg border border-border p-6 animate-pulse h-[400px]"
                  >
                    <div className="h-6 bg-muted rounded w-32 mb-4" />
                    <div className="h-4 bg-muted rounded w-48" />
                  </div>
                ))}
              </div>
              <div className="bg-surface rounded-lg border border-border p-6 animate-pulse h-[200px]">
                <div className="h-6 bg-muted rounded w-40 mb-4" />
              </div>
              <div className="bg-surface rounded-lg border border-border p-6 animate-pulse h-[200px]">
                <div className="h-6 bg-muted rounded w-32 mb-4" />
              </div>
            </div>
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-lg border border-border p-6 animate-pulse h-[300px]"
                >
                  <div className="h-6 bg-muted rounded w-32 mb-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Dashboard"
          description="Overview of your automation workspace"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExecutionSuccessChart data={executionStats} />
              <PeakUsageChart data={peakUsageData} />
            </div>

            {/* Alerts */}
            <ExpiringCredentialsAlert credentials={expiringCredentials} />
            
            <QuotaWarningsCard quotas={quotaWarnings} />
          </div>

          {/* Right Side - Updates & Quotas */}
          <div className="space-y-6">
            <UpdatesFeed />
            <QuotasWidget />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
