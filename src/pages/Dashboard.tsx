import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpdatesFeed } from '@/components/dashboard/UpdatesFeed';
import { QuotasWidget } from '@/components/dashboard/QuotasWidget';
import {
  generateDashboardStats,
  generateRecentWorkflows,
  generateRecentExecutions,
  DashboardStats,
  RecentWorkflow,
  RecentExecution,
} from '@/utils/dashboardData';
import { Workflow, PlayCircle, Key, HardDrive } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentWorkflows, setRecentWorkflows] = useState<RecentWorkflow[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setStats(generateDashboardStats());
    setRecentWorkflows(generateRecentWorkflows());
    setRecentExecutions(generateRecentExecutions());
    setIsLoading(false);
  };

  const handleCreateWorkflow = () => {
    toast({
      title: 'Create Workflow',
      description: 'Opening workflow creator...',
    });
    navigate('/workflows');
  };

  const handleViewWorkflows = () => {
    navigate('/workflows');
  };

  const handleViewExecutions = () => {
    navigate('/executions');
  };

  const handleManageCredentials = () => {
    navigate('/credentials');
  };

  // Loading Skeleton
  if (isLoading || !stats) {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-[1400px] px-6 py-8">
          <PageHeader title="Dashboard" description="Overview of your automation workspace" />
          
          <div className="space-y-6">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-lg border border-border p-6 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-24 mb-4" />
                  <div className="h-8 bg-muted rounded w-16 mb-2" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
              ))}
            </div>

            {/* Activity Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-lg border border-border p-6 animate-pulse"
                >
                  <div className="h-6 bg-muted rounded w-32 mb-4" />
                  <div className="space-y-3">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-12 bg-muted rounded" />
                    ))}
                  </div>
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                icon={Workflow}
                label="Total Workflows"
                value={stats.totalWorkflows}
                trend={{
                  value: stats.trends.workflows,
                  isPositive: true,
                }}
                iconBgColor="bg-primary"
                iconColor="text-primary-foreground"
              />

              <StatCard
                icon={PlayCircle}
                label="Active Executions"
                value={stats.activeExecutions}
                trend={{
                  value: stats.trends.executions,
                  isPositive: true,
                }}
                iconBgColor="bg-success"
                iconColor="text-success-foreground"
              />

              <StatCard
                icon={Key}
                label="Total Credentials"
                value={stats.totalCredentials}
                trend={{
                  value: stats.trends.credentials,
                  isPositive: true,
                }}
                iconBgColor="bg-accent"
                iconColor="text-accent-foreground"
              />

              <StatCard
                icon={HardDrive}
                label="Storage Used"
                value={stats.storageUsed}
                trend={{
                  value: stats.trends.storage,
                  isPositive: true,
                }}
                iconBgColor="bg-warning"
                iconColor="text-warning-foreground"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 gap-6">
              <RecentActivityList
                title="Recent Workflows"
                items={recentWorkflows}
                onViewAll={handleViewWorkflows}
                emptyMessage="No workflows yet"
              />

              <RecentActivityList
                title="Recent Executions"
                items={recentExecutions}
                onViewAll={handleViewExecutions}
                emptyMessage="No executions yet"
              />
            </div>

            {/* Quick Actions */}
            <QuickActions
              onCreateWorkflow={handleCreateWorkflow}
              onViewWorkflows={handleViewWorkflows}
              onViewExecutions={handleViewExecutions}
              onManageCredentials={handleManageCredentials}
            />
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
