import { useState, useEffect } from 'react';
import { Zap, Database, Bot, CheckCircle2, ArrowDown, Loader2 } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface WorkflowNode {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  status: 'idle' | 'running' | 'complete';
}

const initialNodes: WorkflowNode[] = [
  { id: 'trigger', icon: Zap, label: 'API Trigger', sublabel: 'POST /api/webhook', status: 'idle' },
  { id: 'database', icon: Database, label: 'Database Query', sublabel: 'SELECT * FROM users', status: 'idle' },
  { id: 'ai', icon: Bot, label: 'AI Processing', sublabel: 'GPT-4 Analysis', status: 'idle' },
  { id: 'output', icon: CheckCircle2, label: 'Send Response', sublabel: 'HTTP 200 OK', status: 'idle' },
];

export const LiveWorkflowDemo = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const runWorkflow = () => {
      setIsRunning(true);
      setCurrentStep(0);
      setNodes(initialNodes.map(n => ({ ...n, status: 'idle' })));

      const steps = [0, 1, 2, 3];
      let stepIndex = 0;

      const interval = setInterval(() => {
        if (stepIndex < steps.length) {
          const step = steps[stepIndex];
          
          setNodes(prev => prev.map((node, idx) => ({
            ...node,
            status: idx === step ? 'running' : idx < step ? 'complete' : 'idle'
          })));
          
          setCurrentStep(step);

          setTimeout(() => {
            setNodes(prev => prev.map((node, idx) => ({
              ...node,
              status: idx <= step ? 'complete' : 'idle'
            })));
          }, 600);

          stepIndex++;
        } else {
          clearInterval(interval);
          setIsRunning(false);
          
          // Restart after delay
          setTimeout(() => {
            runWorkflow();
          }, 3000);
        }
      }, 1000);

      return () => clearInterval(interval);
    };

    const timeout = setTimeout(runWorkflow, 500);
    return () => clearTimeout(timeout);
  }, [isVisible]);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Gerçek Zamanlı
            </span>{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Workflow İzleme
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Her adımı canlı olarak izleyin, performansı optimize edin
          </p>
        </div>

        {/* Mock Browser */}
        <div className={`bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Browser Header */}
          <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <div className="flex-1 bg-background/50 rounded-lg px-4 py-1.5 text-sm text-muted-foreground">
              flowmaster.app/workflow/user-onboarding
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isRunning ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              {isRunning ? 'Çalışıyor' : 'Hazır'}
            </div>
          </div>

          {/* Workflow Canvas */}
          <div className="p-8 md:p-12 bg-gradient-to-br from-background to-muted/20">
            <div className="flex flex-col items-center gap-2">
              {nodes.map((node, index) => (
                <div key={node.id}>
                  {/* Node Card */}
                  <div
                    className={`relative w-72 sm:w-80 bg-card border rounded-xl p-4 transition-all duration-300 ${
                      node.status === 'running'
                        ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                        : node.status === 'complete'
                        ? 'border-success/50 bg-success/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {/* Glow effect when running */}
                    {node.status === 'running' && (
                      <div className="absolute inset-0 bg-primary/10 rounded-xl animate-pulse" />
                    )}
                    
                    <div className="relative flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors duration-300 ${
                        node.status === 'running'
                          ? 'bg-primary/20'
                          : node.status === 'complete'
                          ? 'bg-success/20'
                          : 'bg-muted'
                      }`}>
                        {node.status === 'running' ? (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        ) : (
                          <node.icon className={`h-5 w-5 ${
                            node.status === 'complete' ? 'text-success' : 'text-muted-foreground'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{node.label}</div>
                        <div className="text-sm text-muted-foreground">{node.sublabel}</div>
                      </div>
                      {node.status === 'complete' && (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      )}
                      {node.status === 'running' && (
                        <div className="text-xs text-primary font-medium">Processing...</div>
                      )}
                    </div>
                  </div>

                  {/* Connector */}
                  {index < nodes.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      <div className={`w-0.5 h-4 transition-colors duration-300 ${
                        nodes[index].status === 'complete' ? 'bg-success' : 'bg-border'
                      }`} />
                      <ArrowDown className={`h-4 w-4 transition-colors duration-300 ${
                        nodes[index].status === 'complete' ? 'text-success' : 'text-muted-foreground'
                      }`} />
                      <div className={`w-0.5 h-4 transition-colors duration-300 ${
                        nodes[index].status === 'complete' ? 'bg-success' : 'bg-border'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Execution Stats */}
            <div className="mt-8 flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Süre:</span>
                <span className="font-mono font-medium text-foreground">0.34s</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Durum:</span>
                <span className={`font-medium ${nodes.every(n => n.status === 'complete') ? 'text-success' : 'text-primary'}`}>
                  {nodes.every(n => n.status === 'complete') ? 'Tamamlandı' : 'İşleniyor'}
                </span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Node:</span>
                <span className="font-mono font-medium text-foreground">
                  {nodes.filter(n => n.status === 'complete').length}/{nodes.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
