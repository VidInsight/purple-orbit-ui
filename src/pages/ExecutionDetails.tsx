import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExecutionOverview } from '@/components/executions/ExecutionOverview';
import { ExecutionTimeline } from '@/components/executions/ExecutionTimeline';
import { ExecutionLogs } from '@/components/executions/ExecutionLogs';
import { ExecutionDetails as ExecutionDetailsType } from '@/types/execution';
import { generateMockExecutionDetails } from '@/utils/mockExecutionData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Download, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ExecutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<ExecutionDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExecution = () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        if (!id) {
          navigate('/executions');
          return;
        }

        // Generate mock data based on ID pattern
        let status: 'success' | 'failed' | 'running' = 'success';
        if (id.includes('fail')) status = 'failed';
        if (id.includes('run')) status = 'running';

        const executionData = generateMockExecutionDetails(id, status);
        setExecution(executionData);
        setIsLoading(false);
      }, 800);
    };

    loadExecution();

    // Simulate real-time updates for running executions
    if (execution?.status === 'running') {
      const interval = setInterval(() => {
        // In a real app, this would fetch latest status from API
        console.log('Checking for execution updates...');
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [id, navigate]);

  const handleRerun = () => {
    toast({
      title: 'Execution Started',
      description: 'Re-running workflow execution...',
    });
  };

  const handleDownload = () => {
    if (!execution) return;

    const report = {
      execution,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${execution.id}-report.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Report Downloaded',
      description: 'Execution report has been downloaded.',
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Execution link copied to clipboard.',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      success: 'bg-success/10 text-success border-success',
      failed: 'bg-destructive/10 text-destructive border-destructive',
      running: 'bg-primary/10 text-primary border-primary',
      cancelled: 'bg-muted text-muted-foreground border-muted',
    };
    return colors[status as keyof typeof colors];
  };

  if (isLoading || !execution) {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-[1400px] px-6 py-8">
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading execution details...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/executions')}
            className="mb-4 hover:translate-x-1 transition-transform duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Executions
          </Button>

          <PageHeader
            title="Execution Details"
            description={`ID: ${execution.id}`}
            actions={
              <>
                <span
                  className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mr-4',
                    getStatusBadgeColor(execution.status)
                  )}
                >
                  {execution.status}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleRerun}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-run
                  </Button>
                </div>
              </>
            }
          />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview */}
          <div>
            <ExecutionOverview execution={execution} />
          </div>

          {/* Timeline */}
          <div>
            <ExecutionTimeline steps={execution.steps} />
          </div>

          {/* Logs */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Execution Logs</h3>
            <ExecutionLogs logs={execution.logs} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ExecutionDetails;
