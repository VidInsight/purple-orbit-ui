import { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  TrendingUp, 
  Clock, 
  Zap, 
  Activity,
  BarChart3,
  ArrowRight,
  Play,
  Plus,
  Key,
  Database,
  FileText,
  Workflow,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getCredentials } from '@/services/credentialsApi';
import { getExecutions, ExecutionApiItem } from '@/services/executionsApi';
import { getWorkspaceUsageQuotas, WorkspaceUsageQuotas } from '@/services/billingApi';
import { getWorkflows } from '@/services/workflowApi';
import { CredentialItem } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useCountUp } from '@/hooks/useCountUp';

interface ExecutionStats {
  success: number;
  failed: number;
  running: number;
  total: number;
  avgDuration: number;
  successRate: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [executionStats, setExecutionStats] = useState<ExecutionStats>({ 
    success: 0, 
    failed: 0, 
    running: 0,
    total: 0,
    avgDuration: 0,
    successRate: 0
  });
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(false);
  const [usageQuotas, setUsageQuotas] = useState<WorkspaceUsageQuotas | null>(null);
  const [isLoadingUsageQuotas, setIsLoadingUsageQuotas] = useState(false);
  const [recentExecutions, setRecentExecutions] = useState<ExecutionApiItem[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [executionTrendData, setExecutionTrendData] = useState<any[]>([]);

  // Animated counters - using direct values for now to ensure count displays correctly
  const successCount = executionStats.success;
  const failedCount = executionStats.failed;
  const runningCount = executionStats.running;
  const totalCount = executionStats.total;

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadCredentials();
      loadExecutions();
      loadUsageQuotas();
      loadWorkflows();
    }
  }, [currentWorkspace]);

  const quickActions: QuickAction[] = [
    { id: 'workflow', label: 'New Workflow', icon: Plus, path: '/workflows/new', color: 'text-primary' },
    { id: 'credential', label: 'Add Credential', icon: Key, path: '/credentials?create=true', color: 'text-success' },
    { id: 'database', label: 'Add Database', icon: Database, path: '/databases?create=true', color: 'text-warning' },
    { id: 'file', label: 'Upload File', icon: FileText, path: '/files?upload=true', color: 'text-info' },
  ];

  const loadCredentials = async () => {
    if (!currentWorkspace?.id) {
      setCredentials([]);
      return;
    }

    try {
      setIsLoadingCredentials(true);
      const response = await getCredentials(currentWorkspace.id);
      const credentialsData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.items || response.data?.credentials || [];

      const mappedCredentials: CredentialItem[] = credentialsData.map((cred: any) => ({
        id: cred.id || cred.credential_id || `credential-${Date.now()}`,
        name: cred.name || cred.credential_name || 'Unnamed Credential',
        description: cred.description || cred.credential_description,
        type: cred.type || cred.credential_type || 'unknown',
        createdAt: cred.created_at || cred.createdAt || new Date().toISOString(),
        updatedAt: cred.updated_at || cred.updatedAt || new Date().toISOString(),
        lastUsed: cred.last_used || cred.lastUsed || cred.last_used_at,
      }));

      setCredentials(mappedCredentials);
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load credentials',
        variant: 'destructive',
      });
      setCredentials([]);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const loadExecutions = async () => {
    if (!currentWorkspace?.id) {
      setExecutionStats({ success: 0, failed: 0, running: 0, total: 0, avgDuration: 0, successRate: 0 });
      return;
    }

    try {
      setIsLoadingExecutions(true);
      const response = await getExecutions(currentWorkspace.id);
      const executions = response.data?.executions || [];
      
      // Use count from API response, fallback to executions.length if count is not available
      // Check if count exists and is a valid number
      const apiCount = response.data?.count;
      const totalCount = (typeof apiCount === 'number' && apiCount >= 0) 
        ? apiCount 
        : executions.length;

      const statusMap: Record<string, 'success' | 'failed' | 'running'> = {
        'COMPLETED': 'success',
        'FAILED': 'failed',
        'RUNNING': 'running',
        'CANCELLED': 'failed',
      };

      const stats: ExecutionStats = {
        success: 0,
        failed: 0,
        running: 0,
        total: totalCount,
        avgDuration: 0,
        successRate: 0,
      };

      let totalDuration = 0;
      let completedCount = 0;

      executions.forEach((execution: ExecutionApiItem) => {
        const mappedStatus = statusMap[execution.status];
        if (mappedStatus === 'success') {
          stats.success++;
        } else if (mappedStatus === 'failed') {
          stats.failed++;
        } else if (mappedStatus === 'running') {
          stats.running++;
        }

        if (execution.duration && execution.status === 'COMPLETED') {
          totalDuration += execution.duration;
          completedCount++;
        }
      });

      stats.avgDuration = completedCount > 0 ? Math.round(totalDuration / completedCount) : 0;
      stats.successRate = stats.total > 0 
        ? Math.round((stats.success / stats.total) * 100) 
        : 0;

      setExecutionStats(stats);

      // Set recent executions (last 10)
      const sortedExecutions = [...executions]
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
        .slice(0, 10);
      setRecentExecutions(sortedExecutions);

      // Generate trend data (last 7 days)
      const trendData = generateTrendData(executions);
      setExecutionTrendData(trendData);
    } catch (error) {
      console.error('Error loading executions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load execution statistics',
        variant: 'destructive',
      });
      setExecutionStats({ success: 0, failed: 0, running: 0, total: 0, avgDuration: 0, successRate: 0 });
    } finally {
      setIsLoadingExecutions(false);
    }
  };

  const generateTrendData = (executions: ExecutionApiItem[]) => {
    const days = 7;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayExecutions = executions.filter((exec) => {
        const execDate = new Date(exec.started_at);
        return execDate >= dayStart && execDate <= dayEnd;
      });

      const success = dayExecutions.filter((e) => e.status === 'COMPLETED').length;
      const failed = dayExecutions.filter((e) => e.status === 'FAILED' || e.status === 'CANCELLED').length;

      data.push({
        date: dateStr,
        success,
        failed,
        total: dayExecutions.length,
      });
    }

    return data;
  };

  const loadUsageQuotas = async () => {
    if (!currentWorkspace?.id) {
      setUsageQuotas(null);
      return;
    }

    try {
      setIsLoadingUsageQuotas(true);
      const response = await getWorkspaceUsageQuotas(currentWorkspace.id);
      setUsageQuotas(response.data);
    } catch (error) {
      console.error('Error loading usage and quotas:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load usage and quotas',
        variant: 'destructive',
      });
      setUsageQuotas(null);
    } finally {
      setIsLoadingUsageQuotas(false);
    }
  };

  const loadWorkflows = async () => {
    if (!currentWorkspace?.id) {
      setWorkflows([]);
      return;
    }

    try {
      setIsLoadingWorkflows(true);
      const response = await getWorkflows(currentWorkspace.id);
      const workflowsData = response.data?.workflows || response.data?.items || [];
      setWorkflows(Array.isArray(workflowsData) ? workflowsData : []);
    } catch (error) {
      console.error('Error loading workflows:', error);
      setWorkflows([]);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1600px] px-4 py-6 space-y-6">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <PageHeader
              title="Dashboard"
              description="Real-time overview of your automation workspace"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(action.path)}
                  className="gap-2"
                >
                  <Icon className={`h-4 w-4 ${action.color}`} />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Executions */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Executions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalCount}</div>
              <p className="text-xs text-muted-foreground mt-1">All time executions</p>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card className="relative overflow-hidden border-2 hover:border-success/50 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{executionStats.successRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {successCount} successful, {failedCount} failed
              </p>
            </CardContent>
          </Card>

          {/* Running Executions */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Running Now</CardTitle>
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{runningCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Active executions</p>
            </CardContent>
          </Card>

          {/* Average Duration */}
          <Card className="relative overflow-hidden border-2 hover:border-warning/50 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {executionStats.avgDuration > 0 ? formatDuration(executionStats.avgDuration) : '0s'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per execution</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Execution Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Execution Trends
                  </CardTitle>
                  <CardDescription>Last 7 days performance</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/executions')}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingExecutions ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : executionTrendData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={executionTrendData}>
                      <defs>
                        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="success"
                        stroke="hsl(var(--success))"
                        fillOpacity={1}
                        fill="url(#colorSuccess)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="failed"
                        stroke="hsl(var(--destructive))"
                        fillOpacity={1}
                        fill="url(#colorFailed)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No execution data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats & Quotas */}
          <Card className="space-y-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Workflows */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10">
                    <Workflow className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Workflows</p>
                    <p className="text-xs text-muted-foreground">
                      {isLoadingWorkflows ? 'Loading...' : `${workflows.length} active`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/workflows')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Credentials */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-success/10">
                    <Key className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Credentials</p>
                    <p className="text-xs text-muted-foreground">
                      {isLoadingCredentials ? 'Loading...' : `${credentials.length} configured`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/credentials')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Usage Quotas Preview */}
              {usageQuotas && (
                <div className="pt-4 border-t space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usage This Month
                  </p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Executions</span>
                        <span className="font-medium">
                          {usageQuotas.current_month_executions} / {usageQuotas.monthly_execution_limit}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (usageQuotas.current_month_executions / usageQuotas.monthly_execution_limit) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Storage</span>
                        <span className="font-medium">
                          {Math.round(usageQuotas.current_storage_mb / 1024 * 10) / 10} / {Math.round(usageQuotas.storage_limit_mb / 1024 * 10) / 10} GB
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (usageQuotas.current_storage_mb / usageQuotas.storage_limit_mb) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Executions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Executions
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/executions')}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingExecutions ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentExecutions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No executions yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/workflows')}
                  >
                    Create Your First Workflow
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentExecutions.slice(0, 5).map((execution) => (
                    <div
                      key={execution.id}
                      onClick={() => navigate(`/executions/${execution.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface/50 hover:bg-accent/50 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getStatusIcon(execution.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            Execution #{execution.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(execution.started_at), { addSuffix: true })}
                            {execution.duration && ` • ${formatDuration(execution.duration)}`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          execution.status === 'COMPLETED'
                            ? 'default'
                            : execution.status === 'FAILED'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="ml-2"
                      >
                        {execution.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Workflows */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Recent Workflows
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/workflows')}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingWorkflows ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No workflows yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/workflows/new')}
                  >
                    Create Your First Workflow
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {workflows.slice(0, 5).map((workflow) => (
                    <div
                      key={workflow.id}
                      onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface/50 hover:bg-accent/50 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded bg-primary/10">
                          <Workflow className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {workflow.name || 'Unnamed Workflow'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {workflow.updated_at &&
                              formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={workflow.status === 'active' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {workflow.status || 'draft'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credentials Section */}
        {credentials.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Credentials
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/credentials')}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {credentials.slice(0, 6).map((credential) => (
                  <div
                    key={credential.id}
                    onClick={() => navigate('/credentials')}
                    className="p-4 rounded-lg border bg-surface/50 hover:bg-accent/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded bg-success/10 group-hover:bg-success/20 transition-colors">
                        <Key className="h-4 w-4 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {credential.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {credential.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Dashboard;
