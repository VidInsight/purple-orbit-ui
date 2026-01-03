import { useState } from 'react';
import { LucideIcon, Copy, Check, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TestResultCardProps {
  nodeId: string;
  nodeName: string;
  nodeIcon: LucideIcon;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  inputData?: Record<string, any>;
  outputData: Record<string, any>;
  metadata: {
    duration_seconds: number;
    completed_at: string;
  };
  errorMessage?: string;
}

export const TestResultCard = ({
  nodeId,
  nodeName,
  nodeIcon: NodeIcon,
  status,
  inputData,
  outputData,
  metadata,
  errorMessage,
}: TestResultCardProps) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (data: any, section: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    if (diffMins < 60) return `${diffMins} minutes ago`;
    return `${Math.floor(diffMins / 60)} hours ago`;
  };

  return (
    <div
      className={cn(
        'border-2 rounded-lg transition-all duration-200',
        status === 'SUCCESS' && 'border-success/30 bg-success/5',
        status === 'FAILED' && 'border-destructive/50 bg-destructive/5',
        status === 'RUNNING' && 'border-warning/30 bg-warning/5'
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              status === 'SUCCESS' && 'bg-success/20',
              status === 'FAILED' && 'bg-destructive/20',
              status === 'RUNNING' && 'bg-warning/20'
            )}>
              <NodeIcon className={cn(
                'h-5 w-5',
                status === 'SUCCESS' && 'text-success',
                status === 'FAILED' && 'text-destructive',
                status === 'RUNNING' && 'text-warning'
              )} />
            </div>
            <div>
              <h3 className="text-base font-bold">{nodeName}</h3>
              <p className="text-xs text-muted-foreground">ID: {nodeId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide',
                status === 'SUCCESS' && 'bg-success text-white',
                status === 'FAILED' && 'bg-destructive text-white',
                status === 'RUNNING' && 'bg-warning text-white'
              )}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-semibold text-foreground">
              {metadata.duration_seconds.toFixed(2)}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Completed:</span>
            <span className="font-medium text-foreground">
              {getRelativeTime(metadata.completed_at)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive mb-1">Error</p>
                <p className="text-sm text-destructive/90">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="output" className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="bg-background/50">
            {inputData && (
              <TabsTrigger value="input">Input</TabsTrigger>
            )}
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            {errorMessage && (
              <TabsTrigger value="errors" className="text-destructive">
                Errors
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Input Tab */}
        {inputData && (
          <TabsContent value="input" className="px-6 pb-6 mt-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(inputData, 'input')}
                className="absolute top-2 right-2 z-10"
              >
                {copiedSection === 'input' ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <div className="bg-background rounded-md p-4 overflow-auto max-h-80">
                <JSONViewer data={inputData} />
              </div>
            </div>
          </TabsContent>
        )}

        {/* Output Tab */}
        <TabsContent value="output" className="px-6 pb-6 mt-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(outputData, 'output')}
              className="absolute top-2 right-2 z-10"
            >
              {copiedSection === 'output' ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <div className="bg-background rounded-md p-4 overflow-auto max-h-80">
              <JSONViewer data={outputData} />
            </div>
          </div>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="px-6 pb-6 mt-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(metadata, 'metadata')}
              className="absolute top-2 right-2 z-10"
            >
              {copiedSection === 'metadata' ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <div className="bg-background rounded-md p-4 overflow-auto max-h-80">
              <JSONViewer data={metadata} />
            </div>
          </div>
        </TabsContent>

        {/* Errors Tab */}
        {errorMessage && (
          <TabsContent value="errors" className="px-6 pb-6 mt-4">
            <div className="bg-background rounded-md p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-destructive mb-2">Error Message</p>
                  <p className="text-sm text-foreground font-mono bg-destructive/10 p-3 rounded border border-destructive/30">
                    {errorMessage}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Stack Trace</p>
                  <pre className="text-xs font-mono text-muted-foreground bg-surface p-3 rounded overflow-auto max-h-40">
                    {`Error: ${errorMessage}\n    at executeNode (workflow.ts:142)\n    at async runWorkflow (workflow.ts:89)\n    at async WorkflowEngine.execute (engine.ts:56)`}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Syntax-Highlighted JSON Viewer Component
const JSONViewer = ({ data, depth = 0 }: { data: any; depth?: number }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderValue = (key: string, value: any, path: string, currentDepth: number): JSX.Element => {
    const indent = currentDepth * 16;
    const isCollapsed = collapsed[path];
    const shouldAutoCollapse = currentDepth >= 2;

    // Null
    if (value === null) {
      return (
        <div style={{ paddingLeft: `${indent}px` }} className="flex items-start gap-2">
          <span className="text-primary font-mono text-sm">{key}:</span>
          <span className="text-muted-foreground font-mono text-sm">null</span>
        </div>
      );
    }

    // Boolean
    if (typeof value === 'boolean') {
      return (
        <div style={{ paddingLeft: `${indent}px` }} className="flex items-start gap-2">
          <span className="text-primary font-mono text-sm">{key}:</span>
          <span className="text-accent font-mono text-sm">{value.toString()}</span>
        </div>
      );
    }

    // Number
    if (typeof value === 'number') {
      return (
        <div style={{ paddingLeft: `${indent}px` }} className="flex items-start gap-2">
          <span className="text-primary font-mono text-sm">{key}:</span>
          <span className="text-warning font-mono text-sm">{value}</span>
        </div>
      );
    }

    // String
    if (typeof value === 'string') {
      return (
        <div style={{ paddingLeft: `${indent}px` }} className="flex items-start gap-2">
          <span className="text-primary font-mono text-sm">{key}:</span>
          <span className="text-success font-mono text-sm">"{value}"</span>
        </div>
      );
    }

    // Array
    if (Array.isArray(value)) {
      const isCurrentlyCollapsed = isCollapsed ?? shouldAutoCollapse;
      return (
        <div>
          <div
            style={{ paddingLeft: `${indent}px` }}
            className="flex items-start gap-2 cursor-pointer hover:bg-accent/50 py-0.5 rounded"
            onClick={() => toggleCollapse(path)}
          >
            {isCurrentlyCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <span className="text-primary font-mono text-sm">{key}:</span>
            <span className="text-muted-foreground font-mono text-sm">
              [{value.length} items]
            </span>
          </div>
          {!isCurrentlyCollapsed && (
            <div className="space-y-1 mt-1">
              {value.map((item, index) => renderValue(`[${index}]`, item, `${path}.${index}`, currentDepth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Object
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      const isCurrentlyCollapsed = isCollapsed ?? shouldAutoCollapse;
      return (
        <div>
          <div
            style={{ paddingLeft: `${indent}px` }}
            className="flex items-start gap-2 cursor-pointer hover:bg-accent/50 py-0.5 rounded"
            onClick={() => toggleCollapse(path)}
          >
            {isCurrentlyCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <span className="text-primary font-mono text-sm">{key}:</span>
            <span className="text-muted-foreground font-mono text-sm">
              {'{' + keys.length + ' properties}'}
            </span>
          </div>
          {!isCurrentlyCollapsed && (
            <div className="space-y-1 mt-1">
              {keys.map(k => renderValue(k, value[k], `${path}.${k}`, currentDepth + 1))}
            </div>
          )}
        </div>
      );
    }

    return <div />;
  };

  const keys = typeof data === 'object' && data !== null ? Object.keys(data) : [];

  return (
    <div className="space-y-1 font-mono text-sm">
      {keys.map(key => renderValue(key, data[key], key, depth))}
    </div>
  );
};
