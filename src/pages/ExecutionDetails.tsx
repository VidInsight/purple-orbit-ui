import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExecutionOverview } from '@/components/executions/ExecutionOverview';
import { ExecutionTimeline } from '@/components/executions/ExecutionTimeline';
import { ExecutionLogs } from '@/components/executions/ExecutionLogs';
import { ExecutionDetails as ExecutionDetailsType, ExecutionStep } from '@/types/execution';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Download, Share2, CheckCircle, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getExecution } from '@/services/workflowApi';

const ExecutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [execution, setExecution] = useState<ExecutionDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadExecution = async () => {
    if (!id) {
      navigate('/executions');
      return;
    }

    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not selected',
        variant: 'destructive',
      });
      navigate('/executions');
      return;
    }

    try {
      setIsLoading(true);
      const response = await getExecution(currentWorkspace.id, id);

      // Map API response to ExecutionDetails type
      const apiData = response.data;

      // Map status from API format to ExecutionDetails format
      const statusMap: Record<string, 'success' | 'failed' | 'running' | 'cancelled'> = {
        'COMPLETED': 'success',
        'FAILED': 'failed',
        'RUNNING': 'running',
        'CANCELLED': 'cancelled',
      };

      const mappedStatus = statusMap[apiData.status] || 'failed';

      // Map results to steps
      const steps: ExecutionStep[] = [];
      
      if (apiData.results) {
        Object.entries(apiData.results).forEach(([nodeId, result]: [string, any]) => {
          const stepStatusMap: Record<string, 'pending' | 'running' | 'success' | 'failed' | 'skipped'> = {
            'SUCCESS': 'success',
            'FAILED': 'failed',
            'RUNNING': 'running',
            'PENDING': 'pending',
            'SKIPPED': 'skipped',
          };

          const stepStatus = stepStatusMap[result.status] || 'failed';

          steps.push({
            id: nodeId,
            name: `Node ${nodeId.substring(0, 8)}`,
            type: 'action', // Default to action, could be determined from workflow definition
            status: stepStatus,
            duration: result.duration_seconds,
            input: result.result_data?.inputs || {},
            output: result.result_data || {},
            error: result.error_message
              ? {
                  message: result.error_message,
                  stack: JSON.stringify(result.error_details || {}),
                }
              : undefined,
          });
        });
      }

      const executionData: ExecutionDetailsType = {
        id: apiData.id,
        workflowId: apiData.workflow_id,
        workflowName: apiData.workflow_id, // TODO: Fetch workflow name if needed
        status: mappedStatus,
        startedAt: apiData.started_at,
        completedAt: apiData.ended_at || undefined,
        duration: apiData.duration,
        triggeredBy: apiData.triggered_by || 'Unknown',
        steps: steps,
        logs: [], // API doesn't provide logs in this response
        metadata: {
          trigger_id: apiData.trigger_id,
          trigger_data: apiData.trigger_data,
          retry_count: apiData.retry_count,
          max_retries: apiData.max_retries,
          is_retry: apiData.is_retry,
          created_at: apiData.created_at,
        },
      };

      setExecution(executionData);
    } catch (error) {
      console.error('Error loading execution details:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load execution details',
        variant: 'destructive',
      });
      navigate('/executions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExecution();
  }, [id, currentWorkspace?.id]);

  // Real-time updates for running executions
  useEffect(() => {
    if (!execution || execution.status !== 'running' || !id || !currentWorkspace?.id) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await getExecution(currentWorkspace.id, id);
        const apiData = response.data;
        
        const statusMap: Record<string, 'success' | 'failed' | 'running' | 'cancelled'> = {
          'COMPLETED': 'success',
          'FAILED': 'failed',
          'RUNNING': 'running',
          'CANCELLED': 'cancelled',
        };
        
        const mappedStatus = statusMap[apiData.status] || 'failed';
        
        // Reload if status changed or still running
        if (mappedStatus !== execution.status) {
          loadExecution();
        }
      } catch (error) {
        console.error('Error checking execution status:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [execution?.status, id, currentWorkspace?.id]);

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

  // Get the final result from the last completed step
  const getFinalResult = () => {
    if (!execution || !execution.steps || execution.steps.length === 0) {
      return null;
    }

    // Find the last completed step with output
    const completedSteps = execution.steps.filter(
      (step) => step.status === 'success' && step.output
    );

    if (completedSteps.length === 0) {
      return null;
    }

    // Get the last step's output
    const lastStep = completedSteps[completedSteps.length - 1];
    const output = lastStep.output;

    // If output has a 'result' field, return only that
    if (output && typeof output === 'object' && 'result' in output) {
      return output.result;
    }

    // If output has a 'result_data' field with 'result' inside, return that
    if (output && typeof output === 'object' && 'result_data' in output) {
      const resultData = output.result_data;
      if (resultData && typeof resultData === 'object' && 'result' in resultData) {
        return resultData.result;
      }
    }

    // Otherwise return the full output
    return output;
  };

  const finalResult = getFinalResult();

  const formatJSON = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const handleCopyResult = () => {
    if (!finalResult) return;
    const resultText = formatJSON(finalResult);
    navigator.clipboard.writeText(resultText);
    toast({
      title: 'Copied',
      description: 'Final result copied to clipboard',
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

          {/* Final Result */}
          {finalResult && (
            <div>
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border-2 border-primary/20 p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Final Result</h3>
                      <p className="text-sm text-muted-foreground">
                        En son tamamlanan adımın çıktısı
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyResult}
                    className="hover:bg-primary/10"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-background/80 rounded-lg p-4 border border-border/50 overflow-auto max-h-[400px]">
                  <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words m-0">
                    {formatJSON(finalResult)}
                  </pre>
                </div>
              </div>
            </div>
          )}

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
