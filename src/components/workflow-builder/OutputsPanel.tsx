import { useState } from 'react';
import { ChevronDown, Copy, Zap, MessageSquare, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePathContext } from './PathContext';
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';

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
  const { setActivePath } = usePathContext();

  const handleToggleNode = (nodeId: string) => {
    setExpandedNode(expandedNode === nodeId ? null : nodeId);
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

  const handleJsonClick = (path: string[], value: any) => {
    // Convert array path to dot notation: ["nodeId", "key", "subkey"] -> "nodeId.key.subkey"
    const fullPath = path.join('.');
    console.log('Selected path:', fullPath);
    setActivePath(fullPath);
    setCopiedPath(fullPath);
    setTimeout(() => setCopiedPath(null), 2000);
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
                      <JsonView
                        value={output.output}
                        collapsed={2}
                        style={{
                          ...darkTheme,
                          fontSize: '11px',
                          lineHeight: '1.4',
                          fontFamily: 'monospace',
                        }}
                        displayDataTypes={false}
                        displayObjectSize={true}
                        enableClipboard={false}
                        onClick={(params: any) => {
                          if (params.indexPath) {
                            const pathArray = [output.nodeId, ...params.indexPath];
                            handleJsonClick(pathArray, params.value);
                          }
                        }}
                      />
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
