import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { TriggerNode } from '@/components/workflow-builder/TriggerNode';
import { ActionNode } from '@/components/workflow-builder/ActionNode';
import { ConditionalNode } from '@/components/workflow-builder/ConditionalNode';
import { LoopNode } from '@/components/workflow-builder/LoopNode';
import { AddNodeButton } from '@/components/workflow-builder/AddNodeButton';
import { ParametersPanel } from '@/components/workflow-builder/ParametersPanel';
import { OutputsPanel } from '@/components/workflow-builder/OutputsPanel';
import { PathProvider } from '@/components/workflow-builder/PathContext';

interface Variable {
  name: string;
  type: string;
  defaultValue: string;
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'conditional' | 'loop';
  title: string;
  icon?: string;
  category?: string;
  nodeType?: string;
  configured?: boolean;
  variables?: Variable[];
  config?: Record<string, any>;
  branches?: {
    true: string[];
    false: string[];
  };
  loopBody?: string[];
  parentBranch?: { nodeId: string; branchType: 'true' | 'false' } | null;
  parameters?: Array<{
    id: string;
    label: string;
    type: 'text' | 'dropdown' | 'number' | 'toggle' | 'textarea' | 'credential';
    placeholder?: string;
    options?: string[];
    min?: number;
    max?: number;
    value?: any;
    isDynamic?: boolean;
    dynamicPath?: string;
  }>;
}

