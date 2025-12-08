import { useState, useEffect } from 'react';
import { Zap, Database, Bot, CheckCircle2, ArrowDown, Plus, Settings, Play, Eye, Trash2, GripVertical, ChevronRight, X, MessageSquare, Image, FileJson, GitBranch, Repeat, Search, Star, Clock } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface WorkflowNode {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  category: string;
  status: 'idle' | 'running' | 'complete';
  configured: boolean;
}

interface Parameter {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  value: string;
  placeholder?: string;
}

const initialNodes: WorkflowNode[] = [
  { id: 'trigger', icon: Zap, label: 'API Trigger', sublabel: 'POST /api/webhook', category: 'Trigger', status: 'idle', configured: true },
  { id: 'ai', icon: MessageSquare, label: 'GPT-4 Completion', sublabel: 'AI Models > OpenAI', category: 'AI Models > OpenAI', status: 'idle', configured: true },
  { id: 'database', icon: Database, label: 'Database Query', sublabel: 'SELECT * FROM users', category: 'Data > Database', status: 'idle', configured: false },
];

const mockParameters: Parameter[] = [
  { id: 'prompt', label: 'Prompt', type: 'textarea', value: 'Analyze the user data and provide insights...', placeholder: 'Enter your prompt...' },
  { id: 'model', label: 'Model', type: 'select', value: 'gpt-4' },
  { id: 'temperature', label: 'Temperature', type: 'text', value: '0.7' },
];

const nodeCategories = [
  { name: 'AI Models', icon: Bot, items: ['OpenAI', 'Anthropic', 'Google AI'] },
  { name: 'Data', icon: Database, items: ['Transform', 'Filter', 'Database'] },
  { name: 'Logic', icon: GitBranch, items: ['Condition', 'Loop', 'Switch'] },
  { name: 'Integrations', icon: Zap, items: ['Slack', 'Discord', 'Email'] },
];

