import { useState, useEffect } from 'react';
import { Zap, Database, Bot, CheckCircle, ArrowRight } from 'lucide-react';

interface WorkflowNode {
  id: string;
  icon: React.ElementType;
  label: string;
  status: 'idle' | 'running' | 'complete';
}

const initialNodes: WorkflowNode[] = [
  { id: 'trigger', icon: Zap, label: 'API Trigger', status: 'idle' },
  { id: 'database', icon: Database, label: 'Query Data', status: 'idle' },
  { id: 'ai', icon: Bot, label: 'AI Process', status: 'idle' },
  { id: 'output', icon: CheckCircle, label: 'Send Result', status: 'idle' },
];

export const HeroWorkflowPreview = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [completedConnections, setCompletedConnections] = useState<number[]>([]);
  const [animatingConnection, setAnimatingConnection] = useState(-1);

  useEffect(() => {
    const runWorkflow = () => {
      // Reset
      setNodes(initialNodes.map(n => ({ ...n, status: 'idle' })));
      setCompletedConnections([]);
      setAnimatingConnection(-1);

      // Animate each node sequentially
      initialNodes.forEach((_, index) => {
        // Start node (running state)
        setTimeout(() => {
          setNodes(prev => prev.map((n, i) => 
            i === index ? { ...n, status: 'running' } : n
          ));
        }, index * 1200);

        // Complete node
        setTimeout(() => {
          setNodes(prev => prev.map((n, i) => 
            i === index ? { ...n, status: 'complete' } : n
          ));
          
          // After node completes, animate the connection to next node
          if (index < initialNodes.length - 1) {
            setAnimatingConnection(index);
            // After animation, mark connection as permanently complete
            setTimeout(() => {
              setCompletedConnections(prev => [...prev, index]);
              setAnimatingConnection(-1);
            }, 400);
          }
        }, index * 1200 + 800);
      });
    };

    runWorkflow();
    const interval = setInterval(runWorkflow, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Background glow */}
      <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />
      
      {/* Workflow container */}
      <div className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">workflow.auto</span>
        </div>

        {/* Nodes */}
        <div className="space-y-3">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            const isRunning = node.status === 'running';
            const isComplete = node.status === 'complete';
            
            return (
              <div key={node.id}>
                {/* Node */}
                <div 
                  className={`
                    relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-500
                    ${isRunning ? 'bg-primary/20 border-primary shadow-glow-primary scale-[1.02]' : ''}
                    ${isComplete ? 'bg-success/10 border-success/50' : ''}
                    ${node.status === 'idle' ? 'bg-surface/50 border-border/50' : ''}
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    p-2 rounded-lg transition-all duration-300
                    ${isRunning ? 'bg-primary text-primary-foreground' : ''}
                    ${isComplete ? 'bg-success/20 text-success' : ''}
                    ${node.status === 'idle' ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Label */}
                  <span className={`
                    text-sm font-medium transition-colors duration-300
                    ${isRunning ? 'text-primary' : ''}
                    ${isComplete ? 'text-success' : ''}
                    ${node.status === 'idle' ? 'text-muted-foreground' : ''}
                  `}>
                    {node.label}
                  </span>

                  {/* Status indicator */}
                  {isRunning && (
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  )}
                  {isComplete && (
                    <CheckCircle className="ml-auto h-4 w-4 text-success" />
                  )}
                </div>

                {/* Connection line */}
                {index < nodes.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className={`
                      relative w-0.5 h-4 rounded-full transition-all duration-300
                      ${completedConnections.includes(index) ? 'bg-success' : 'bg-border'}
                    `}>
                      {/* Animated particle - only shows during transition */}
                      {animatingConnection === index && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-success rounded-full animate-flow-down shadow-glow-success" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer stats */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>4 nodes</span>
          <span className="flex items-center gap-1">
            <ArrowRight className="h-3 w-3" />
            Auto-running
          </span>
        </div>
      </div>
    </div>
  );
};
