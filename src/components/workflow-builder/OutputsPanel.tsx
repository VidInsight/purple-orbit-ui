import { useState } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Copy, Zap, MessageSquare, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePathContext } from './PathContext';

interface OutputData {
  nodeId: string;
  nodeName: string;
  icon: string;
  output: any;
}

interface OutputsPanelProps {
  outputs: OutputData[];
  isOpen: boolean;
  currentNodeId?: string;
}

export const OutputsPanel = ({ outputs, isOpen, currentNodeId }: OutputsPanelProps) => {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const { setActivePath } = usePathContext();

  const handleToggleNode = (nodeId: string) => {
    setExpandedNode(expandedNode === nodeId ? null : nodeId);
  };

  const handleToggleCollapse = (path: string) => {
    setCollapsedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleDragClick = (path: string) => {
    console.log('Path selected:', path);
    setActivePath(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 3000);
  };

  const handleCopyOutput = (output: any) => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    console.log('Copied output to clipboard');
  };

  const renderValue = (value: any, parentPath: string = '', depth: number = 0): JSX.Element => {
    const indent = depth * 6;
    const isCollapsed = collapsedPaths.has(parentPath);
    const shouldAutoCollapse = depth > 1;

    if (value === null) {
      return <span className="text-muted-foreground">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-warning">{String(value)}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-success">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-primary">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-foreground">[]</span>;
      }

      const arrayPath = parentPath;
      const isArrayCollapsed = shouldAutoCollapse ? !collapsedPaths.has(arrayPath) : collapsedPaths.has(arrayPath);

      return (
        <div className="inline-block">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleToggleCollapse(arrayPath)}
              className="hover:bg-accent/50 rounded p-0.5 transition-colors"
            >
              {isArrayCollapsed ? (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            <span className="text-foreground">[</span>
            {isArrayCollapsed && (
              <span className="text-muted-foreground text-[10px]">{value.length} items</span>
            )}
            {isArrayCollapsed && <span className="text-foreground">]</span>}
          </div>
          {!isArrayCollapsed && (
            <>
              {value.map((item, index) => (
                <div key={index} style={{ paddingLeft: `${indent + 6}px` }} className="group">
                  <div className="flex items-start gap-1">
                    <button
                      onClick={() => handleDragClick(`${parentPath}[${index}]`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title={`Path: ${parentPath}[${index}]`}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-warning">{index}</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="inline-block">{renderValue(item, `${parentPath}[${index}]`, depth + 1)}</span>
                      {index < value.length - 1 && <span className="text-muted-foreground">,</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-foreground">]</div>
            </>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span className="text-foreground">{'{}'}</span>;
      }

      const objectPath = parentPath;
      const isObjectCollapsed = shouldAutoCollapse ? !collapsedPaths.has(objectPath) : collapsedPaths.has(objectPath);

      return (
        <div className="inline-block">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleToggleCollapse(objectPath)}
              className="hover:bg-accent/50 rounded p-0.5 transition-colors"
            >
              {isObjectCollapsed ? (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            <span className="text-foreground">{'{'}</span>
            {isObjectCollapsed && (
              <span className="text-muted-foreground text-[10px]">{entries.length} keys</span>
            )}
            {isObjectCollapsed && <span className="text-foreground">{'}'}</span>}
          </div>
          {!isObjectCollapsed && (
            <>
              {entries.map(([key, val], index) => (
                <div key={key} style={{ paddingLeft: `${indent + 6}px` }} className="group">
                  <div className="flex items-start gap-1">
                    <button
                      onClick={() => handleDragClick(`${parentPath}.${key}`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title={`Path: ${parentPath}.${key}`}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-accent-foreground">"{key}"</span>
                      <span className="text-muted-foreground">: </span>
                      <span className="inline-block">{renderValue(val, `${parentPath}.${key}`, depth + 1)}</span>
                      {index < entries.length - 1 && <span className="text-muted-foreground">,</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-foreground">{'}'}</div>
            </>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  if (!isOpen) return null;

  // Filter outputs to only show nodes before current node
  const availableOutputs = currentNodeId 
    ? outputs.filter((output, index) => {
        // Find the index of the current node
        const currentIndex = outputs.findIndex(o => o.nodeId === currentNodeId);
        // Only show outputs from nodes before the current one
        return index < currentIndex;
      })
    : [];

  return (
    <div className="fixed left-0 top-0 h-full w-[350px] bg-surface border-r border-border shadow-2xl z-40 animate-slide-in-left flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Previous Outputs</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Only nodes before the current one
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {availableOutputs.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground text-sm">
            {currentNodeId 
              ? "Öncesinde düğüm olmadığı için değer yok"
              : "No node selected"
            }
          </div>
        ) : (
          <div className="divide-y divide-border">
            {availableOutputs.map((output) => (
              <div key={output.nodeId} className="border-b border-border last:border-b-0">
                {/* Accordion Header */}
                <button
                  onClick={() => handleToggleNode(output.nodeId)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded flex items-center justify-center bg-primary/10">
                      {output.icon === '⚡' && <Zap className="h-4 w-4 text-primary" />}
                      {output.icon === '💬' && <MessageSquare className="h-4 w-4 text-accent" />}
                      {output.icon === '📋' && <FileText className="h-4 w-4 text-muted-foreground" />}
                      {output.icon === '⚙️' && <Settings className="h-4 w-4 text-accent" />}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {output.nodeName}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      expandedNode === output.nodeId ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Accordion Content */}
                {expandedNode === output.nodeId && (
                  <div className="px-6 py-3 bg-background/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground">JSON Output</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyOutput(output.output)}
                        className="h-7 px-2"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>

                    <div className="bg-background rounded-lg p-3 border border-border overflow-x-auto">
                      <pre className="text-[11px] font-mono leading-tight">
                        {renderValue(output.output, output.nodeId)}
                      </pre>
                    </div>

                    {copiedPath && (
                      <div className="mt-2 px-3 py-2 bg-success/10 border border-success/30 rounded text-xs text-success animate-fade-in">
                        ✓ Path copied: <code className="font-mono font-semibold">{copiedPath}</code>
                        <div className="text-xs mt-1 opacity-80">
                          Click on an input field in the right panel to paste
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
