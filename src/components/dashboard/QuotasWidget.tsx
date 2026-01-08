import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageBar } from '@/components/billing/UsageBar';
import { WorkspaceUsageQuotas } from '@/services/billingApi';
import { Calendar } from 'lucide-react';

interface QuotasWidgetProps {
  usageQuotas: WorkspaceUsageQuotas | null;
  isLoading?: boolean;
}

export const QuotasWidget = ({ usageQuotas, isLoading = false }: QuotasWidgetProps) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-surface/50 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Usage & Quotas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-2 w-full bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageQuotas) return null;

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
          {formatDate(usageQuotas.current_period_start)} - {formatDate(usageQuotas.current_period_end)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Resources
          </div>
          
          <UsageBar
            label="Team Members"
            used={usageQuotas.current_member_count}
            limit={usageQuotas.member_limit}
          />
          
          <UsageBar
            label="Workflows"
            used={usageQuotas.current_workflow_count}
            limit={usageQuotas.workflow_limit}
          />
          
          <UsageBar
            label="Custom Scripts"
            used={usageQuotas.current_custom_script_count}
            limit={usageQuotas.custom_script_limit}
          />
          
          <UsageBar
            label="API Keys"
            used={usageQuotas.current_api_key_count}
            limit={usageQuotas.api_key_limit}
          />
          
          <UsageBar
            label="Storage"
            used={Math.round(usageQuotas.current_storage_mb / 1024 * 10) / 10}
            limit={Math.round(usageQuotas.storage_limit_mb / 1024 * 10) / 10}
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
            used={usageQuotas.current_month_executions}
            limit={usageQuotas.monthly_execution_limit}
          />
          
          <UsageBar
            label="Concurrent Executions"
            used={usageQuotas.current_month_concurrent_executions}
            limit={usageQuotas.monthly_concurrent_executions}
          />
        </div>
      </CardContent>
    </Card>
  );
};
