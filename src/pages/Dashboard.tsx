import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpdatesFeed } from '@/components/dashboard/UpdatesFeed';
import { QuotasWidget } from '@/components/dashboard/QuotasWidget';
import { ExecutionStatsMini } from '@/components/dashboard/ExecutionStatsMini';
import { RecentExecutionsList } from '@/components/dashboard/RecentExecutionsList';
import { RecentWorkflowsList } from '@/components/dashboard/RecentWorkflowsList';
import { ExpiringCredentialsAlert } from '@/components/dashboard/ExpiringCredentialsAlert';

// Mock data - gerçek API'den gelecek
const mockExecutionStats = { success: 142, failed: 8, running: 3 };

const mockRecentExecutions = [
  { id: '1', workflow_name: 'Email Notification Flow', status: 'COMPLETED' as const, started_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '2', workflow_name: 'Data Sync Pipeline', status: 'FAILED' as const, started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '3', workflow_name: 'Report Generator', status: 'RUNNING' as const, started_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { id: '4', workflow_name: 'User Onboarding', status: 'COMPLETED' as const, started_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: '5', workflow_name: 'Slack Notifier', status: 'COMPLETED' as const, started_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
];

const mockRecentWorkflows = [
  { id: '1', name: 'Email Notification Flow', status: 'active' as const, updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: '2', name: 'Data Sync Pipeline', status: 'active' as const, updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '3', name: 'Report Generator', status: 'draft' as const, updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: '4', name: 'User Onboarding', status: 'inactive' as const, updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: '5', name: 'Slack Notifier', status: 'active' as const, updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

const mockExpiringCredentials = [
  { id: '1', name: 'OpenAI API Key', service: 'OpenAI', daysUntilExpiry: 5 },
  { id: '2', name: 'Slack Bot Token', service: 'Slack', daysUntilExpiry: 12 },
];

const Dashboard = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px]">
        <PageHeader
          title="Dashboard"
          description="Overview of your automation workspace"
        />

        <div className="flex gap-8">
          {/* Left Side - Main Content */}
          <div className="flex-1 space-y-6">
            <ExecutionStatsMini stats={mockExecutionStats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentExecutionsList executions={mockRecentExecutions} />
              <RecentWorkflowsList workflows={mockRecentWorkflows} />
            </div>

            {mockExpiringCredentials.length > 0 && (
              <ExpiringCredentialsAlert credentials={mockExpiringCredentials} />
            )}
          </div>

          {/* Right Side - Quotas & Updates (Sticky) */}
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
