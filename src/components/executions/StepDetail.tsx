import { useState } from 'react';
import { ExecutionStep } from '@/types/execution';
import { CheckCircle2, XCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface StepDetailProps {
  step: ExecutionStep;
  isLast?: boolean;
}

export const StepDetail = ({ step, isLast = false }: StepDetailProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    const icons = {
      success: <CheckCircle2 className="h-5 w-5 text-success" />,
      failed: <XCircle className="h-5 w-5 text-destructive" />,
      running: <Clock className="h-5 w-5 text-primary animate-spin" />,
      pending: <Clock className="h-5 w-5 text-muted-foreground" />,
      skipped: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
    };
    return icons[status as keyof typeof icons];
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  const formatJSON = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[18px] top-10 w-0.5 h-full bg-border" />
      )}

      <div className="flex gap-4">
        {/* Status icon */}
        <div className="relative z-10 flex-shrink-0 mt-1">
          {getStatusIcon(step.status)}
        </div>

        {/* Step content */}
        <div className="flex-1 pb-8">
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div>
                  <h4 className="text-sm font-medium text-foreground">{step.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.type} • {step.duration ? `${step.duration}ms` : 'Running...'}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 py-3 border-t border-border space-y-4">
                {/* Timing info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Started At</p>
                    <p className="text-foreground font-mono">
                      {step.startedAt ? new Date(step.startedAt).toLocaleTimeString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Completed At</p>
                    <p className="text-foreground font-mono">
                      {step.completedAt ? new Date(step.completedAt).toLocaleTimeString() : '-'}
                    </p>
                  </div>
                </div>

                {/* Input data */}
                {step.input && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Input</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(formatJSON(step.input), 'Input')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <pre className="bg-background rounded-md p-3 text-xs overflow-x-auto border border-border">
                      <code className="text-foreground">{formatJSON(step.input)}</code>
                    </pre>
                  </div>
                )}

                {/* Output data */}
                {step.output && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Output</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(formatJSON(step.output), 'Output')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <pre className="bg-background rounded-md p-3 text-xs overflow-x-auto border border-border">
                      <code className="text-foreground">{formatJSON(step.output)}</code>
                    </pre>
                  </div>
                )}

                {/* Error */}
                {step.error && (
                  <div>
                    <p className="text-xs font-medium text-destructive mb-2">Error</p>
                    <div className="bg-destructive/10 rounded-md p-3 border border-destructive">
                      <p className="text-xs text-destructive font-medium mb-2">
                        {step.error.message}
                      </p>
                      {step.error.stack && (
                        <pre className="text-xs text-destructive/80 whitespace-pre-wrap">
                          {step.error.stack}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
