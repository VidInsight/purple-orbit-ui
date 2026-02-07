import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pause, Zap, MessageSquare, Image, Hash, FileJson, Type, Calendar, GitBranch, Repeat, Settings, LucideIcon, Play, CheckCircle, Loader2, XCircle, AlertCircle, StopCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { addNodeToWorkflow, getWorkflowGraph, addEdgeToWorkflow, stopExecution, getNodeFormSchema, deleteNodeFromWorkflow, testWorkflowExecution, getExecution, insertNodeBetween } from '@/services/workflowApi';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [showStopConfirmDialog, setShowStopConfirmDialog] = useState(false);
  const [isStoppingExecution, setIsStoppingExecution] = useState(false);

  // Trigger data for OutputsPanel
  const [triggerData, setTriggerData] = useState<{ input_mapping: Record<string, { type: string; value: any }> } | null>(null);

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
            const nodeMap = new Map<string, WorkflowNode>();
            const mappedNodes: WorkflowNode[] = workflowData.nodes.map((apiNode: any) => {
              // Determine node type based on name or script_type
              let nodeType: 'trigger' | 'action' | 'conditional' | 'loop' = 'action';
              let icon: LucideIcon = Settings;
              let title = toDisplayLabel(apiNode.name || 'Unnamed Node');

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

              nodeMap.set(apiNode.id, workflowNode);
              return workflowNode;
            });

            // Sort nodes based on edges if edges are available
            let sortedNodes = mappedNodes;
            if (workflowData.edges && Array.isArray(workflowData.edges) && workflowData.edges.length > 0) {
              // Build adjacency list: nodeId -> [nextNodeIds]
              const adjacencyList = new Map<string, string[]>();
              const inDegree = new Map<string, number>();

              // Initialize in-degree for all nodes
              mappedNodes.forEach(node => {
                inDegree.set(node.id, 0);
                adjacencyList.set(node.id, []);
              });

              // Build graph from edges
              workflowData.edges.forEach((edge: any) => {
                const fromId = edge.from_node_id || edge.from;
                const toId = edge.to_node_id || edge.to;

                if (fromId && toId && nodeMap.has(fromId) && nodeMap.has(toId)) {
                  const current = adjacencyList.get(fromId) || [];
                  current.push(toId);
                  adjacencyList.set(fromId, current);

                  inDegree.set(toId, (inDegree.get(toId) || 0) + 1);
                }
              });

              // Topological sort: find nodes with no incoming edges first
              const queue: string[] = [];
              inDegree.forEach((degree, nodeId) => {
                if (degree === 0) {
                  queue.push(nodeId);
                }
              });

              const sorted: WorkflowNode[] = [];
              const visited = new Set<string>();

              while (queue.length > 0) {
                const currentNodeId = queue.shift()!;
                if (visited.has(currentNodeId)) continue;

                const currentNode = nodeMap.get(currentNodeId);
                if (currentNode) {
                  sorted.push(currentNode);
                  visited.add(currentNodeId);
                }

                const nextNodes = adjacencyList.get(currentNodeId) || [];
                nextNodes.forEach(nextNodeId => {
                  const currentInDegree = (inDegree.get(nextNodeId) || 0) - 1;
                  inDegree.set(nextNodeId, currentInDegree);

                  if (currentInDegree === 0 && !visited.has(nextNodeId)) {
                    queue.push(nextNodeId);
                  }
                });
              }

              // Add any remaining nodes that weren't connected (shouldn't happen, but just in case)
              mappedNodes.forEach(node => {
                if (!visited.has(node.id)) {
                  sorted.push(node);
                }
              });

              sortedNodes = sorted;
            }

            // If no nodes from API, keep default trigger node
            if (sortedNodes.length > 0) {
              setNodes(sortedNodes);
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

  // Normalize node/category labels: spaces instead of underscores, first letter of each word uppercase
  const toDisplayLabel = (s: string) =>
    (s || '')
      .replace(/_/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const handleAddNode = useCallback(async (category: string, subcategory: string, nodeType: string, scriptId: string, afterNodeId?: string) => {
    // Map node types to icons and configured status (keys may use spaces or underscores)
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
          title: toDisplayLabel(nodeType),
          icon: nodeIcons[nodeType],
          category: `${toDisplayLabel(category)} > ${toDisplayLabel(subcategory)}`,
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
          title: toDisplayLabel(nodeType),
          icon: nodeIcons[nodeType],
          category: `${toDisplayLabel(category)} > ${toDisplayLabel(subcategory)}`,
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
        title: toDisplayLabel(nodeType),
        icon: nodeIcons[nodeType],
        category: `${toDisplayLabel(category)} > ${toDisplayLabel(subcategory)}`,
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

    // Prepare node data for API (use normal spaces in names, no underscores)
    const nodeName = `Node ${nodes.length} - ${toDisplayLabel(nodeType)}`;
    const nodeDescription = `${toDisplayLabel(nodeType)} node from ${toDisplayLabel(category)} > ${toDisplayLabel(subcategory)}`;

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
        title: toDisplayLabel(nodeType),
        icon: nodeIcons[nodeType] || Settings,
        category: `${toDisplayLabel(category)} > ${toDisplayLabel(subcategory)}`,
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

  const handleInsertNodeBetween = useCallback(async (fromNodeId: string, toNodeId: string, category: string, subcategory: string, nodeType: string, scriptId: string) => {
    // Map node types to icons
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

    // Check if we have workspace and workflow IDs for API call
    if (!currentWorkspace?.id || !id || id === 'new') {
      toast({
        title: 'Error',
        description: 'Please save the workflow before inserting nodes',
        variant: 'destructive',
      });
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

    // Prepare node data for API (use normal spaces in names, no underscores)
    const nodeName = `Node ${nodes.length} - ${toDisplayLabel(nodeType)}`;
    const nodeDescription = `${toDisplayLabel(nodeType)} node from ${toDisplayLabel(category)} > ${toDisplayLabel(subcategory)}`;

    // Extract input_params from parameters (default empty object for now)
    const inputParams: Record<string, any> = {};
    const nodeParams = getNodeParameters(nodeType);
    nodeParams?.forEach(param => {
      if (param.value !== undefined && param.value !== '') {
        inputParams[param.id] = param.value;
      }
    });

    const nodeData = {
      from_node_id: fromNodeId,
      to_node_id: toNodeId,
      name: nodeName,
      script_id: scriptId,
      description: nodeDescription,
      input_params: inputParams,
      output_params: {},
      meta_data: {},
      max_retries: 3,
      timeout_seconds: 300,
    };

    try {
      // Call API to insert node between
      const response = await insertNodeBetween(currentWorkspace.id, id, nodeData);

      // Create node from API response
      const apiNodeId = response.data?.id || response.data?.node_id || `node-${Date.now()}`;
      const newNode: WorkflowNode = {
        id: apiNodeId,
        type: 'action',
        title: toDisplayLabel(nodeType),
        icon: nodeIcons[nodeType] || Settings,
        category: `${toDisplayLabel(category)} > ${toDisplayLabel(subcategory)}`,
        nodeType: category,
        configured: false,
        config: {},
        parameters: getNodeParameters(nodeType),
      };

      // Find the index of toNodeId and insert before it
      const toNodeIndex = nodes.findIndex(n => n.id === toNodeId);
      const insertIndex = toNodeIndex >= 0 ? toNodeIndex : nodes.length;

      const newNodes = [...nodes];
      newNodes.splice(insertIndex, 0, newNode);
      setNodes(newNodes);
      scrollToNewNode(newNode.id);

      toast({
        title: 'Success',
        description: 'Node inserted between nodes successfully',
      });
    } catch (error) {
      console.error('Failed to insert node between:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to insert node between nodes',
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

  const handleNodeConfigured = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, configured: true } : n));
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

  // Helper: extract real data from schema property (type + value format or nested schema)
  const extractValueFromSchemaProperty = (prop: any): any => {
    if (prop == null) return null;
    // If property has explicit "value", use it (full example data for primitives or arrays/objects)
    if (Object.prototype.hasOwnProperty.call(prop, 'value')) {
      const v = prop.value;
      // If value is array, ensure each item is extracted (in case items are schema-shaped)
      if (Array.isArray(v)) {
        return v.map((item: any) =>
          item && typeof item === 'object' && (item.type === 'object' || item.properties)
            ? extractValueFromSchemaProperty(item)
            : item && typeof item === 'object' && item.type && item.properties
              ? buildExampleFromObjectSchema(item)
              : item
        );
      }
      // If value is object that looks like schema (type+properties), recurse
      if (v && typeof v === 'object' && !Array.isArray(v) && v.type === 'object' && v.properties) {
        return buildExampleFromObjectSchema(v);
      }
      return v;
    }
    // No value: build from type/properties/items
    if (prop.type === 'string') return prop.value ?? '';
    if (prop.type === 'integer' || prop.type === 'number') return prop.value ?? 0;
    if (prop.type === 'boolean') return prop.value ?? false;
    if (prop.type === 'array') {
      if (prop.items) {
        const one = buildExampleFromSchemaNode(prop.items);
        return one != null ? [one] : [];
      }
      return [];
    }
    if (prop.type === 'object' && prop.properties) {
      return buildExampleFromObjectSchema(prop);
    }
    return null;
  };

  const buildExampleFromObjectSchema = (schema: any): any => {
    if (!schema || !schema.properties) return {};
    const example: any = {};
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      example[key] = extractValueFromSchemaProperty(prop);
    });
    return example;
  };

  const buildExampleFromSchemaNode = (node: any): any => {
    if (node == null) return null;
    if (node.type === 'object' && node.properties) return buildExampleFromObjectSchema(node);
    if (node.type === 'array' && node.items) return [buildExampleFromSchemaNode(node.items)];
    if (Object.prototype.hasOwnProperty.call(node, 'value')) return node.value;
    if (node.type === 'string') return node.value ?? '';
    if (node.type === 'integer' || node.type === 'number') return node.value ?? 0;
    if (node.type === 'boolean') return node.value ?? false;
    return null;
  };

  // Generate example output from output_schema (supports type+value format and nested objects/arrays)
  const generateExampleOutputFromSchema = (outputSchema: any): any => {
    if (!outputSchema) {
      return { message: 'No output schema available' };
    }

    // Root: JSON Schema style { type: 'object', properties: { ... } } with optional "value" per property
    if (outputSchema.type === 'object' && outputSchema.properties) {
      return buildExampleFromObjectSchema(outputSchema);
    }

    // Direct output structure (plain object without type)
    if (typeof outputSchema === 'object' && !outputSchema.type) {
      const example: any = {};
      Object.keys(outputSchema).forEach(key => {
        const value = outputSchema[key];
        if (value && typeof value === 'object' && value.type === 'object' && value.properties) {
          example[key] = buildExampleFromObjectSchema(value);
        } else if (value && typeof value === 'object' && value.type === 'array' && value.items) {
          example[key] = value.value && Array.isArray(value.value)
            ? value.value.map((item: any) =>
              item && typeof item === 'object' && item.properties
                ? buildExampleFromObjectSchema(item)
                : item
            )
            : [buildExampleFromSchemaNode(value.items)];
        } else if (typeof value === 'string') {
          example[key] = `example_${key}`;
        } else if (typeof value === 'number') {
          example[key] = value;
        } else if (typeof value === 'boolean') {
          example[key] = value;
        } else if (Array.isArray(value)) {
          example[key] = value;
        } else if (value && typeof value === 'object' && 'value' in value) {
          example[key] = value.value;
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

  const handleStopExecution = useCallback(async () => {
    if (!currentWorkspace?.id || !executionId) return;

    setIsStoppingExecution(true);
    setShowStopConfirmDialog(false);
    try {
      const response = await stopExecution(currentWorkspace.id, executionId);
      if (response.status === 'success') {
        setActiveTab('test');
        setExecutionData((prev: any) => (prev ? { ...prev, status: 'CANCELLED' } : { id: executionId, status: 'CANCELLED' }));
        fetchExecutionDetails(executionId).then(() => { });
        toast({
          title: 'Çalıştırma durduruldu',
          description: 'İşlem başarıyla sonlandırıldı.',
        });
      }
    } catch (error) {
      console.error('Failed to stop execution:', error);
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Çalıştırma durdurulamadı.',
        variant: 'destructive',
      });
    } finally {
      setIsStoppingExecution(false);
    }
  }, [currentWorkspace?.id, executionId, fetchExecutionDetails]);

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
    // Switch to test tab immediately to show loading
    setActiveTab('test');

    try {
      // Build input_data from trigger's input_mapping parameters
      const inputData: Record<string, any> = {};

      if (triggerData && triggerData.input_mapping) {
        // Extract values from input_mapping format: { paramKey: { type: string, value: any } }
        Object.entries(triggerData.input_mapping).forEach(([paramKey, mappingValue]) => {
          // Use the value from the mapping
          inputData[paramKey] = mappingValue.value;
        });
      }

      // If no trigger data or empty input_mapping, use default test data
      if (Object.keys(inputData).length === 0) {
        inputData.test = 'data';
      }

      const testData = {
        input_data: inputData
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
  }, [currentWorkspace?.id, id, fetchExecutionDetails, triggerData]);

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
    if (e.button !== 0 || e.ctrlKey || e.metaKey) {
      return;
    }

    const target = e.target as Element | null;
    const interactiveSelector = [
      'input',
      'textarea',
      'select',
      'button',
      'a',
      '[contenteditable="true"]',
      '[role="button"]',
      '[role="textbox"]',
      '[data-no-pan="true"]',
    ].join(',');

    if (target && target.closest(interactiveSelector)) {
      return;
    }

    setIsPanning(true);
    setStartPan({ x: e.clientX - panX, y: e.clientY - panY });
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary/30 border-r-primary mb-4"></div>
            <div className="absolute inset-0 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-transparent border-t-primary/60" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div>
            <p className="text-base font-medium text-foreground mb-1">Loading workflow</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your workflow...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PathProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20">
        {/* Modern Toolbar */}
        <div className="sticky top-0 z-50 border-b border-border/50 bg-gradient-to-r from-surface/95 via-surface/90 to-surface/95 backdrop-blur-xl shadow-lg shadow-primary/5">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Side */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/workflows')}
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back
                </Button>

                <div className="h-6 w-px bg-border/50" />

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
                    className="text-xl font-bold bg-transparent border-b-2 border-primary focus:outline-none focus:border-primary/80 transition-colors px-2 py-1"
                  />
                ) : (
                  <h1
                    className="text-xl font-bold cursor-pointer hover:text-primary transition-all duration-200 group flex items-center gap-2"
                  >
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80">
                      {workflowName}
                    </span>
                    <Zap className="h-4 w-4 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all" />
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
                  className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
                >
                  <Play className="h-4 w-4" />
                  Run
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStopConfirmDialog(true)}
                  disabled={
                    !executionId ||
                    isStoppingExecution ||
                    executionData?.status === 'COMPLETED' ||
                    executionData?.status === 'completed' ||
                    executionData?.status === 'FAILED' ||
                    executionData?.status === 'failed' ||
                    executionData?.status === 'CANCELLED' ||
                    executionData?.status === 'cancelled' ||
                    executionData?.status === 'STOPPED' ||
                    executionData?.status === 'stopped'
                  }
                  className="gap-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {isStoppingExecution ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <StopCircle className="h-4 w-4" />
                  )}
                  Durdur
                </Button>
                <AlertDialog open={showStopConfirmDialog} onOpenChange={setShowStopConfirmDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Çalıştırmayı durdurmak istiyor musunuz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Devam eden işlem iptal edilecek ve Test sekmesinde durduruldu olarak görüntülenecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleStopExecution}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Durdur
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <div className="flex items-center gap-3 px-4 py-2 bg-surface/80 border border-border/50 rounded-lg backdrop-blur-sm hover:border-primary/30 transition-all duration-200 group">
                  <Label htmlFor="workflow-active" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                    <span className={isActive ? 'text-success' : 'text-muted-foreground'}>{isActive ? 'Active' : 'Inactive'}</span>
                  </Label>
                  <Switch
                    id="workflow-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="data-[state=checked]:bg-success"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b border-border/50 bg-gradient-to-b from-surface/40 via-surface/30 to-transparent backdrop-blur-sm">
            <div className="container mx-auto px-6 flex justify-center">
              <TabsList className="bg-transparent border-0 p-0 h-14 gap-1">
                <TabsTrigger
                  value="editor"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 h-full font-semibold text-sm transition-all duration-200 data-[state=active]:text-primary data-[state=active]:shadow-[0_-2px_8px_rgba(0,0,0,0.1)] relative group"
                >
                  <span className="relative z-10">Editor</span>
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
                </TabsTrigger>
                <TabsTrigger
                  value="test"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 h-full font-semibold text-sm transition-all duration-200 data-[state=active]:text-primary data-[state=active]:shadow-[0_-2px_8px_rgba(0,0,0,0.1)] relative group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Test
                    {executionId && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Editor Tab Content */}
          <TabsContent value="editor" className="mt-0">
            {/* Workflow Canvas */}
            <div
              className="relative h-[calc(100vh-144px)] overflow-auto bg-gradient-to-br from-background via-background to-surface/10"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Modern Zoom Controls */}
              <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 bg-surface/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl shadow-primary/10 p-2 group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                  title="Zoom In"
                >
                  <span className="text-lg font-semibold">+</span>
                </Button>
                <div className="px-2 py-1.5 text-center">
                  <div className="text-xs font-bold text-primary bg-primary/10 rounded-md px-2 py-1">
                    {Math.round(zoom * 100)}%
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetView}
                  className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg text-xs font-medium"
                  title="Reset View"
                >
                  ↻
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                  title="Zoom Out"
                >
                  <span className="text-lg font-semibold">−</span>
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
                      <DefaultTriggerCard
                        workspaceId={currentWorkspace?.id}
                        workflowId={id}
                        onTriggerDataChange={setTriggerData}
                      />
                    </div>

                    {nodes.length === 0 ? (
                      // Modern Empty state
                      <div className="flex flex-col items-center justify-center py-8 px-6">
                        <div className="relative w-full max-w-4xl">
                          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                          <div className="relative bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl">
                            <div className="flex flex-row items-center gap-6">
                              <div className="flex-shrink-0 p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                                <Zap className="h-8 w-8 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-foreground mb-2">Start Building Your Workflow</h3>
                                <p className="text-sm text-muted-foreground">
                                  Add your first node to begin creating an automated workflow. Connect triggers, actions, and conditions to build powerful automations.
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <AddNodeButton
                                  onAddNode={(cat, sub, type, scriptId) => handleAddNode(cat, sub, type, scriptId)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
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

                          {/* Modern Connection line between nodes */}
                          {index < nodes.length - 1 ? (
                            // Between nodes: modern connection line with insert button
                            <div className="flex flex-col items-center my-4 group relative">
                              <div className="relative w-0.5 h-4">
                                <div className="absolute inset-0 bg-gradient-to-b from-border via-primary/30 to-border" />
                              </div>
                              <AddNodeButton
                                onAddNode={(cat, sub, type, scriptId) => handleInsertNodeBetween(node.id, nodes[index + 1].id, cat, sub, type, scriptId)}
                              />
                              <div className="relative w-0.5 h-4">
                                <div className="absolute inset-0 bg-gradient-to-b from-border via-primary/30 to-border" />
                              </div>
                            </div>
                          ) : (
                            // After last node: modern connection line and Add button
                            <div className="flex flex-col items-center my-4" id={`add-node-${index}`}>
                              <div className="relative w-0.5 h-4">
                                <div className="absolute inset-0 bg-gradient-to-b from-border to-transparent" />
                              </div>
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
                              <div className="relative w-0.5 h-4">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-border" />
                              </div>
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
                onSaveSuccess={handleNodeConfigured}
                workspaceId={currentWorkspace?.id}
                workflowId={id}
              />
            )}

            {/* Outputs Panel */}
            <OutputsPanel
              outputs={dynamicOutputs}
              isOpen={showOutputsPanel}
              currentNodeId={selectedNode?.id}
              triggerData={triggerData}
            />
          </TabsContent>

          {/* Test Tab Content */}
          <TabsContent value="test" className="mt-0">
            <div className="h-[calc(100vh-144px)] overflow-auto bg-gradient-to-br from-background via-background to-surface/10">
              <div className="container mx-auto px-6 py-8 space-y-6">
                {!executionId && !isRunningTest ? (
                  // Modern Empty state
                  <div className="flex items-center justify-center min-h-[calc(100vh-144px)] py-24">
                    <div className="text-center max-w-lg flex flex-col items-center">
                      <div className="relative mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 backdrop-blur-sm">
                          <Play className="h-10 w-10 text-primary shrink-0" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        No Test Execution Yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                        Click the "Run" button in the toolbar to start a test execution and see the results here.
                        Test executions help you verify that your workflow is working correctly before deploying.
                      </p>
                    </div>
                  </div>
                ) : (isRunningTest || isLoadingExecution || (executionData && (executionData.status === 'RUNNING' || executionData.status === 'running' || executionData.status === 'PENDING' || executionData.status === 'pending'))) ? (
                  // Modern Loading state
                  <div className="flex items-center justify-center py-24">
                    <div className="text-center max-w-lg">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 backdrop-blur-sm">
                          <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-foreground">Running Test Execution</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {isRunningTest ? 'Starting workflow execution...' : 'Workflow is running...'}
                      </p>
                      {executionId && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface/80 border border-border/50 rounded-lg backdrop-blur-sm">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <p className="text-xs font-mono text-muted-foreground">
                            Execution ID: {executionId.slice(0, 8)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : executionData && (executionData.status === 'CANCELLED' || executionData.status === 'cancelled' || executionData.status === 'STOPPED' || executionData.status === 'stopped') ? (
                  // Çalıştırma durduruldu sayfası
                  <div className="flex items-center justify-center min-h-[calc(100vh-144px)] py-24">
                    <div className="text-center max-w-lg flex flex-col items-center">
                      <div className="relative mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/30 backdrop-blur-sm">
                          <StopCircle className="h-10 w-10 text-amber-600 dark:text-amber-400 shrink-0" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Çalıştırma Durduruldu
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                        Bu test çalıştırması sizin tarafınızdan veya sistem tarafından sonlandırıldı. Yeni bir test başlatmak için aşağıdaki butonu kullanabilirsiniz.
                      </p>
                      {executionId && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface/80 border border-border/50 rounded-lg backdrop-blur-sm mb-6">
                          <p className="text-xs font-mono text-muted-foreground">
                            İşlem ID: {executionId.slice(0, 12)}...
                          </p>
                        </div>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleTest}
                        disabled={isRunningTest || !currentWorkspace?.id || !id || id === 'new'}
                        className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg hover:shadow-primary/30"
                      >
                        <Play className="h-4 w-4" />
                        Tekrar Çalıştır
                      </Button>
                    </div>
                  </div>
                ) : executionData && (executionData.status === 'COMPLETED' || executionData.status === 'completed' || executionData.status === 'FAILED' || executionData.status === 'failed') ? (
                  // Show results when execution is completed or failed
                  <>
                    {/* Modern Execution Status Banner */}
                    {executionData && (
                      <div className={`relative overflow-hidden border-2 rounded-xl p-5 backdrop-blur-sm ${executionData.status === 'COMPLETED' || executionData.status === 'completed'
                          ? 'bg-gradient-to-br from-success/20 via-success/10 to-success/5 border-success/40 shadow-lg shadow-success/10'
                          : 'bg-gradient-to-br from-destructive/20 via-destructive/10 to-destructive/5 border-destructive/40 shadow-lg shadow-destructive/10'
                        }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5" />
                        <div className="relative flex items-center gap-4">
                          <div className={`flex-shrink-0 p-3 rounded-xl ${executionData.status === 'COMPLETED' || executionData.status === 'completed'
                              ? 'bg-success/20 border border-success/30'
                              : 'bg-destructive/20 border border-destructive/30'
                            }`}>
                            {executionData.status === 'COMPLETED' || executionData.status === 'completed' ? (
                              <CheckCircle className="h-6 w-6 text-success" />
                            ) : (
                              <XCircle className="h-6 w-6 text-destructive" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-bold mb-1 ${executionData.status === 'COMPLETED' || executionData.status === 'completed'
                                ? 'text-success'
                                : 'text-destructive'
                              }`}>
                              Execution {executionData.status === 'COMPLETED' || executionData.status === 'completed' ? 'Completed' : 'Failed'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {executionData.status === 'COMPLETED' || executionData.status === 'completed'
                                ? 'All nodes executed successfully'
                                : 'One or more nodes failed during execution'}
                            </p>
                          </div>
                          {executionData.duration && (
                            <div className="flex-shrink-0 px-4 py-2 bg-surface/80 border border-border/50 rounded-lg backdrop-blur-sm">
                              <div className="text-xs text-muted-foreground mb-1">Duration</div>
                              <div className="text-sm font-bold text-foreground">{executionData.duration.toFixed(3)}s</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Test Summary Card */}
                    <TestSummaryCard
                      totalNodes={executionTestResults?.summary.total_nodes || 0}
                      successfulNodes={executionTestResults?.summary.successful_nodes || 0}
                      failedNodes={executionTestResults?.summary.failed_nodes || 0}
                      totalDuration={executionTestResults?.metadata.duration || 0}
                      averageNodeTime={
                        nodes.length > 0 && executionTestResults
                          ? nodes.reduce((total, node) => {
                            return total + (executionTestResults.node_results[node.id]?.duration_seconds || 0);
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
                            const nodeResult = executionTestResults?.node_results[node.id];
                            const NodeIcon = node.icon || Settings;

                            // Get input data from previous nodes (simplified)
                            const firstNode = nodes[0];
                            const inputData = node.type === 'trigger' ? undefined : {
                              trigger_data: firstNode ? executionTestResults?.node_results[firstNode.id]?.result_data : undefined,
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
                          totalDuration={executionTestResults?.metadata.duration || 0}
                        />
                      </div>

                      {/* Modern Execution Logs */}
                      <div className="bg-surface/80 backdrop-blur-sm border-2 border-border/50 rounded-xl min-h-[600px] flex flex-col shadow-lg shadow-primary/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-border/50 flex-shrink-0 bg-gradient-to-r from-surface/50 to-transparent">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                              <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground">Execution Logs</h3>
                              <p className="text-xs text-muted-foreground">Detailed execution logs and debug information</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 flex-1 overflow-hidden bg-gradient-to-b from-background/50 to-background">
                          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 font-mono text-xs h-full overflow-auto border border-border/50 shadow-inner">
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
                                    const result = executionTestResults?.node_results[node.id];
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
                                  <p className={executionData.status === 'COMPLETED' || executionData.status === 'completed' ? 'text-success' : executionData.status === 'FAILED' || executionData.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'}>
                                    [{executionData.status === 'COMPLETED' || executionData.status === 'completed' ? 'SUCCESS' : executionData.status === 'FAILED' || executionData.status === 'failed' ? 'ERROR' : 'INFO'}] Test execution {executionData.status?.toLowerCase() || 'completed'}
                                  </p>
                                  {executionTestResults && (
                                    <p className={executionTestResults.summary.failed_nodes > 0 ? 'text-destructive' : 'text-success'}>
                                      [SUMMARY] Success: {executionTestResults.summary.successful_nodes}, Failed: {executionTestResults.summary.failed_nodes}
                                    </p>
                                  )}
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

                    {/* Final Result - Only show if execution completed successfully */}
                    {(() => {
                      // Only show final result if execution completed successfully
                      if (executionData && executionData.status !== 'COMPLETED' && executionData.status !== 'completed') {
                        return null;
                      }

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
                      }

                      if (!finalResult) return null;

                      return (
                        <div className="relative overflow-hidden bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-sm border-2 border-success/30 rounded-xl p-5 shadow-lg shadow-success/10">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5" />
                          <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-success/10 border border-success/30">
                                <CheckCircle className="h-5 w-5 text-success" />
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-foreground">Final Result</h3>
                                <p className="text-xs text-muted-foreground">Output from the last node in the workflow</p>
                              </div>
                            </div>
                            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 font-mono text-xs overflow-auto max-h-[300px] border border-border/50 shadow-inner">
                              <pre className="whitespace-pre-wrap break-words m-0 text-foreground/90">
                                {JSON.stringify(finalResult, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  // Modern Fallback loading state
                  <div className="flex items-center justify-center py-24">
                    <div className="text-center max-w-lg">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 backdrop-blur-sm">
                          <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">Loading Execution Details</h3>
                      <p className="text-sm text-muted-foreground">Fetching execution information...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PathProvider>
  );
}
