import { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { NodeItem } from '@/components/nodes/NodeGrid';
import { GlobalNodeList } from '@/components/nodes/GlobalNodeList';
import { 
  Mail, 
  Database, 
  Code, 
  FileJson,
  Calendar,
  Webhook,
  MessageSquare,
  Filter,
  GitBranch,
  Clock,
  Repeat,
  Calculator,
  Send,
  LucideIcon,
  Globe,
  Layers,
  Cpu,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Braces,
  ArrowRightLeft,
  FileCode
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getScripts, getScriptContent, Script } from '@/services/scriptsApi';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Icon mapping based on category and subcategory
const getIconForScript = (script: Script): LucideIcon => {
  const category = script.category.toLowerCase();
  const subcategory = script.subcategory?.toLowerCase() || '';
  const name = script.name.toLowerCase();

  // Math category
  if (category === 'math') {
    if (subcategory === 'arithmetic' || name.includes('add') || name.includes('subtract') || 
        name.includes('multiply') || name.includes('divide') || name.includes('power') || 
        name.includes('modulo')) {
      return Calculator;
    }
    return Calculator;
  }

  // Communication category
  if (category === 'communication') {
    if (subcategory === 'telegram' || name.includes('telegram')) {
      return MessageSquare;
    }
    if (subcategory === 'email' || name.includes('email')) {
      return Mail;
    }
    if (subcategory === 'http' || name.includes('webhook')) {
      return Webhook;
    }
    return Send;
  }

  // Data Processing category
  if (category === 'data processing') {
    if (subcategory === 'parsers' || name.includes('parse') || name.includes('json')) {
      return FileJson;
    }
    if (subcategory === 'transform' || name.includes('transform')) {
      return Code;
    }
    if (name.includes('filter')) {
      return Filter;
    }
    return Code;
  }

  // Data Storage category
  if (category === 'data storage' || name.includes('database')) {
    return Database;
  }

  // Triggers category
  if (category === 'triggers' || name.includes('schedule')) {
    return Calendar;
  }

  // Flow Control category
  if (category === 'flow control') {
    if (name.includes('wait') || name.includes('delay')) {
      return Clock;
    }
    if (name.includes('loop') || name.includes('repeat')) {
      return Repeat;
    }
    return GitBranch;
  }

  // Default icon
  return Code;
};

// Convert Script to NodeItem
const convertScriptToNodeItem = (script: Script): NodeItem => {
  return {
    id: script.id,
    name: script.name,
    description: script.description,
    icon: getIconForScript(script),
    category: script.category.charAt(0).toUpperCase() + script.category.slice(1),
    subcategory: script.subcategory 
      ? script.subcategory.charAt(0).toUpperCase() + script.subcategory.slice(1)
      : undefined,
  };
};

const GlobalNodes = () => {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [scriptContent, setScriptContent] = useState<string>('');
  const [inputSchema, setInputSchema] = useState<any>(null);
  const [outputSchema, setOutputSchema] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getScripts();
        
        if (response.status === 'success' && response.data?.scripts) {
          const nodeItems = response.data.scripts.map(convertScriptToNodeItem);
          setNodes(nodeItems);
        } else {
          throw new Error('Failed to fetch scripts');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching scripts';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScripts();
  }, []);

  const handleDocumentation = async (node: NodeItem) => {
    try {
      setSelectedNode(node);
      setDetailsModalOpen(true);
      setIsLoadingContent(true);
      setScriptContent('');
      setInputSchema(null);
      setOutputSchema(null);

      const response = await getScriptContent(node.id);
      
      if (response.status === 'success' && response.data) {
        setScriptContent(response.data.content || '');
        setInputSchema(response.data.input_schema || null);
        setOutputSchema(response.data.output_schema || null);
      } else {
        throw new Error('Failed to fetch script details');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching script details';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setDetailsModalOpen(false);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const categoryCount = useMemo(() => {
    const categories = new Set(nodes.map((n) => n.category));
    return categories.size;
  }, [nodes]);

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingScreen />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/80 backdrop-blur-sm p-8 md:p-12 text-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-destructive/10 text-destructive mb-6">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Could not load global nodes</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <PageHeader
          title="Global Nodes"
          description="Pre-built nodes available across all workflows. Drag & drop into your flows."
          badge={{ label: 'System library', icon: Globe }}
          stats={[
            { icon: Layers, value: nodes.length, label: 'nodes' },
            { icon: Cpu, value: categoryCount, label: 'categories' },
          ]}
        />

        {/* Content */}
        {nodes.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/80 backdrop-blur-sm p-12 md:p-16 text-center animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No global nodes yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Global nodes will appear here once they are available from the system.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm overflow-hidden animate-in fade-in-up duration-500">
            <div className="p-6 md:p-8">
              <GlobalNodeList
                nodes={nodes}
                onDocumentation={handleDocumentation}
                buttonLabel="Details"
              />
            </div>
          </div>
        )}
      </div>

      {/* Script Details Modal - Premium styling */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedNode(null);
          setScriptContent('');
          setInputSchema(null);
          setOutputSchema(null);
        }}
        title={selectedNode ? selectedNode.name : 'Script Details'}
        size="xl"
      >
        {isLoadingContent ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading script details…</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedNode && (
              <div className="flex flex-wrap gap-2">
                <span className={cn(
                  'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium',
                  'bg-primary/10 text-primary border border-primary/20'
                )}>
                  {selectedNode.category}
                </span>
                {selectedNode.subcategory && (
                  <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground">
                    {selectedNode.subcategory}
                  </span>
                )}
              </div>
            )}

            {/* Code Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileCode className="h-4 w-4 text-primary" />
                Python Code
              </div>
              <div className="relative rounded-xl border border-border/80 bg-[hsl(var(--background))] overflow-hidden shadow-inner">
                <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground max-h-80 overflow-y-auto custom-scrollbar">
                  <code className="whitespace-pre-wrap break-words">
                    {scriptContent || 'No code available'}
                  </code>
                </pre>
              </div>
            </div>

            {/* Input Schema Section */}
            {inputSchema && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                  Input Schema
                </div>
                <div className="relative rounded-xl border border-border/80 bg-muted/30 overflow-hidden">
                  <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto custom-scrollbar">
                    {JSON.stringify(inputSchema, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Output Schema Section */}
            {outputSchema && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Braces className="h-4 w-4 text-primary" />
                  Output Schema
                </div>
                <div className="relative rounded-xl border border-border/80 bg-muted/30 overflow-hidden">
                  <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto custom-scrollbar">
                    {JSON.stringify(outputSchema, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};

export default GlobalNodes;
