import { Clock, CheckCircle2, XCircle, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestSummaryCardProps {
  totalNodes: number;
  successfulNodes: number;
  failedNodes: number;
  totalDuration: number;
  averageNodeTime: number;
}

export const TestSummaryCard = ({
  totalNodes,
  successfulNodes,
  failedNodes,
  totalDuration,
  averageNodeTime,
}: TestSummaryCardProps) => {
  const successRate = totalNodes > 0 ? (successfulNodes / totalNodes) * 100 : 0;

  const formatDuration = (seconds: number) => {
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    }
    return `${seconds.toFixed(2)}s`;
  };

  const metrics = [
    {
      label: 'Total Duration',
      value: formatDuration(totalDuration),
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Success Rate',
      value: `${successRate.toFixed(0)}%`,
      icon: CheckCircle2,
      color: successRate >= 80 ? 'text-success' : successRate >= 50 ? 'text-warning' : 'text-destructive',
      bgColor: successRate >= 80 ? 'bg-success/10' : successRate >= 50 ? 'bg-warning/10' : 'bg-destructive/10',
    },
    {
      label: 'Average Node Time',
      value: formatDuration(averageNodeTime),
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Successful Nodes',
      value: successfulNodes.toString(),
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Failed Nodes',
      value: failedNodes.toString(),
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Test Execution Summary</h2>
          <p className="text-sm text-muted-foreground">
            Overview of workflow test performance and metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg', metric.bgColor)}>
                  <Icon className={cn('h-4 w-4', metric.color)} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className={cn('text-2xl font-bold', metric.color)}>
                  {metric.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Execution Progress</span>
          <span className="text-xs font-medium text-foreground">
            {successfulNodes} / {totalNodes} completed
          </span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div className="flex h-full">
            <div
              className="bg-success transition-all duration-300"
              style={{ width: `${(successfulNodes / totalNodes) * 100}%` }}
            />
            <div
              className="bg-destructive transition-all duration-300"
              style={{ width: `${(failedNodes / totalNodes) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Success ({successfulNodes})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Failed ({failedNodes})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
