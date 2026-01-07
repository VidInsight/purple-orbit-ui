import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Zap, MessageSquare, Image, Hash, FileJson, Type, Calendar, GitBranch, Repeat, Settings, LucideIcon, Play, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { addNodeToWorkflow, getWorkflowGraph, addEdgeToWorkflow, getNodeFormSchema, deleteNodeFromWorkflow, testWorkflowExecution, getExecution } from '@/services/workflowApi';
import { toast } from '@/hooks/use-toast';
import { TriggerNode } from '@/components/workflow-builder/TriggerNode';
import { ActionNode } from '@/components/workflow-builder/ActionNode';
import { ConditionalNode } from '@/components/workflow-builder/ConditionalNode';
import { LoopNode } from '@/components/workflow-builder/LoopNode';
import { AddNodeButton } from '@/components/workflow-builder/AddNodeButton';
import { ParametersPanel } from '@/components/workflow-builder/ParametersPanel';
import { OutputsPanel } from '@/components/workflow-builder/OutputsPanel';
import { PathProvider } from '@/components/workflow-builder/PathContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ExecutionTimeline } from '@/components/workflow-builder/ExecutionTimeline';
import { TestSummaryCard } from '@/components/workflow-builder/TestSummaryCard';
import { DefaultTriggerCard } from '@/components/workflow-builder/DefaultTriggerCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Variable {
  name: string;
  type: string;
  defaultValue: string;
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'conditional' | 'loop';
  title: string;
  icon?: LucideIcon;
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
  const { currentWorkspace } = useWorkspace();
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showOutputsPanel, setShowOutputsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [isActive, setIsActive] = useState(false);
  
  // Refs for DOM optimization
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Pan and Zoom state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Load workflow from localStorage if editing existing workflow
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  
  // Node output data from API
  const [nodeOutputs, setNodeOutputs] = useState<Record<string, {
    nodeId: string;
    nodeName: string;
    icon: LucideIcon;
    output: any;
  }>>({});
  const [isLoadingOutputs, setIsLoadingOutputs] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionData, setExecutionData] = useState<any>(null);
  const [isLoadingExecution, setIsLoadingExecution] = useState(false);

  // Load workflow from API when editing existing workflow
  useEffect(() => {
    const loadWorkflowFromAPI = async () => {
      // Check if user is authenticated before making API call
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        return;
      }

      if (!id || id === 'new' || !currentWorkspace?.id) {
        // Fallback to localStorage for new workflows or if workspace not available
        if (id && id !== 'new') {
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
        return;
      }

      setIsLoadingWorkflow(true);
      try {
        const response = await getWorkflowGraph(currentWorkspace.id, id);
        
        if (response.status === 'success' && response.data) {
          const workflowData = response.data;
          
          // Set workflow name
          if (workflowData.workflow_name) {
            setWorkflowName(workflowData.workflow_name);
          }
          
          // Set workflow status
          if (workflowData.status) {
            setIsActive(workflowData.status === 'ACTIVE' || workflowData.status === 'active');
          }
          
          // Map API nodes to WorkflowNode format
          if (workflowData.nodes && Array.isArray(workflowData.nodes)) {
            const mappedNodes: WorkflowNode[] = workflowData.nodes.map((apiNode: any) => {
              // Determine node type based on name or script_type
              let nodeType: 'trigger' | 'action' | 'conditional' | 'loop' = 'action';
              let icon: LucideIcon = Settings;
              let title = apiNode.name || 'Unnamed Node';
              
              // Try to determine node type from name
              const nodeNameLower = title.toLowerCase();
              if (nodeNameLower.includes('trigger') || nodeNameLower.includes('webhook')) {
                nodeType = 'trigger';
                icon = Zap;
              } else if (nodeNameLower.includes('if') || nodeNameLower.includes('else') || nodeNameLower.includes('conditional')) {
                nodeType = 'conditional';
                icon = GitBranch;
              } else if (nodeNameLower.includes('loop') || nodeNameLower.includes('foreach') || nodeNameLower.includes('for each')) {
                nodeType = 'loop';
                icon = Repeat;
              } else {
                // Try to determine icon from name
                if (nodeNameLower.includes('gpt') || nodeNameLower.includes('openai') || nodeNameLower.includes('claude')) {
                  icon = MessageSquare;
                } else if (nodeNameLower.includes('dall-e') || nodeNameLower.includes('image')) {
                  icon = Image;
                } else if (nodeNameLower.includes('json')) {
                  icon = FileJson;
                } else if (nodeNameLower.includes('text') || nodeNameLower.includes('replace')) {
                  icon = Type;
                } else if (nodeNameLower.includes('date')) {
                  icon = Calendar;
                }
              }
              
              // Extract category from description if available
              const category = apiNode.description || '';
              
              // Build node object
              const workflowNode: WorkflowNode = {
                id: apiNode.id,
                type: nodeType,
                title: title,
                icon: icon,
                category: category,
                nodeType: apiNode.script_type || 'GLOBAL',
                configured: true, // Assume configured if loaded from API
                config: {
                  script_id: apiNode.script_id,
                  custom_script_id: apiNode.custom_script_id,
                  script_type: apiNode.script_type,
                  max_retries: apiNode.max_retries,
                  timeout_seconds: apiNode.timeout_seconds,
                  meta_data: apiNode.meta_data || {},
                },
                parameters: [], // Will be populated if needed
              };
              
              // Add branches for conditional nodes
              if (nodeType === 'conditional') {
                workflowNode.branches = {
                  true: [],
                  false: [],
                };
              }
              
              // Add loopBody for loop nodes
              if (nodeType === 'loop') {
                workflowNode.loopBody = [];
              }
              
              return workflowNode;
            });
            
            // If no nodes from API, keep default trigger node
            if (mappedNodes.length > 0) {
              setNodes(mappedNodes);
            }
          }
        }
      } catch (error) {
        console.error('Error loading workflow from API:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load workflow from API',
          variant: 'destructive',
        });
        
        // Fallback to localStorage
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
      } finally {
        setIsLoadingWorkflow(false);
      }
    };

    loadWorkflowFromAPI();
  }, [id, currentWorkspace?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Optimized scroll to node with ref
  const scrollToNewNode = useCallback((nodeId: string) => {
    setTimeout(() => {
      if (!scrollContainerRef.current) {
        scrollContainerRef.current = document.querySelector('.overflow-auto');
      }
      
      const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
      
      if (scrollContainerRef.current && nodeElement) {
        nodeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  }, []);

  const handleAddNode = useCallback(async (category: string, subcategory: string, nodeType: string, scriptId: string, afterNodeId?: string) => {
    // Map node types to icons and configured status
    const nodeIcons: Record<string, LucideIcon> = {
      'GPT-4 Completion': MessageSquare,
      'DALL-E Image': Image,
      'Embeddings': Hash,
      'Claude': MessageSquare,
      'JSON Parse': FileJson,
      'Text Replace': Type,
      'Date Format': Calendar,
      'If/Else': GitBranch,
      'For Each': Repeat,
    };

    // Find the index where the new node should be inserted
    const insertIndex = afterNodeId 
      ? nodes.findIndex(n => n.id === afterNodeId) + 1
      : nodes.length;

    // Check if this is a conditional or loop node (these don't have script_id)
    if (nodeType === 'If/Else' || nodeType === 'For Each' || !scriptId) {
      // For conditional/loop nodes or nodes without script_id, use local state
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
        scrollToNewNode(newNode.id);
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
        scrollToNewNode(newNode.id);
        return;
      }
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

    // Check if we have workspace and workflow IDs for API call
    if (!currentWorkspace?.id || !id || id === 'new') {
      // Fallback to local state if workspace/workflow not available
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
      scrollToNewNode(newNode.id);
      return;
    }

    // Prepare node data for API
    const nodeName = `Node${nodes.length} - ${nodeType}`;
    const nodeDescription = `${nodeType} node from ${category} > ${subcategory}`;
    
    // Extract input_params from parameters (default empty object for now)
    const inputParams: Record<string, any> = {};
    const nodeParams = getNodeParameters(nodeType);
    nodeParams?.forEach(param => {
      if (param.value !== undefined && param.value !== '') {
        inputParams[param.id] = param.value;
      }
    });

    const nodeData = {
      name: nodeName,
      script_id: scriptId,
      description: nodeDescription,
      input_params: inputParams,
    };

    try {
      // Call API to add node
      const response = await addNodeToWorkflow(currentWorkspace.id, id, nodeData);
      
      // Create node from API response
      const apiNodeId = response.data?.id || response.data?.node_id || `node-${Date.now()}`;
      const newNode: WorkflowNode = {
        id: apiNodeId,
        type: 'action',
        title: nodeType,
        icon: nodeIcons[nodeType] || Settings,
        category: `${category} > ${subcategory}`,
        nodeType: category,
        configured: false,
        config: {},
        parameters: getNodeParameters(nodeType),
      };

      const newNodes = [...nodes];
      newNodes.splice(insertIndex, 0, newNode);
      setNodes(newNodes);
      scrollToNewNode(newNode.id);

      // Create edge between previous node and new node
      try {
        // Determine from_node_id: if afterNodeId is provided, use it; otherwise use the last node before insertIndex
        let fromNodeId: string | null = null;
        
        if (afterNodeId) {
          // Use the node specified by afterNodeId
          fromNodeId = afterNodeId;
        } else if (insertIndex > 0) {
          // Use the node before the insertion point
          fromNodeId = nodes[insertIndex - 1]?.id || null;
        } else if (nodes.length > 0) {
          // If inserting at the beginning but there are existing nodes, use the first node
          fromNodeId = nodes[0]?.id || null;
        }

        // Only create edge if we have a from_node_id (don't create edge for the first node)
        if (fromNodeId && fromNodeId !== apiNodeId) {
          const edgeData = {
            from_node_id: fromNodeId,
            to_node_id: apiNodeId,
          };

          await addEdgeToWorkflow(currentWorkspace.id, id, edgeData);
          console.log('Edge created successfully:', edgeData);
        }
      } catch (edgeError) {
        console.error('Failed to create edge:', edgeError);
        // Don't show error toast for edge creation failure, just log it
        // The node was already added successfully
      }

      toast({
        title: 'Success',
        description: 'Node added to workflow successfully',
      });
    } catch (error) {
      console.error('Failed to add node:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add node to workflow',
        variant: 'destructive',
      });
    }
  }, [nodes, scrollToNewNode, currentWorkspace, id]);

  const handleAddBranch = useCallback((conditionalNodeId: string, branchType: 'true' | 'false') => {
    // In a real implementation, this would open a node selector
  }, []);

  const handleNodeClick = useCallback((node: WorkflowNode) => {
    setSelectedNode(node);
    setShowOutputsPanel(true);
  }, []);

  const handleParameterChange = useCallback((parameterId: string, value: any, isDynamic: boolean = false) => {
    if (!selectedNode) return;

    setNodes(prevNodes => prevNodes.map(node => {
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
  }, [selectedNode]);

  // Helper function to generate example output from output_schema
  const generateExampleOutputFromSchema = (outputSchema: any): any => {
    if (!outputSchema) {
      return { message: 'No output schema available' };
    }

    // If output_schema is a JSON Schema object
    if (outputSchema.type === 'object' && outputSchema.properties) {
      const example: any = {};
      Object.entries(outputSchema.properties).forEach(([key, prop]: [string, any]) => {
        if (prop.type === 'string') {
          example[key] = prop.description || `example_${key}`;
        } else if (prop.type === 'integer' || prop.type === 'number') {
          example[key] = prop.default || 0;
        } else if (prop.type === 'boolean') {
          example[key] = prop.default || false;
        } else if (prop.type === 'array') {
          example[key] = [];
        } else if (prop.type === 'object') {
          example[key] = generateExampleOutputFromSchema(prop);
        } else {
          example[key] = null;
        }
      });
      return example;
    }

    // If output_schema is already an object (direct output structure)
    if (typeof outputSchema === 'object' && !outputSchema.type) {
      const example: any = {};
      Object.keys(outputSchema).forEach(key => {
        const value = outputSchema[key];
        if (typeof value === 'string') {
          example[key] = `example_${key}`;
        } else if (typeof value === 'number') {
          example[key] = value;
        } else if (typeof value === 'boolean') {
          example[key] = value;
        } else if (Array.isArray(value)) {
          example[key] = [];
        } else if (typeof value === 'object') {
          example[key] = generateExampleOutputFromSchema(value);
        } else {
          example[key] = null;
        }
      });
      return example;
    }

    return { message: 'Output schema format not recognized' };
  };

  // Fetch node outputs from API
  useEffect(() => {
    const fetchNodeOutputs = async () => {
      if (!currentWorkspace?.id || !id || id === 'new' || nodes.length === 0) {
        return;
      }

      setIsLoadingOutputs(true);
      const outputs: Record<string, {
        nodeId: string;
        nodeName: string;
        icon: LucideIcon;
        output: any;
      }> = {};

      try {
        // Fetch form-schema for each node to get output_schema
        await Promise.all(
          nodes.map(async (node) => {
            try {
              const response = await getNodeFormSchema(
                currentWorkspace.id,
                id,
                node.id
              );

              if (response.status === 'success' && response.data) {
                const outputSchema = response.data.output_schema;
                const exampleOutput = generateExampleOutputFromSchema(outputSchema);
                
                outputs[node.id] = {
                  nodeId: node.id,
                  nodeName: response.data.node_name || node.title,
                  icon: node.icon || Settings,
                  output: exampleOutput,
                };
              }
            } catch (error) {
              console.error(`Failed to fetch output for node ${node.id}:`, error);
              // Fallback to empty output if API fails
              outputs[node.id] = {
                nodeId: node.id,
                nodeName: node.title,
                icon: node.icon || Settings,
                output: { error: 'Failed to load output schema' },
              };
            }
          })
        );

        setNodeOutputs(outputs);
      } catch (error) {
        console.error('Error fetching node outputs:', error);
        toast({
          title: 'Warning',
          description: 'Failed to load some node outputs. Using fallback data.',
          variant: 'default',
        });
      } finally {
        setIsLoadingOutputs(false);
      }
    };

    fetchNodeOutputs();
  }, [nodes, currentWorkspace?.id, id]);

  // Generate outputs from API data (memoized)
  const dynamicOutputs = useMemo(() => {
    return nodes.map(node => {
      // Use API data if available, otherwise fallback to empty
      if (nodeOutputs[node.id]) {
        return nodeOutputs[node.id];
      }
      
      // Fallback for nodes without API data
      return {
        nodeId: node.id,
        nodeName: node.title,
        icon: node.icon || Settings,
        output: { message: 'Output schema not loaded yet' },
      };
    });
  }, [nodes, nodeOutputs]);

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    // Check if we have workspace and workflow IDs for API call
    if (!currentWorkspace?.id || !id || id === 'new') {
      // Fallback to local state if workspace/workflow not available
      setNodes(nodes.filter(node => node.id !== nodeId));
      return;
    }

    try {
      // Call API to delete node
      await deleteNodeFromWorkflow(currentWorkspace.id, id, nodeId);
      
      // Remove node from local state
      setNodes(nodes.filter(node => node.id !== nodeId));
      
      // If deleted node was selected, clear selection
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
        setShowOutputsPanel(false);
      }

      toast({
        title: 'Success',
        description: 'Node deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete node:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete node from workflow',
        variant: 'destructive',
      });
    }
  }, [nodes, currentWorkspace?.id, id, selectedNode]);

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

    // If new workflow, navigate to edit URL
    if (id === 'new') {
      navigate(`/workflows/${workflowId}/edit`, { replace: true });
    }
  };

  // Transform execution data to test results format
  const executionTestResults = useMemo(() => {
    if (!executionData || !executionData.results) return null;

    // Map execution data to test results format
    const nodeResults: Record<string, any> = {};
    
    // executionData.results is an object with node IDs as keys
    Object.entries(executionData.results).forEach(([nodeId, result]: [string, any]) => {
      nodeResults[nodeId] = {
        node_id: nodeId,
        node_name: result.node_name || nodes.find(n => n.id === nodeId)?.title || 'Unknown Node',
        status: result.status || 'SUCCESS',
        result_data: result.result_data || {},
        duration_seconds: result.duration_seconds || 0,
        completed_at: executionData.ended_at || executionData.started_at,
        error_message: result.error_message || null,
      };
    });

    const successfulNodes = Object.values(nodeResults).filter((r: any) => r.status === 'SUCCESS' || r.status === 'success').length;
    const failedNodes = Object.values(nodeResults).filter((r: any) => r.status === 'FAILED' || r.status === 'failed' || r.status === 'FAILURE').length;

    return {
      summary: {
        total_nodes: Object.keys(nodeResults).length || nodes.length,
        completed_nodes: Object.keys(nodeResults).length || nodes.length,
        successful_nodes: successfulNodes,
        failed_nodes: failedNodes,
        skipped_nodes: 0,
      },
      node_results: nodeResults,
      final_output: executionData.results ? (Object.values(executionData.results) as any[])[Object.values(executionData.results).length - 1]?.result_data : null,
      metadata: {
        workflow_version: '1.0.0',
        execution_mode: 'test',
        completed_at: executionData.ended_at || executionData.started_at,
        duration: executionData.duration || 0,
      },
    };
  }, [executionData, nodes]);

  // Mock test results (memoized) - fallback when no execution data
  const mockTestResults = useMemo(() => {
    const nodeResults: Record<string, any> = {};
    
    nodes.forEach((node, index) => {
      if (node.type === 'trigger') {
        nodeResults[node.id] = {
          node_id: node.id,
          node_name: node.title,
          status: 'SUCCESS',
          result_data: {
            user_id: '12345',
            email: 'user@example.com',
            timestamp: '2025-01-15T10:30:00Z',
            data: {
              name: 'John Doe',
              age: 30,
            },
          },
          duration_seconds: 0.5,
          completed_at: new Date().toISOString(),
        };
      } else if (node.title === 'GPT-4 Completion') {
        nodeResults[node.id] = {
          node_id: node.id,
          node_name: node.title,
          status: 'SUCCESS',
          result_data: {
            id: 'resp_abc123',
            object: 'response',
            created_at: 1741476542,
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'text',
                    text: 'This is a generated AI response based on the provided prompt...',
                  },
                ],
              },
            ],
            usage: {
              input_tokens: 36,
              output_tokens: 87,
            },
          },
          duration_seconds: 2.3,
          completed_at: new Date().toISOString(),
        };
      } else {
        nodeResults[node.id] = {
          node_id: node.id,
          node_name: node.title,
          status: index % 5 === 4 ? 'FAILED' : 'SUCCESS',
          result_data: {
            status: 'processed',
            data: {
              result: `Output from ${node.title}`,
              timestamp: new Date().toISOString(),
            },
          },
          duration_seconds: Math.random() * 3,
          completed_at: new Date().toISOString(),
          ...(index % 5 === 4 && {
            error_message: 'Connection timeout - unable to reach external service',
          }),
        };
      }
    });

    return {
      summary: {
        total_nodes: nodes.length,
        completed_nodes: nodes.length,
        successful_nodes: nodes.filter((_, i) => i % 5 !== 4).length,
        failed_nodes: nodes.filter((_, i) => i % 5 === 4).length,
        skipped_nodes: 0,
      },
      node_results: nodeResults,
      final_output: Object.values(nodeResults)[Object.values(nodeResults).length - 1]?.result_data,
      metadata: {
        workflow_version: '1.0.0',
        execution_mode: 'normal',
        completed_at: new Date().toISOString(),
      },
    };
  }, [nodes]);

  // Fetch execution details
  const fetchExecutionDetails = useCallback(async (execId: string) => {
    if (!currentWorkspace?.id) return;

    setIsLoadingExecution(true);
    try {
      const response = await getExecution(currentWorkspace.id, execId);
      
      if (response.status === 'success' && response.data) {
        setExecutionData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch execution details:', error);
      toast({
        title: 'Warning',
        description: 'Failed to load execution details. Using mock data.',
        variant: 'default',
      });
    } finally {
      setIsLoadingExecution(false);
    }
  }, [currentWorkspace?.id]);

  const handleTest = useCallback(async () => {
    // Check if we have workspace and workflow IDs for API call
    if (!currentWorkspace?.id || !id || id === 'new') {
      toast({
        title: 'Error',
        description: 'Please save the workflow before testing',
        variant: 'destructive',
      });
      return;
    }

    setIsRunningTest(true);
    try {
      const testData = {
        input_data: {
          test: 'data'
        }
      };

      const response = await testWorkflowExecution(currentWorkspace.id, id, testData);
      
      // Extract execution_id from response
      const executionIdFromResponse = response.data?.execution_id || response.data?.id || response.data?.executionId;
      
      if (executionIdFromResponse) {
        setExecutionId(executionIdFromResponse);
        // Fetch execution details immediately
        await fetchExecutionDetails(executionIdFromResponse);
      } else {
        toast({
          title: 'Warning',
          description: 'Execution started but execution ID not found in response',
          variant: 'default',
        });
      }
      
      toast({
        title: 'Success',
        description: 'Workflow test execution started successfully',
      });

      // Switch to test tab to show results
      setActiveTab('test');
    } catch (error) {
      console.error('Failed to test workflow:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to test workflow execution',
        variant: 'destructive',
      });
    } finally {
      setIsRunningTest(false);
    }
  }, [currentWorkspace?.id, id, fetchExecutionDetails]);

  // Poll execution details if execution is running
  useEffect(() => {
    if (!executionId || !currentWorkspace?.id) return;

    // Poll every 2 seconds if execution is still running
    const pollInterval = setInterval(() => {
      if (executionData?.status === 'RUNNING' || executionData?.status === 'running' || executionData?.status === 'PENDING' || executionData?.status === 'pending') {
        fetchExecutionDetails(executionId);
      } else {
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [executionId, currentWorkspace?.id, fetchExecutionDetails, executionData?.status]);

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

  if (isLoadingWorkflow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

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
                  variant="default"
                  size="sm"
                  onClick={handleTest}
                  disabled={isRunningTest || !currentWorkspace?.id || !id || id === 'new'}
                  loading={isRunningTest}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Run
                </Button>
                <div className="flex items-center gap-3 px-4 py-2 bg-surface border border-border rounded-lg">
                  <Label htmlFor="workflow-active" className="text-sm font-medium cursor-pointer">
                    {isActive ? 'Active' : 'Inactive'}
                  </Label>
                  <Switch 
                    id="workflow-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b border-border bg-surface/30">
            <div className="container mx-auto px-6 flex justify-center">
              <TabsList className="bg-transparent border-0 p-0 h-12">
                <TabsTrigger 
                  value="editor" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
                >
                  Editor
                </TabsTrigger>
                <TabsTrigger 
                  value="test" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
                >
                  Test
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Editor Tab Content */}
          <TabsContent value="editor" className="mt-0">
            {/* Workflow Canvas */}
            <div 
              className="relative h-[calc(100vh-144px)] overflow-auto bg-background"
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
                    {/* Default Trigger Card */}
                    <div className="mb-6">
                      <DefaultTriggerCard workspaceId={currentWorkspace?.id} workflowId={id} />
                    </div>

                    {nodes.length === 0 ? (
                      // Empty state - show Add Node button for first node
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="text-center mb-6">
                          <p className="text-lg font-medium text-foreground mb-2">No nodes yet</p>
                          <p className="text-sm text-muted-foreground">Add your first node to get started</p>
                        </div>
                        <AddNodeButton 
                          onAddNode={(cat, sub, type, scriptId) => handleAddNode(cat, sub, type, scriptId)} 
                        />
                      </div>
                    ) : (
                      nodes.map((node, index) => (
                        <div key={node.id} className="relative" data-node-id={node.id}>
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

                          {/* Connection line between nodes */}
                          {index < nodes.length - 1 ? (
                            // Between nodes: just show connection line
                            <div className="flex flex-col items-center my-3">
                              <div className="w-0.5 h-8 bg-border" />
                            </div>
                          ) : (
                            // After last node: show connection line and Add button
                            <div className="flex flex-col items-center my-3" id={`add-node-${index}`}>
                              <div className="w-0.5 h-4 bg-border" />
                              <AddNodeButton 
                                onAddNode={(cat, sub, type, scriptId) => handleAddNode(cat, sub, type, scriptId, node.id)} 
                                onMenuOpen={() => {
                                  // Scroll to align the menu at the bottom of the viewport
                                  const addNodeElement = document.getElementById(`add-node-${index}`);
                                  if (addNodeElement) {
                                    const menuHeight = 384 + 48; // max-h-96 (384px) + top offset (48px)
                                    const viewportHeight = window.innerHeight - 144; // minus toolbar + tabs height
                                    const elementRect = addNodeElement.getBoundingClientRect();
                                    const scrollContainer = document.querySelector('.overflow-auto');
                                    
                                    if (scrollContainer) {
                                      // Calculate the scroll position to align menu bottom with viewport bottom
                                      const currentScroll = scrollContainer.scrollTop;
                                      const elementTop = elementRect.top + currentScroll - 144; // minus toolbar + tabs
                                      const targetScroll = elementTop + menuHeight - viewportHeight * 0.95;
                                      
                                      scrollContainer.scrollTo({
                                        top: Math.max(0, targetScroll),
                                        behavior: 'smooth'
                                      });
                                    }
                                  }
                                }}
                              />
                              <div className="w-0.5 h-4 bg-border" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
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
                workspaceId={currentWorkspace?.id}
                workflowId={id}
              />
            )}

            {/* Outputs Panel */}
            <OutputsPanel
              outputs={dynamicOutputs}
              isOpen={showOutputsPanel}
              currentNodeId={selectedNode?.id}
            />
          </TabsContent>

          {/* Test Tab Content */}
          <TabsContent value="test" className="mt-0">
            <div className="h-[calc(100vh-144px)] overflow-auto bg-background">
              <div className="container mx-auto px-6 py-8 space-y-6">
                {isLoadingExecution ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading execution details...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Test Summary Card */}
                    <TestSummaryCard
                      totalNodes={executionTestResults?.summary.total_nodes || mockTestResults.summary.total_nodes}
                      successfulNodes={executionTestResults?.summary.successful_nodes || mockTestResults.summary.successful_nodes}
                      failedNodes={executionTestResults?.summary.failed_nodes || mockTestResults.summary.failed_nodes}
                      totalDuration={executionTestResults?.metadata.duration || nodes.reduce((total, node) => {
                        const testResults = executionTestResults || mockTestResults;
                        return total + (testResults.node_results[node.id]?.duration_seconds || 0);
                      }, 0)}
                      averageNodeTime={
                        nodes.length > 0
                          ? nodes.reduce((total, node) => {
                              const testResults = executionTestResults || mockTestResults;
                              return total + (testResults.node_results[node.id]?.duration_seconds || 0);
                            }, 0) / nodes.length
                          : 0
                      }
                    />

                    {/* Timeline and Logs - Side by Side */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Execution Timeline */}
                      <div className="min-h-[600px] flex flex-col">
                        <ExecutionTimeline
                          nodes={nodes.map((node, index) => {
                            const testResults = executionTestResults || mockTestResults;
                            const nodeResult = testResults.node_results[node.id];
                            const NodeIcon = node.icon || Settings;
                            
                            // Get input data from previous nodes (simplified)
                            const firstNode = nodes[0];
                            const inputData = node.type === 'trigger' ? undefined : {
                              trigger_data: firstNode ? testResults.node_results[firstNode.id]?.result_data : undefined,
                            };

                            return {
                              nodeId: node.id,
                              nodeName: node.title,
                              nodeIcon: NodeIcon,
                              status: nodeResult?.status || 'PENDING',
                              inputData,
                              outputData: nodeResult?.result_data,
                              metadata: {
                                duration_seconds: nodeResult?.duration_seconds || 0,
                                completed_at: nodeResult?.completed_at,
                              },
                              errorMessage: nodeResult?.error_message,
                              order: index + 1,
                            };
                          })}
                          totalDuration={executionTestResults?.metadata.duration || nodes.reduce((total, node) => {
                            const testResults = executionTestResults || mockTestResults;
                            return total + (testResults.node_results[node.id]?.duration_seconds || 0);
                          }, 0)}
                        />
                      </div>

                      {/* Execution Logs */}
                      <div className="bg-surface border border-border rounded-lg min-h-[600px] flex flex-col">
                        <div className="px-6 py-4 border-b border-border flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                              <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold">Execution Logs</h3>
                              <p className="text-xs text-muted-foreground">Detailed execution logs and debug information</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-hidden">
                          <div className="bg-background rounded-md p-4 font-mono text-xs h-full overflow-auto border border-border">
                            <div className="space-y-1">
                              {executionData ? (
                                <>
                                  <p className="text-success">[INFO] Workflow test started</p>
                                  <p className="text-muted-foreground">[INFO] Execution ID: {executionData.id}</p>
                                  <p className="text-muted-foreground">[INFO] Status: {executionData.status}</p>
                                  <p className="text-muted-foreground">[INFO] Started at: {new Date(executionData.started_at).toLocaleString()}</p>
                                  {executionData.ended_at && (
                                    <p className="text-muted-foreground">[INFO] Ended at: {new Date(executionData.ended_at).toLocaleString()}</p>
                                  )}
                                  <p className="text-muted-foreground">[INFO] Duration: {executionData.duration?.toFixed(3)}s</p>
                                  <p className="text-success">[INFO] Executing workflow...</p>
                                  {nodes.map((node) => {
                                    const testResults = executionTestResults || mockTestResults;
                                    const result = testResults.node_results[node.id];
                                    const statusClass = result?.status === 'SUCCESS' || result?.status === 'success' 
                                      ? 'text-success' 
                                      : result?.status === 'FAILED' || result?.status === 'failed' 
                                      ? 'text-destructive' 
                                      : 'text-muted-foreground';
                                    return (
                                      <p 
                                        key={node.id}
                                        className={statusClass}
                                      >
                                        [{result?.status || 'PENDING'}] {node.title} - {result?.duration_seconds ? `completed in ${result.duration_seconds.toFixed(3)}s` : 'pending'}
                                        {result?.error_message && (
                                          <span className="block ml-4 text-destructive">↳ Error: {result.error_message}</span>
                                        )}
                                      </p>
                                    );
                                  })}
                                  <p className={executionData.status === 'COMPLETED' ? 'text-success' : executionData.status === 'FAILED' ? 'text-destructive' : 'text-muted-foreground'}>
                                    [INFO] Test execution {executionData.status?.toLowerCase() || 'completed'}
                                  </p>
                                  <p className="text-muted-foreground">
                                    [SUMMARY] Success: {executionTestResults?.summary.successful_nodes || 0}, Failed: {executionTestResults?.summary.failed_nodes || 0}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-muted-foreground">[INFO] No execution data available</p>
                                  <p className="text-muted-foreground">[INFO] Click "Run" button to start a test execution</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Final Result */}
                    {(() => {
                      const testResults = executionTestResults || mockTestResults;
                      
                      // Get the last node's result data
                      let finalResult = null;
                      
                      if (executionData && executionData.results) {
                        // If we have execution data, get the last node's result
                        const lastNode = nodes[nodes.length - 1];
                        if (lastNode && executionData.results[lastNode.id]) {
                          finalResult = executionData.results[lastNode.id].result_data;
                        } else {
                          // If last node not found, get the last result from results object
                          const resultEntries = Object.entries(executionData.results);
                          if (resultEntries.length > 0) {
                            const lastResult = resultEntries[resultEntries.length - 1][1] as any;
                            finalResult = lastResult?.result_data || null;
                          }
                        }
                      } else if (nodes.length > 0) {
                        // Fallback to test results
                        const lastNode = nodes[nodes.length - 1];
                        finalResult = testResults.node_results[lastNode.id]?.result_data || null;
                      }
                      
                      if (!finalResult) return null;

                      return (
                        <div className="bg-surface/50 border border-border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-sm font-medium">Final Result</span>
                          </div>
                          <div className="bg-background rounded p-3 font-mono text-xs overflow-auto max-h-[300px]">
                            <pre className="whitespace-pre-wrap break-words m-0">
                              {JSON.stringify(finalResult, null, 2)}
                            </pre>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PathProvider>
  );
}
