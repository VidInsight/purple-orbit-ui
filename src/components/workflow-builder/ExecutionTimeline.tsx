import { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Check, X, Loader2, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface TimelineNode {
  nodeId: string;
  nodeName: string;
  nodeIcon: LucideIcon;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
  inputData?: any;
  outputData?: any;
  metadata?: {
    duration_seconds: number;
    completed_at: string;
  };
  errorMessage?: string;
  order: number;
}

interface ExecutionTimelineProps {
  nodes: TimelineNode[];
  totalDuration?: number;
}

export const ExecutionTimeline = ({ nodes, totalDuration }: ExecutionTimelineProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Check className="h-4 w-4 text-success" />;
      case 'FAILED':
        return <X className="h-4 w-4 text-destructive" />;
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'border-success bg-success/5';
      case 'FAILED':
        return 'border-destructive bg-destructive/5';
      case 'RUNNING':
        return 'border-primary bg-primary/5';
      default:
        return 'border-border bg-surface';
    }
  };

  const copyToClipboard = async (data: any, label: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    }
    return `${seconds.toFixed(2)}s`;
  };

  const formatJSON = (data: any): string => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold mb-1">Execution Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Visual flow of node execution with timing and results
          </p>
        </div>
        {totalDuration !== undefined && (
          <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Total: {formatDuration(totalDuration)}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Timeline vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        {/* Timeline nodes */}
        <div className="space-y-0">
          {nodes.map((node, index) => {
            const isExpanded = expandedNodes.has(node.nodeId);
            const NodeIcon = node.nodeIcon;
            const isLast = index === nodes.length - 1;

            return (
              <div key={node.nodeId} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-4 top-6 z-10">
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                    node.status === 'SUCCESS' && "border-success bg-success/20",
                    node.status === 'FAILED' && "border-destructive bg-destructive/20",
                    node.status === 'RUNNING' && "border-primary bg-primary/20",
                    node.status === 'PENDING' && "border-border bg-surface"
                  )}>
                    {getStatusIcon(node.status)}
                  </div>
                </div>

                {/* Node card */}
                <div className="ml-14 mb-6">
                  <button
                    onClick={() => toggleNode(node.nodeId)}
                    className={cn(
                      "w-full text-left border rounded-lg p-4 transition-all duration-200 hover:shadow-md",
                      getStatusColor(node.status)
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Order number */}
                        <div className="flex-shrink-0 w-6 h-6 rounded bg-background border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {node.order}
                        </div>

                        {/* Node icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <NodeIcon className="h-5 w-5 text-primary" />
                        </div>

                        {/* Node info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {node.nodeName}
                            </h3>
                            <span className={cn(
                              "px-2 py-0.5 text-xs font-medium rounded-full",
                              node.status === 'SUCCESS' && "bg-success/20 text-success",
                              node.status === 'FAILED' && "bg-destructive/20 text-destructive",
                              node.status === 'RUNNING' && "bg-primary/20 text-primary",
                              node.status === 'PENDING' && "bg-muted text-muted-foreground"
                            )}>
                              {node.status}
                            </span>
                          </div>

                          {/* Metadata */}
                          {node.metadata && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(node.metadata.duration_seconds)}</span>
                              </div>
                              <span>•</span>
                              <span>
                                {new Date(node.metadata.completed_at).toLocaleTimeString()}
                              </span>
                            </div>
                          )}

                          {/* Error message preview */}
                          {node.status === 'FAILED' && node.errorMessage && !isExpanded && (
                            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                              {node.errorMessage.substring(0, 60)}...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expand icon */}
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 border border-border rounded-lg bg-background overflow-hidden">
                      <div className="space-y-4 p-4">
                        {/* Input Data */}
                        {node.inputData && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold text-foreground">Input</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(node.inputData, 'Input')}
                                className="h-6 px-2 text-xs"
                              >
                                Copy
                              </Button>
                            </div>
                            <pre className="text-xs bg-surface border border-border rounded p-3 overflow-auto max-h-48">
                              {formatJSON(node.inputData)}
                            </pre>
                          </div>
                        )}

                        {/* Output Data */}
                        {node.outputData && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold text-foreground">Output</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(node.outputData, 'Output')}
                                className="h-6 px-2 text-xs"
                              >
                                Copy
                              </Button>
                            </div>
                            <pre className="text-xs bg-surface border border-border rounded p-3 overflow-auto max-h-48">
                              {formatJSON(node.outputData)}
                            </pre>
                          </div>
                        )}

                        {/* Error Details */}
                        {node.status === 'FAILED' && node.errorMessage && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold text-destructive">Error Details</h4>
                            </div>
                            <div className="bg-destructive/5 border border-destructive/20 rounded p-3">
                              <p className="text-xs text-destructive font-mono">
                                {node.errorMessage}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Connection line to next node */}
                {!isLast && (
                  <div className="ml-14 -mt-4 mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span>then</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timeline completion */}
        <div className="relative ml-14 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-success">
            <Check className="h-5 w-5" />
            <span className="font-medium">Execution Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
