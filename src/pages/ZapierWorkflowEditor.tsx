import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TriggerNode } from '@/components/workflow-builder/TriggerNode';
import { ActionNode } from '@/components/workflow-builder/ActionNode';
import { AddNodeButton } from '@/components/workflow-builder/AddNodeButton';

interface Variable {
  name: string;
  type: string;
  defaultValue: string;
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action';
  title: string;
  icon?: string;
  category?: string;
  nodeType?: string;
  configured?: boolean;
  variables?: Variable[];
  config?: Record<string, any>;
}

export default function ZapierWorkflowEditor() {
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'trigger-1',
      type: 'trigger',
      title: 'API Trigger',
      icon: '⚡',
      variables: [
        { name: 'user_id', type: 'string', defaultValue: '' },
        { name: 'event_type', type: 'string', defaultValue: 'create' },
        { name: 'timestamp', type: 'number', defaultValue: '' },
      ],
    },
  ]);

  const handleAddNode = (category: string, subcategory: string, nodeType: string) => {
    // Map node types to icons and configured status
    const nodeIcons: Record<string, string> = {
      'GPT-4 Completion': '💬',
      'DALL-E Image': '🎨',
      'Embeddings': '🔢',
      'Claude': '💭',
      'JSON Parse': '📋',
      'Text Replace': '✏️',
      'Date Format': '📅',
    };

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: 'action',
      title: nodeType,
      icon: nodeIcons[nodeType] || '⚙️',
      category: `${category} > ${subcategory}`,
      nodeType: category,
      configured: false,
      config: {},
    };

    setNodes([...nodes, newNode]);
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
  };

  const handleSave = () => {
    console.log('Saving workflow:', { name: workflowName, nodes });
    // Implement save logic
  };

  const handleTest = () => {
    console.log('Testing workflow:', { name: workflowName, nodes });
    // Implement test logic
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        {/* Toolbar */}
        <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/workflows')}
                  className="hover:bg-surface"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {isEditingName ? (
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingName(false);
                    }}
                    autoFocus
                    className="text-xl font-semibold bg-transparent border-b-2 border-primary focus:outline-none"
                  />
                ) : (
                  <h1
                    className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setIsEditingName(true)}
                  >
                    {workflowName}
                  </h1>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTest}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="space-y-0">
            {nodes.map((node, index) => (
              <div key={node.id} className="relative">
                {/* Connection Line - Dashed */}
                {index > 0 && (
                  <div className="flex justify-center py-4">
                    <div 
                      className="w-0.5 h-8 border-l-2 border-dashed"
                      style={{ borderColor: '#d1d5db' }}
                    />
                  </div>
                )}

                {/* Node */}
                {node.type === 'trigger' ? (
                  <TriggerNode
                    node={node}
                    onUpdate={(updates) => handleUpdateNode(node.id, updates)}
                  />
                ) : (
                  <ActionNode
                    node={node}
                    onUpdate={(updates) => handleUpdateNode(node.id, updates)}
                    onDelete={() => handleDeleteNode(node.id)}
                  />
                )}

                {/* Add Button */}
                <div className="flex justify-center py-4">
                  <div 
                    className="w-0.5 h-8 border-l-2 border-dashed mb-2"
                    style={{ borderColor: '#d1d5db' }}
                  />
                  <div className="absolute">
                    <AddNodeButton onAddNode={handleAddNode} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