export default function ZapierWorkflowEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showOutputsPanel, setShowOutputsPanel] = useState(false);
  
  // Pan and Zoom state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  // Ref for auto-scroll
  const lastNodeRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(false);

  // Load workflow from localStorage if editing existing workflow
  useEffect(() => {
    if (id && id !== 'new') {
      // Load workflow from storage
      const savedWorkflows = localStorage.getItem('workflows');
      if (savedWorkflows) {
        const workflows = JSON.parse(savedWorkflows);
        const workflow = workflows.find((w: any) => w.id === id);
        if (workflow) {
          setWorkflowName(workflow.name);
          if (workflow.nodes) {
            setNodes(workflow.nodes);
          }
        }
      }
    }
  }, [id]);
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

  // Auto-scroll when node is added to the end
  useEffect(() => {
    if (shouldAutoScroll.current && lastNodeRef.current) {
      setTimeout(() => {
        lastNodeRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        shouldAutoScroll.current = false;
      }, 100);
    }
  }, [nodes]);

  const handleAddNode = (category: string, subcategory: string, nodeType: string, afterNodeId?: string) => {
    // Map node types to icons and configured status
    const nodeIcons: Record<string, string> = {
      'GPT-4 Completion': '💬',
      'DALL-E Image': '🎨',
      'Embeddings': '🔢',
      'Claude': '💭',
      'JSON Parse': '📋',
      'Text Replace': '✏️',
      'Date Format': '📅',
      'If/Else': '⚖️',
      'For Each': '➰',
    };

    // Find the index where the new node should be inserted
    const insertIndex = afterNodeId 
      ? nodes.findIndex(n => n.id === afterNodeId) + 1
      : nodes.length;

    // Check if this is a conditional or loop node
    if (nodeType === 'If/Else') {
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: 'conditional',
        title: nodeType,
        icon: nodeIcons[nodeType],
        category: `${category} > ${subcategory}`,
        nodeType: 'Conditional',
        configured: false,
        branches: {
          true: [],
          false: [],
        },
        parameters: [
          {
            id: 'condition_type',
            label: 'Condition Type',
            type: 'dropdown',
            options: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'],
            value: 'equals',
          },
          {
            id: 'value1',
            label: 'Value 1',
            type: 'text',
            placeholder: 'First value to compare',
            value: '',
          },
          {
            id: 'value2',
            label: 'Value 2',
            type: 'text',
            placeholder: 'Second value to compare',
            value: '',
          },
        ],
      };
      const newNodes = [...nodes];
      newNodes.splice(insertIndex, 0, newNode);
      setNodes(newNodes);
      return;
    }

    if (nodeType === 'For Each') {
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: 'loop',
        title: nodeType,
        icon: nodeIcons[nodeType],
        category: `${category} > ${subcategory}`,
        nodeType: 'Loop',
        configured: false,
        loopBody: [],
        parameters: [
          {
            id: 'input_array',
            label: 'Input Array',
            type: 'text',
            placeholder: 'Array to iterate over',
            value: '',
            isDynamic: false,
          },
          {
            id: 'item_name',
            label: 'Item Variable Name',
            type: 'text',
            placeholder: 'e.g., "item", "user", "record"',
            value: 'item',
          },
          {
            id: 'max_iterations',
            label: 'Max Iterations',
            type: 'number',
            placeholder: 'Optional limit',
            min: 1,
            max: 10000,
            value: 100,
          },
        ],
      };
      const newNodes = [...nodes];
      newNodes.splice(insertIndex, 0, newNode);
      setNodes(newNodes);
      return;
    }

    // Define parameters based on node type
    const getNodeParameters = (nodeType: string) => {
      if (nodeType === 'GPT-4 Completion') {
        return [
          {
            id: 'model',
            label: 'Model',
            type: 'dropdown' as const,
            options: ['gpt-4', 'gpt-4-turbo', 'gpt-4o'],
            value: 'gpt-4',
          },
          {
            id: 'temperature',
            label: 'Temperature',
            type: 'number' as const,
            min: 0,
            max: 2,
            value: 0.7,
            placeholder: '0.7',
          },
          {
            id: 'max_tokens',
            label: 'Max Tokens',
            type: 'number' as const,
            min: 1,
            max: 4000,
            value: 1000,
            placeholder: '1000',
          },
          {
            id: 'prompt',
            label: 'Prompt',
            type: 'textarea' as const,
            placeholder: 'Enter your prompt here...',
            value: '',
          },
          {
            id: 'api_key',
            label: 'API Key',
            type: 'credential' as const,
            options: ['OpenAI Production', 'OpenAI Development'],
            value: '',
          },
        ];
      }
      
      if (nodeType === 'JSON Parse') {
        return [
          {
            id: 'input',
            label: 'JSON Input',
            type: 'textarea' as const,
            placeholder: 'Paste JSON here...',
            value: '',
          },
          {
            id: 'strict',
            label: 'Strict Mode',
            type: 'toggle' as const,
            value: false,
          },
        ];
      }

      return [];
    };

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: 'action',
      title: nodeType,
      icon: nodeIcons[nodeType],
      category: `${category} > ${subcategory}`,
      nodeType: category,
      configured: false,
      config: {},
      parameters: getNodeParameters(nodeType),
    };

    const newNodes = [...nodes];
    newNodes.splice(insertIndex, 0, newNode);
    setNodes(newNodes);
    
    // Auto-scroll if added to the end
    if (insertIndex === nodes.length) {
      shouldAutoScroll.current = true;
    }
  };

  const handleAddBranch = (conditionalNodeId: string, branchType: 'true' | 'false') => {
    console.log('Adding branch:', { conditionalNodeId, branchType });
    // In a real implementation, this would open a node selector
    // For now, just log the action
  };

  const handleNodeClick = (node: WorkflowNode) => {
    console.log('Node selected:', node);
    setSelectedNode(node);
    setShowOutputsPanel(true); // Show outputs panel when a node is selected
  };

  const handleParameterChange = (parameterId: string, value: any, isDynamic: boolean = false) => {
    if (!selectedNode) return;

    setNodes(nodes.map(node => {
      if (node.id === selectedNode.id) {
        const updatedParameters = node.parameters?.map(param =>
          param.id === parameterId 
            ? { 
                ...param, 
                value, 
                isDynamic,
                dynamicPath: isDynamic ? value : undefined 
              } 
            : param
        );
        const updatedNode = { ...node, parameters: updatedParameters };
        setSelectedNode(updatedNode); // Update selected node too
        return updatedNode;
      }
      return node;
    }));
  };

  // Generate mock outputs for demonstration
  const generateMockOutputs = () => {
    return nodes.map(node => {
      if (node.type === 'trigger') {
        return {
          nodeId: node.id,
          nodeName: node.title,
          icon: '⚡',
          output: {
            user_id: '12345',
            email: 'user@example.com',
            timestamp: '2025-01-15T10:30:00Z',
            data: {
              name: 'John Doe',
              age: 30,
            },
          },
        };
      }

      if (node.title === 'GPT-4 Completion') {
        return {
          nodeId: node.id,
          nodeName: node.title,
          icon: '💬',
          output: {
            id: 'resp_abc123',
            object: 'response',
            created_at: 1741476542,
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'text',
                    text: 'Generated response here...',
                  },
                ],
              },
            ],
            usage: {
              input_tokens: 36,
              output_tokens: 87,
            },
          },
        };
      }

      if (node.title === 'JSON Parse') {
        return {
          nodeId: node.id,
          nodeName: node.title,
          icon: '📋',
          output: {
            parsed_data: {
              field1: 'value1',
              field2: 123,
              nested: {
                field3: true,
              },
            },
          },
        };
      }

      return {
        nodeId: node.id,
        nodeName: node.title,
        icon: '⚙️',
        output: {
          status: 'success',
          data: {
            result: 'processed',
          },
        },
      };
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
  };

  const handleSave = () => {
    const workflowId = id === 'new' ? `workflow-${Date.now()}` : id;
    const workflow: any = {
      id: workflowId,
      name: workflowName,
      nodes,
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const savedWorkflows = localStorage.getItem('workflows');
    const workflows = savedWorkflows ? JSON.parse(savedWorkflows) : [];
    const existingIndex = workflows.findIndex((w: any) => w.id === workflowId);
    
    if (existingIndex >= 0) {
      workflows[existingIndex] = workflow;
    } else {
      workflow.createdAt = new Date().toISOString();
      workflows.push(workflow);
    }
    
    localStorage.setItem('workflows', JSON.stringify(workflows));
    console.log('Workflow saved:', workflow);

    // If new workflow, navigate to edit URL
    if (id === 'new') {
      navigate(`/workflows/${workflowId}/edit`, { replace: true });
    }
  };

  const handleTest = () => {
    console.log('Testing workflow:', { name: workflowName, nodes });
    // Implement test logic
  };

  const handlePublish = () => {
    console.log('Publishing workflow:', { name: workflowName, nodes });
    // Implement publish logic
  };

  // Zoom and Pan handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.5, zoom + delta), 1.5);
      setZoom(newZoom);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newPanX = Math.min(Math.max(e.clientX - startPan.x, -1000), 1000);
      const newPanY = Math.min(Math.max(e.clientY - startPan.y, -1000), 1000);
      setPanX(newPanX);
      setPanY(newPanY);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <PathProvider>
      <div className="min-h-screen bg-background">
        {/* Toolbar */}
        <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Side */}
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

              {/* Right Side */}
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTest}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test Result
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  className="bg-success hover:bg-success/90"
                >
                  Activate
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div 
          className="relative h-[calc(100vh-80px)] overflow-hidden bg-background"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoom Controls */}
          <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 bg-surface border border-border rounded-lg shadow-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0"
              title="Zoom In"
            >
              +
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetView}
              className="h-8 w-8 p-0 text-xs"
              title="Reset View"
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0"
              title="Zoom Out"
            >
              −
            </Button>
          </div>

          {/* Canvas Content */}
          <div 
            className="absolute inset-0 flex items-start justify-center py-8"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: 'center top',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
              cursor: isPanning ? 'grabbing' : 'grab',
            }}
          >
            <div className="max-w-3xl w-full px-6">
              <div className="space-y-0">
            {nodes.map((node, index) => (
              <div 
                key={node.id} 
                className="relative"
                ref={index === nodes.length - 1 ? lastNodeRef : null}
              >
                {/* Node */}
                {node.type === 'trigger' ? (
                  <TriggerNode
                    node={node}
                    onUpdate={(updates) => {
                      setNodes(nodes.map(n => n.id === node.id ? { ...n, ...updates } : n));
                    }}
                    onClick={() => handleNodeClick(node)}
                  />
                ) : node.type === 'conditional' ? (
                  <ConditionalNode
                    node={node}
                    onUpdate={(updates) => {
                      setNodes(nodes.map(n => n.id === node.id ? { ...n, ...updates } : n));
                    }}
                    onDelete={() => handleDeleteNode(node.id)}
                    onClick={() => handleNodeClick(node)}
                    onAddBranch={(branchType) => handleAddBranch(node.id, branchType)}
                  />
                ) : node.type === 'loop' ? (
                  <LoopNode
                    node={node}
                    onUpdate={(updates) => {
                      setNodes(nodes.map(n => n.id === node.id ? { ...n, ...updates } : n));
                    }}
                    onDelete={() => handleDeleteNode(node.id)}
                    onClick={() => handleNodeClick(node)}
                  />
                ) : (
                  <ActionNode
                    node={node}
                    onUpdate={(updates) => {
                      setNodes(nodes.map(n => n.id === node.id ? { ...n, ...updates } : n));
                    }}
                    onDelete={() => handleDeleteNode(node.id)}
                    onClick={() => handleNodeClick(node)}
                  />
                )}

                {/* Connection line and Add button */}
                <div className="flex flex-col items-center my-3">
                  <div className="w-0.5 h-4 bg-border" />
                  <AddNodeButton onAddNode={(cat, sub, type) => handleAddNode(cat, sub, type, node.id)} />
                  <div className="w-0.5 h-4 bg-border" />
                </div>
              </div>
            ))}
              </div>
            </div>
          </div>
        </div>

        {/* Parameters Panel */}
        {selectedNode && (
          <ParametersPanel
            node={selectedNode}
            isOpen={!!selectedNode}
            onClose={() => {
              setSelectedNode(null);
              setShowOutputsPanel(false);
            }}
            onParameterChange={handleParameterChange}
          />
        )}

        {/* Outputs Panel */}
        <OutputsPanel
          outputs={generateMockOutputs()}
          isOpen={showOutputsPanel}
          currentNodeId={selectedNode?.id}
        />
      </div>
    </PathProvider>
  );
}
