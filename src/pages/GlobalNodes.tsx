import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { NodeGrid, NodeItem } from '@/components/nodes/NodeGrid';
import { 
  Globe, 
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
  LucideIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getScripts, getScriptContent, Script } from '@/services/scriptsApi';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Modal } from '@/components/ui/Modal';

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
        <div className="container mx-auto max-w-[1400px] px-6 py-8">
          <PageHeader
            title="Global Nodes"
            description="Pre-built nodes available across all workflows"
          />
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Global Nodes"
          description="Pre-built nodes available across all workflows"
        />
        
        {nodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No global nodes found.</p>
          </div>
        ) : (
          <div>
            <NodeGrid 
              nodes={nodes}
              onDocumentation={handleDocumentation}
              readOnly={true}
              columns={5}
              buttonLabel="Details"
            />
          </div>
        )}
      </div>

      {/* Script Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedNode(null);
          setScriptContent('');
          setInputSchema(null);
          setOutputSchema(null);
        }}
        title={selectedNode ? `Details: ${selectedNode.name}` : 'Script Details'}
        size="xl"
      >
        {isLoadingContent ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Code Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Python Code</h3>
              <div className="relative">
                <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm font-mono border border-border max-h-96 overflow-y-auto">
                  <code className="text-foreground whitespace-pre-wrap break-words">
                    {scriptContent || 'No code available'}
                  </code>
                </pre>
              </div>
            </div>

            {/* Input Schema Section */}
            {inputSchema && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Input Schema</h3>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <pre className="text-sm font-mono text-foreground overflow-x-auto">
                    {JSON.stringify(inputSchema, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Output Schema Section */}
            {outputSchema && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Output Schema</h3>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <pre className="text-sm font-mono text-foreground overflow-x-auto">
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
