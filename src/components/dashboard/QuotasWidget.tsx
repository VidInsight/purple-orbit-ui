import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageBar } from '@/components/billing/UsageBar';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Calendar } from 'lucide-react';

export const QuotasWidget = () => {
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-surface/50 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Usage & Quotas
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs">
          <Calendar className="w-3 h-3" />
          {formatDate(currentWorkspace.current_period_start)} - {formatDate(currentWorkspace.current_period_end)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Resources
          </div>
          
          <UsageBar
            label="Team Members"
            used={currentWorkspace.current_member_count}
            limit={currentWorkspace.member_limit}
          />
          
          <UsageBar
            label="Workflows"
            used={currentWorkspace.current_workflow_count}
            limit={currentWorkspace.workflow_limit}
          />
          
          <UsageBar
            label="Custom Scripts"
            used={currentWorkspace.current_custom_script_count}
            limit={currentWorkspace.custom_script_limit}
          />
          
          <UsageBar
            label="API Keys"
            used={currentWorkspace.current_api_key_count}
            limit={currentWorkspace.api_key_limit}
          />
          
          <UsageBar
            label="Storage"
            used={Math.round(currentWorkspace.current_storage_mb / 1024 * 10) / 10}
            limit={Math.round(currentWorkspace.storage_limit_mb / 1024 * 10) / 10}
            unit="GB"
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="space-y-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Executions (This Month)
          </div>
          
          <UsageBar
            label="Total Executions"
            used={currentWorkspace.current_month_executions}
            limit={currentWorkspace.monthly_execution_limit}
          />
          
          <UsageBar
            label="Concurrent Executions"
            used={currentWorkspace.current_month_concurrent_executions}
            limit={currentWorkspace.monthly_concurrent_executions}
          />
        </div>
      </CardContent>
    </Card>
  );
};