export const LiveWorkflowDemo = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Auto-demo animation
  useEffect(() => {
    if (!isVisible) return;

    const runDemo = async () => {
      // Step 1: Show node selection
      await wait(1000);
      setSelectedNodeId('ai');
      setShowPanel(true);
      
      // Step 2: Show add menu briefly
      await wait(2500);
      setShowPanel(false);
      setSelectedNodeId(null);
      await wait(500);
      setShowAddMenu(true);
      
      // Step 3: Close menu and run workflow
      await wait(2000);
      setShowAddMenu(false);
      await wait(500);
      
      // Step 4: Run workflow animation
      setIsRunning(true);
      for (let i = 0; i < nodes.length; i++) {
        setCurrentStep(i);
        setNodes(prev => prev.map((node, idx) => ({
          ...node,
          status: idx === i ? 'running' : idx < i ? 'complete' : 'idle'
        })));
        await wait(800);
        setNodes(prev => prev.map((node, idx) => ({
          ...node,
          status: idx <= i ? 'complete' : 'idle'
        })));
      }
      
      await wait(1500);
      setIsRunning(false);
      setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
      setCurrentStep(-1);
      
      // Restart demo
      await wait(2000);
      runDemo();
    };

    runDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Güçlü
            </span>{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Workflow Editörü
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sürükle-bırak arayüzü ile node'ları kolayca yapılandırın ve bağlayın
          </p>
        </div>

        {/* Mock Editor */}
        <div className={`bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Editor Toolbar */}
          <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="font-medium text-foreground">User Onboarding Workflow</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <Play className="h-4 w-4" />
                Test
              </button>
              <button className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                isRunning 
                  ? "bg-success text-success-foreground" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}>
                {isRunning ? 'Çalışıyor...' : 'Aktif'}
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex min-h-[500px]">
            {/* Left Panel - Outputs */}
            <div className="w-72 border-r border-border bg-muted/20 p-4 hidden lg:block">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">Previous Outputs</h3>
                <p className="text-xs text-muted-foreground">Önceki node çıktıları</p>
              </div>
              <div className="space-y-2">
                {nodes.slice(0, 2).map(node => (
                  <div key={node.id} className="bg-background border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <node.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{node.label}</span>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground bg-muted/50 rounded p-2">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-3 w-3 text-primary/50 cursor-grab" />
                        <span className="text-primary">"output"</span>: <span className="text-success">"..."</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 p-8 bg-gradient-to-br from-background to-muted/10 relative overflow-hidden">
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />

              <div className="relative flex flex-col items-center gap-1">
                {nodes.map((node, index) => (
                  <div key={node.id} className="relative">
                    {/* Node Card */}
                    <div
                      className={cn(
                        'relative w-80 bg-card border-2 rounded-xl p-4 transition-all duration-300 cursor-pointer group',
                        selectedNodeId === node.id && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                        node.status === 'running' && 'border-primary shadow-lg shadow-primary/20 scale-105',
                        node.status === 'complete' && 'border-success/50',
                        node.status === 'idle' && 'border-border hover:border-primary/50',
                        hoveredNode === node.id && 'shadow-lg'
                      )}
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        setShowPanel(true);
                      }}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Running Glow */}
                      {node.status === 'running' && (
                        <div className="absolute inset-0 bg-primary/10 rounded-xl animate-pulse" />
                      )}

                      <div className="relative">
                        {/* Category Path */}
                        <div className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                          <span>{node.category}</span>
                          {!node.configured && (
                            <span className="ml-auto px-1.5 py-0.5 rounded bg-warning/20 text-warning text-[9px] font-medium">
                              Yapılandırılmamış
                            </span>
                          )}
                          {node.configured && (
                            <span className="ml-auto px-1.5 py-0.5 rounded bg-success/20 text-success text-[9px] font-medium">
                              Yapılandırıldı
                            </span>
                          )}
                        </div>

                        {/* Node Content */}
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2.5 rounded-lg transition-colors',
                            node.status === 'running' ? 'bg-primary/20' :
                            node.status === 'complete' ? 'bg-success/20' : 'bg-primary/10'
                          )}>
                            <node.icon className={cn(
                              'h-5 w-5',
                              node.status === 'running' ? 'text-primary animate-pulse' :
                              node.status === 'complete' ? 'text-success' : 'text-primary'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground">{node.label}</div>
                            <div className="text-xs text-muted-foreground truncate">{node.sublabel}</div>
                          </div>
                          {node.status === 'complete' && (
                            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className={cn(
                          'flex items-center gap-1 mt-3 pt-3 border-t border-border transition-opacity',
                          hoveredNode === node.id || selectedNodeId === node.id ? 'opacity-100' : 'opacity-0'
                        )}>
                          <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                            <Eye className="h-3 w-3" /> View
                          </button>
                          <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 transition-colors">
                            <Settings className="h-3 w-3" /> Edit
                          </button>
                          <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors ml-auto">
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Connector Line + Add Button */}
                    {index < nodes.length - 1 && (
                      <div className="flex flex-col items-center py-1 relative">
                        <div className={cn(
                          'w-0.5 h-3 transition-colors',
                          node.status === 'complete' ? 'bg-success' : 'bg-border'
                        )} />
                        <ArrowDown className={cn(
                          'h-4 w-4 transition-colors',
                          node.status === 'complete' ? 'text-success' : 'text-muted-foreground'
                        )} />
                        <div className={cn(
                          'w-0.5 h-3 transition-colors',
                          node.status === 'complete' ? 'bg-success' : 'bg-border'
                        )} />
                      </div>
                    )}

                    {/* Add Node Button (after last node) */}
                    {index === nodes.length - 1 && (
                      <div className="flex flex-col items-center pt-2">
                        <div className="w-0.5 h-4 bg-border" />
                        <button
                          onClick={() => setShowAddMenu(!showAddMenu)}
                          className={cn(
                            'w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all',
                            showAddMenu 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5'
                          )}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Node Menu Popup */}
              {showAddMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {/* Menu Header */}
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <span className="font-medium text-foreground">Add Node</span>
                    <button 
                      onClick={() => setShowAddMenu(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Search nodes..." 
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Recent */}
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Recently Used</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {[Bot, Database, GitBranch].map((Icon, i) => (
                        <button key={i} className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors">
                          <Icon className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="max-h-48 overflow-y-auto p-2">
                    {nodeCategories.map(cat => (
                      <button
                        key={cat.name}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-muted/50 transition-colors group"
                      >
                        <cat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        <span className="flex-1 text-sm text-foreground">{cat.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Parameters */}
            <div className={cn(
              'w-80 border-l border-border bg-muted/20 transition-all duration-300 overflow-hidden hidden lg:block',
              showPanel && selectedNode ? 'opacity-100' : 'opacity-50'
            )}>
              {showPanel && selectedNode ? (
                <div className="p-4">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Node Configuration</h3>
                      <p className="text-xs text-muted-foreground">{selectedNode.label}</p>
                    </div>
                    <button 
                      onClick={() => setShowPanel(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Parameters */}
                  <div className="space-y-4">
                    {mockParameters.map(param => (
                      <div key={param.id}>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          {param.label}
                        </label>
                        {param.type === 'textarea' ? (
                          <textarea
                            value={param.value}
                            readOnly
                            rows={3}
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : param.type === 'select' ? (
                          <select className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5">GPT-3.5 Turbo</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={param.value}
                            readOnly
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        )}
                      </div>
                    ))}

                    {/* Dynamic Value Button */}
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-primary/50 rounded-lg text-sm text-primary hover:bg-primary/5 transition-colors">
                      <Plus className="h-4 w-4" />
                      Add Dynamic Value
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Yapılandırmak için bir node seçin</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-muted/30 border-t border-border px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                {nodes.length} node
              </span>
              <span className="text-muted-foreground">
                Auto-saved
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn(
                'flex items-center gap-1',
                isRunning ? 'text-primary' : 'text-muted-foreground'
              )}>
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  isRunning ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                )} />
                {isRunning ? 'Çalışıyor' : 'Hazır'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
