import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Zap, MessageSquare, Image, Hash, FileJson, Type, Calendar, GitBranch, Repeat, Settings, LucideIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { TriggerInputForm } from '@/components/workflow-builder/TriggerInputForm';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { mapApiNodeToWorkflowNode, type WorkflowNode } from '@/utils/workflowMapper';
import type { Workflow, CreateWorkflowRequest, Node, Edge, Trigger, Execution, Script, ScriptContent, PaginatedResponse } from '@/types/api';

// WorkflowNode type is now imported from workflowMapper

export default function ZapierWorkflowEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentWorkspace } = useWorkspace();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showOutputsPanel, setShowOutputsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [isActive, setIsActive] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(id === 'new' ? null : id || null);
  
  // Refs for DOM optimization
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Pan and Zoom state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Load workflow from API - start with mock data directly
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'trigger-1',
      type: 'trigger',
      title: 'API Trigger',
      icon: Zap,
      configured: true,
      variables: [
        { name: 'user_id', type: 'string', defaultValue: 'usr_123' },
        { name: 'email', type: 'string', defaultValue: 'user@example.com' },
      ],
    },
    {
      id: 'action-1',
      type: 'action',
      title: 'GPT-4 Completion',
      icon: MessageSquare,
      category: 'AI Models',
      nodeType: 'AI Models > OpenAI > GPT-4 Completion',
      configured: true,
      parameters: [
        { id: 'prompt', label: 'Prompt', type: 'textarea', value: 'Analyze user: ${trigger.email}' },
      ],
    },
  ]);

  // Debug log
  console.log('ZapierWorkflowEditor - id:', id, 'nodes count:', nodes.length);

  // Fetch workflow
  const { data: workflowData, isLoading: isLoadingWorkflow } = useQuery({
    queryKey: ['workflow', currentWorkspace?.id, workflowId],
    queryFn: () => apiClient.get<Workflow>(
      API_ENDPOINTS.workflow.get(currentWorkspace!.id, workflowId!),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!workflowId && !!getToken() && workflowId !== 'new',
  });

  // Fetch nodes
  const { data: nodesData, isLoading: isLoadingNodes } = useQuery({
    queryKey: ['workflowNodes', currentWorkspace?.id, workflowId],
    queryFn: () => apiClient.get<PaginatedResponse<Node>>(
      API_ENDPOINTS.node.list(currentWorkspace!.id, workflowId!),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!workflowId && !!getToken() && workflowId !== 'new',
  });

  // Fetch edges
  const { data: edgesData, isLoading: isLoadingEdges } = useQuery({
    queryKey: ['workflowEdges', currentWorkspace?.id, workflowId],
    queryFn: () => apiClient.get<PaginatedResponse<Edge>>(
      API_ENDPOINTS.edge.list(currentWorkspace!.id, workflowId!),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!workflowId && !!getToken() && workflowId !== 'new',
  });

  // Create edge mutation
  const createEdgeMutation = useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: { from_node_id: string; to_node_id: string } }) =>
      apiClient.post<Edge>(
        API_ENDPOINTS.edge.create(currentWorkspace!.id, workflowId),
        data,
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowEdges'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create edge',
        variant: 'destructive',
      });
    },
  });

  // Delete edge mutation
  const deleteEdgeMutation = useMutation({
    mutationFn: (edgeId: string) =>
      apiClient.delete(
        API_ENDPOINTS.edge.delete(currentWorkspace!.id, workflowId!, edgeId),
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowEdges'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete edge',
        variant: 'destructive',
      });
    },
  });

  // Load workflow data when fetched
  useEffect(() => {
    if (workflowData?.data) {
      const workflow = workflowData.data;
      setWorkflowName(workflow.name);
      setIsActive(workflow.status === 'ACTIVE');
    }
  }, [workflowData]);

  // Fetch global scripts
  const { data: globalScriptsData } = useQuery({
    queryKey: ['globalScripts'],
    queryFn: () => apiClient.get<PaginatedResponse<Script>>(
      API_ENDPOINTS.globalScript.list,
      { skipAuth: true } // Global scripts public
    ),
  });

  // Fetch custom scripts
  const { data: customScriptsData } = useQuery({
    queryKey: ['customScripts', currentWorkspace?.id],
    queryFn: () => apiClient.get<PaginatedResponse<Script>>(
      API_ENDPOINTS.customScript.list(currentWorkspace!.id),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!getToken(),
  });

  // Fetch variables
  const { data: variablesData } = useQuery({
    queryKey: ['variables', currentWorkspace?.id],
    queryFn: () => apiClient.get<PaginatedResponse<any>>(
      API_ENDPOINTS.variable.list(currentWorkspace!.id),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!getToken(),
  });

  // Fetch triggers
  const { data: triggersData } = useQuery({
    queryKey: ['workflowTriggers', currentWorkspace?.id, workflowId],
    queryFn: () => {
      return apiClient.get<PaginatedResponse<Trigger>>(
        API_ENDPOINTS.trigger.list(currentWorkspace!.id),
        { 
          token: getToken(),
          params: {
            workflow_id: workflowId!,
          },
        }
      );
    },
    enabled: !!currentWorkspace?.id && !!workflowId && !!getToken() && workflowId !== 'new',
  });

  // Create trigger mutation
  const createTriggerMutation = useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: any }) =>
      apiClient.post<Trigger>(
        API_ENDPOINTS.trigger.create(currentWorkspace!.id, workflowId),
        data,
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTriggers'] });
      toast({
        title: 'Trigger Created',
        description: 'Trigger has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create trigger',
        variant: 'destructive',
      });
    },
  });

  // Update trigger mutation
  const updateTriggerMutation = useMutation({
    mutationFn: ({ triggerId, data }: { triggerId: string; data: any }) =>
      apiClient.put<Trigger>(
        API_ENDPOINTS.trigger.update(currentWorkspace!.id, triggerId),
        data,
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTriggers'] });
      toast({
        title: 'Trigger Updated',
        description: 'Trigger has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update trigger',
        variant: 'destructive',
      });
    },
  });

  // Load and map nodes when fetched from API (only for existing workflows)
  useEffect(() => {
    const loadNodes = async () => {
      // Skip for new workflows - mock data already set in useState initializer
      if (id === 'new' || !nodesData?.data.items || !currentWorkspace?.id || !workflowId) {
        return;
      }

      const apiNodes = nodesData.data.items;
      
      // Her node için script content çek ve map et
      const mappedNodes = await Promise.all(
        apiNodes.map(async (apiNode) => {
          let scriptContent: ScriptContent | undefined;
          
          // Script content çek
          if (apiNode.script_id) {
            try {
              const contentResponse = await apiClient.get<ScriptContent>(
                API_ENDPOINTS.globalScript.getContent(apiNode.script_id),
                { skipAuth: true } // Global scripts public
              );
              scriptContent = contentResponse.data;
            } catch (error) {
              console.error(`Failed to load script content for ${apiNode.script_id}:`, error);
            }
          } else if (apiNode.custom_script_id) {
            try {
              const contentResponse = await apiClient.get<ScriptContent>(
                API_ENDPOINTS.customScript.getContent(currentWorkspace.id, apiNode.custom_script_id),
                { token: getToken() }
              );
              scriptContent = contentResponse.data;
            } catch (error) {
              console.error(`Failed to load custom script content for ${apiNode.custom_script_id}:`, error);
            }
          }

          const mapped = mapApiNodeToWorkflowNode(apiNode, scriptContent);
          // API node metadata'sını sakla
          mapped.apiNodeId = apiNode.id;
          mapped.scriptId = apiNode.script_id;
          mapped.customScriptId = apiNode.custom_script_id;
          return mapped;
        })
      );

      // Trigger node'u ekle (eğer yoksa)
      if (mappedNodes.length === 0 || mappedNodes[0].type !== 'trigger') {
        mappedNodes.unshift({
          id: 'trigger-1',
          type: 'trigger',
          title: 'API Trigger',
          icon: Zap,
          variables: [
            { name: 'user_id', type: 'string', defaultValue: '' },
            { name: 'event_type', type: 'string', defaultValue: 'create' },
            { name: 'timestamp', type: 'number', defaultValue: '' },
          ],
        });
      }

      setNodes(mappedNodes);
    };

    loadNodes();
  }, [nodesData, currentWorkspace?.id, workflowId, id, getToken]);

  // Create workflow mutation (for new workflows)
  const createWorkflowMutation = useMutation({
    mutationFn: (data: CreateWorkflowRequest) =>
      apiClient.post<Workflow>(
        API_ENDPOINTS.workflow.create(currentWorkspace!.id),
        data,
        { token: getToken() }
      ),
    onSuccess: (response) => {
      const newWorkflowId = response.data.id;
      setWorkflowId(newWorkflowId);
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      navigate(`/workflows/${newWorkflowId}/edit`, { replace: true });
      toast({
        title: 'Workflow Created',
        description: 'Workflow has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create workflow',
        variant: 'destructive',
      });
    },
  });

  // Update workflow mutation
  const updateWorkflowMutation = useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: Partial<CreateWorkflowRequest> }) =>
      apiClient.put<Workflow>(
        API_ENDPOINTS.workflow.update(currentWorkspace!.id, workflowId),
        data,
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
      toast({
        title: 'Workflow Saved',
        description: 'Workflow has been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save workflow',
        variant: 'destructive',
      });
    },
  });

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

  // Create node mutation
  const createNodeMutation = useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: any }) =>
      apiClient.post<Node>(
        API_ENDPOINTS.node.create(currentWorkspace!.id, workflowId),
        data,
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowNodes'] });
      queryClient.invalidateQueries({ queryKey: ['workflowEdges'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create node',
        variant: 'destructive',
      });
    },
  });

  const handleAddNode = useCallback(async (category: string, subcategory: string, nodeType: string, afterNodeId?: string) => {
    if (!currentWorkspace?.id || !workflowId) {
      toast({
        title: 'Error',
        description: 'Please save the workflow first',
        variant: 'destructive',
      });
      return;
    }

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

    // Script seçimi için - şimdilik script listesinden ilk uygun script'i bul
    // TODO: Script seçim modal'ı ekle
    const allScripts = [
      ...(globalScriptsData?.data.items || []),
      ...(customScriptsData?.data.items || []),
    ];
    
    // Node type'a göre script bul (basit eşleştirme)
    const matchedScript = allScripts.find(s => 
      s.name.toLowerCase().includes(nodeType.toLowerCase().split(' ')[0]) ||
      s.description?.toLowerCase().includes(nodeType.toLowerCase())
    );

    if (!matchedScript) {
      toast({
        title: 'Script Not Found',
        description: `Please select a script for "${nodeType}" node`,
        variant: 'destructive',
      });
      return;
    }

    // Script content çek
    let scriptContent: ScriptContent | undefined;
    try {
      const contentResponse = await apiClient.get<ScriptContent>(
        matchedScript.id.startsWith('SCR-') 
          ? API_ENDPOINTS.globalScript.getContent(matchedScript.id)
          : API_ENDPOINTS.customScript.getContent(currentWorkspace.id, matchedScript.id),
        matchedScript.id.startsWith('SCR-') 
          ? { skipAuth: true }
          : { token: getToken() }
      );
      scriptContent = contentResponse.data;
    } catch (error) {
      console.error('Failed to load script content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load script content',
        variant: 'destructive',
      });
      return;
    }

    // Input params'ı script schema'ya göre oluştur
    const input_params: Record<string, any> = {};
    if (scriptContent?.input_schema) {
      Object.entries(scriptContent.input_schema).forEach(([key, schema]: [string, any]) => {
        input_params[key] = {
          type: schema.type || 'string',
          value: schema.default || '',
          required: schema.required || false,
        };
      });
    }

    // API'ye node oluştur
    try {
      const nodeData = {
        name: nodeType,
        description: `${category} > ${subcategory}`,
        script_id: matchedScript.id.startsWith('SCR-') ? matchedScript.id : undefined,
        custom_script_id: matchedScript.id.startsWith('SCR-') ? undefined : matchedScript.id,
        input_params,
        max_retries: 3,
        timeout_seconds: 300,
      };

      const response = await createNodeMutation.mutateAsync({
        workflowId,
        data: nodeData,
      });

      // Node oluşturuldu, şimdi frontend'e ekle
      const newNode: WorkflowNode = {
        id: response.data.id,
        type: 'action',
        title: nodeType,
        icon: nodeIcons[nodeType],
        category: `${category} > ${subcategory}`,
        nodeType: category,
        configured: true,
        config: {},
        parameters: getNodeParameters(nodeType),
        apiNodeId: response.data.id,
        scriptId: response.data.script_id,
        customScriptId: response.data.custom_script_id,
      };

      const newNodes = [...nodes];
      newNodes.splice(insertIndex, 0, newNode);
      setNodes(newNodes);
      scrollToNewNode(newNode.id);

      // Edge oluştur - yeni node'u önceki node'a bağla
      if (afterNodeId) {
        const previousNode = nodes.find(n => n.id === afterNodeId);
        if (previousNode?.apiNodeId) {
          try {
            await createEdgeMutation.mutateAsync({
              workflowId,
              data: {
                from_node_id: previousNode.apiNodeId,
                to_node_id: response.data.id,
              },
            });
          } catch (error) {
            console.error('Error creating edge:', error);
            // Edge oluşturma hatası kritik değil, sadece log'la
          }
        }
      }

      toast({
        title: 'Node Added',
        description: `${nodeType} node has been added successfully.`,
      });
    } catch (error: any) {
      console.error('Error creating node:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create node',
        variant: 'destructive',
      });
    }
  }, [nodes, scrollToNewNode, currentWorkspace, workflowId, getToken, globalScriptsData, customScriptsData, createNodeMutation, createEdgeMutation]);

  const handleAddBranch = useCallback((conditionalNodeId: string, branchType: 'true' | 'false') => {
    // In a real implementation, this would open a node selector
  }, []);

  // Fetch node form schema
  const { data: nodeFormSchemaData, refetch: refetchNodeFormSchema } = useQuery({
    queryKey: ['nodeFormSchema', currentWorkspace?.id, workflowId, selectedNode?.apiNodeId],
    queryFn: () => apiClient.get<{ schema: any; current_values: any }>(
      API_ENDPOINTS.node.getFormSchema(currentWorkspace!.id, workflowId!, selectedNode!.apiNodeId!),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!workflowId && !!selectedNode?.apiNodeId && !!getToken(),
  });

  // Update node parameters when form schema is fetched
  useEffect(() => {
    if (nodeFormSchemaData?.data && selectedNode) {
      const { schema, current_values } = nodeFormSchemaData.data;
      
      // Schema'dan parameters oluştur
      const updatedParameters = Object.entries(schema).map(([key, paramSchema]: [string, any]) => {
        const existingParam = selectedNode.parameters?.find(p => p.id === key);
        return {
          id: key,
          label: paramSchema.description || key,
          type: mapSchemaTypeToFrontendType(paramSchema.type),
          placeholder: paramSchema.front?.placeholder || '',
          options: paramSchema.front?.values || existingParam?.options,
          value: current_values[key] || existingParam?.value || paramSchema.default_value || '',
          isDynamic: typeof current_values[key] === 'string' && current_values[key].startsWith('${'),
          dynamicPath: typeof current_values[key] === 'string' && current_values[key].startsWith('${')
            ? current_values[key]
            : undefined,
        };
      });

      // Node'u güncelle
      setNodes(prevNodes => prevNodes.map(n => 
        n.id === selectedNode.id 
          ? { ...n, parameters: updatedParameters }
          : n
      ));
      setSelectedNode(prev => prev ? { ...prev, parameters: updatedParameters } : null);
    }
  }, [nodeFormSchemaData, selectedNode]);

  const mapSchemaTypeToFrontendType = (schemaType: string): 'text' | 'dropdown' | 'number' | 'toggle' | 'textarea' | 'credential' => {
    switch (schemaType?.toLowerCase()) {
      case 'string':
      case 'str':
        return 'text';
      case 'integer':
      case 'int':
      case 'number':
      case 'float':
        return 'number';
      case 'boolean':
      case 'bool':
        return 'toggle';
      case 'array':
      case 'list':
        return 'textarea';
      case 'object':
      case 'dict':
        return 'textarea';
      default:
        return 'text';
    }
  };

  const handleNodeClick = useCallback((node: WorkflowNode) => {
    setSelectedNode(node);
    setShowOutputsPanel(true);
    
    // API node ise form schema'yı çek
    if (node.apiNodeId && currentWorkspace?.id && workflowId) {
      refetchNodeFormSchema();
    }
  }, [currentWorkspace, workflowId, refetchNodeFormSchema]);

  const handleParameterChange = useCallback(async (parameterId: string, value: any, isDynamic: boolean = false) => {
    if (!selectedNode) return;

    // Frontend state'i güncelle (yeni workflow için de çalışır)
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

  // Generate mock outputs for demonstration (memoized)
  const mockOutputs = useMemo(() => {
    return nodes.map(node => {
      if (node.type === 'trigger') {
        return {
          nodeId: node.id,
          nodeName: node.title,
          icon: Zap,
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
          icon: MessageSquare,
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
          icon: FileJson,
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
        icon: Settings,
        output: {
          status: 'success',
          data: {
            result: 'processed',
          },
        },
      };
    });
  }, [nodes]);

  // Delete node mutation
  const deleteNodeMutation = useMutation({
    mutationFn: (nodeId: string) =>
      apiClient.delete(
        API_ENDPOINTS.node.delete(currentWorkspace!.id, workflowId!, nodeId),
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowNodes'] });
      queryClient.invalidateQueries({ queryKey: ['workflowEdges'] });
      toast({
        title: 'Node Deleted',
        description: 'Node has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete node',
        variant: 'destructive',
      });
    },
  });

  // Update node mutation
  const updateNodeMutation = useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: any }) =>
      apiClient.put<Node>(
        API_ENDPOINTS.node.update(currentWorkspace!.id, workflowId!, nodeId),
        data,
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowNodes'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update node',
        variant: 'destructive',
      });
    },
  });

  // Update node input params mutation
  const updateNodeInputParamsMutation = useMutation({
    mutationFn: ({ nodeId, inputParams }: { nodeId: string; inputParams: Record<string, any> }) =>
      apiClient.patch(
        API_ENDPOINTS.node.updateInputParams(currentWorkspace!.id, workflowId!, nodeId),
        { input_params: inputParams },
        { token: getToken() }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowNodes'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update node parameters',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteNode = async (nodeId: string) => {
    if (!currentWorkspace?.id || !workflowId) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Eğer API node ise API'den sil
    if (node.apiNodeId) {
      try {
        await deleteNodeMutation.mutateAsync(node.apiNodeId);
      } catch (error) {
        return; // Error toast mutation içinde gösteriliyor
      }
    }

    // Frontend'den de sil
    setNodes(nodes.filter(n => n.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleSave = async () => {
    if (!currentWorkspace) {
      toast({
        title: 'Error',
        description: 'No workspace selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!workflowId || workflowId === 'new') {
        // Create new workflow
        createWorkflowMutation.mutate({
          name: workflowName,
          description: '',
          status: isActive ? 'ACTIVE' : 'DRAFT',
          priority: 1,
        });
      } else {
        // Update existing workflow
        updateWorkflowMutation.mutate({
          workflowId,
          data: {
            name: workflowName,
            status: isActive ? 'ACTIVE' : 'DRAFT',
          },
        });
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  // Test execution state (must be declared before testResults useMemo)
  const [testExecutionId, setTestExecutionId] = useState<string | null>(null);
  const [testExecutionStatus, setTestExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [testExecutionResults, setTestExecutionResults] = useState<any>(null);
  const [showTestInputDialog, setShowTestInputDialog] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);

  // Test results - API'den gelen veya mock
  const testResults = useMemo(() => {
    // Eğer API'den sonuç varsa onu kullan
    if (testExecutionResults && testExecutionResults.results) {
      const nodeResults: Record<string, any> = {};
      
      Object.entries(testExecutionResults.results).forEach(([nodeId, result]: [string, any]) => {
        nodeResults[nodeId] = {
          node_id: nodeId,
          node_name: nodes.find(n => n.apiNodeId === nodeId)?.title || `Node ${nodeId.slice(-8)}`,
          status: result.status,
          result_data: result.result_data,
          duration_seconds: result.duration_seconds,
          memory_mb: result.memory_mb,
          cpu_percent: result.cpu_percent,
          completed_at: testExecutionResults.ended_at,
          error_message: result.error_message,
        };
      });

      return {
        summary: {
          total_nodes: Object.keys(testExecutionResults.results).length,
          completed_nodes: Object.keys(testExecutionResults.results).length,
          successful_nodes: Object.values(testExecutionResults.results).filter((r: any) => r.status === 'SUCCESS').length,
          failed_nodes: Object.values(testExecutionResults.results).filter((r: any) => r.status === 'FAILED').length,
          skipped_nodes: 0,
        },
        node_results: nodeResults,
        final_output: Object.values(nodeResults)[Object.values(nodeResults).length - 1]?.result_data,
        metadata: {
          workflow_version: '1.0.0',
          execution_mode: 'test',
          completed_at: testExecutionResults.ended_at,
        },
      };
    }

    // Mock test results (fallback)
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

    const mockTestResults = {
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
    return mockTestResults;
  }, [nodes, testExecutionResults]);

  // Fetch test execution
  const { data: testExecutionData, refetch: refetchTestExecution } = useQuery({
    queryKey: ['testExecution', currentWorkspace?.id, testExecutionId],
    queryFn: () => apiClient.get<Execution>(
      API_ENDPOINTS.execution.get(currentWorkspace!.id, testExecutionId!),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!testExecutionId && !!getToken() && testExecutionStatus === 'running',
    refetchInterval: (query) => {
      const status = query.state.data?.data.status;
      if (status === 'PENDING' || status === 'RUNNING') {
        return 1000; // Poll every 1 second
      }
      return false; // Stop polling when completed
    },
  });

  // Update test execution status when data changes
  useEffect(() => {
    if (testExecutionData?.data) {
      const execution = testExecutionData.data;
      setTestExecutionResults(execution);

      if (execution.status === 'COMPLETED') {
        setTestExecutionStatus('completed');
      } else if (execution.status === 'FAILED' || execution.status === 'CANCELLED') {
        setTestExecutionStatus('failed');
      } else if (execution.status === 'RUNNING' || execution.status === 'PENDING') {
        setTestExecutionStatus('running');
      }
    }
  }, [testExecutionData]);

  // Create execution mutation
  const createExecutionMutation = useMutation({
    mutationFn: ({ workflowId, inputData }: { workflowId: string; inputData: Record<string, any> }) =>
      apiClient.post<Execution>(
        API_ENDPOINTS.execution.create(currentWorkspace!.id, workflowId),
        { input_data: inputData },
        { token: getToken() }
      ),
    onSuccess: (response) => {
      const executionId = response.data.id;
      setTestExecutionId(executionId);
      setTestExecutionStatus('running');
      toast({
        title: 'Test Started',
        description: 'Workflow test execution has been started.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start test execution',
        variant: 'destructive',
      });
    },
  });

  // Get default trigger (first trigger or DEFAULT)
  const defaultTrigger = useMemo(() => {
    if (!triggersData?.data.items || triggersData.data.items.length === 0) {
      return null;
    }
    // DEFAULT trigger'ı bul veya ilk trigger'ı al
    const trigger = triggersData.data.items.find(t => t.name === 'DEFAULT') || triggersData.data.items[0];
    return trigger;
  }, [triggersData]);

  // Fetch single trigger with full details (including input_mapping)
  const { data: triggerDetailData } = useQuery({
    queryKey: ['triggerDetail', currentWorkspace?.id, defaultTrigger?.id],
    queryFn: () => apiClient.get<Trigger>(
      API_ENDPOINTS.trigger.get(currentWorkspace!.id, defaultTrigger!.id),
      { token: getToken() }
    ),
    enabled: !!currentWorkspace?.id && !!defaultTrigger?.id && !!getToken(),
  });

  // Use detailed trigger data if available
  const triggerForTest = triggerDetailData?.data || defaultTrigger;

  const handleTest = useCallback(async () => {
    if (!currentWorkspace?.id || !workflowId) {
      toast({
        title: 'Error',
        description: 'Please save the workflow first',
        variant: 'destructive',
      });
      return;
    }

    // Trigger'ı al (detailed trigger data kullan)
    const trigger = triggerForTest;
    
    // Eğer trigger'ın input_mapping'i varsa form göster
    if (trigger && trigger.input_mapping && Object.keys(trigger.input_mapping).length > 0) {
      setSelectedTrigger(trigger);
      setShowTestInputDialog(true);
      return;
    }

    // Input schema yoksa direkt execution başlat
    try {
      await createExecutionMutation.mutateAsync({
        workflowId,
        inputData: {},
      });
    } catch (error) {
      console.error('Error starting test execution:', error);
    }
  }, [currentWorkspace, workflowId, defaultTrigger, createExecutionMutation]);

  const handleTestInputSubmit = useCallback(async (inputData: Record<string, any>) => {
    if (!currentWorkspace?.id || !workflowId) return;

    setShowTestInputDialog(false);

    try {
      await createExecutionMutation.mutateAsync({
        workflowId,
        inputData,
      });
    } catch (error) {
      console.error('Error starting test execution:', error);
    }
  }, [currentWorkspace, workflowId, createExecutionMutation]);

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
                className="min-h-full flex items-start justify-center py-8"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transformOrigin: 'center top',
                  transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                  cursor: isPanning ? 'grabbing' : 'grab',
                }}
              >
                <div className="max-w-3xl w-full px-6">
                  <div className="space-y-0">
                    {/* Debug: Show node count */}
                    {nodes.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground">
                        No nodes to display. Click + to add a node.
                      </div>
                    )}
                {nodes.map((node, index) => (
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

                    {/* Connection line and Add button */}
                    <div className="flex flex-col items-center my-3" id={`add-node-${index}`}>
                      <div className="w-0.5 h-4 bg-border" />
                      <AddNodeButton 
                        onAddNode={(cat, sub, type) => handleAddNode(cat, sub, type, node.id)} 
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
              outputs={mockOutputs}
              isOpen={showOutputsPanel}
              currentNodeId={selectedNode?.id}
            />
          </TabsContent>

          {/* Test Tab Content */}
          <TabsContent value="test" className="mt-0">
            <div className="h-[calc(100vh-144px)] overflow-auto bg-background">
              <div className="container mx-auto px-6 py-8 space-y-6">
                {/* Test Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Test Workflow</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Run a test execution to verify your workflow
                    </p>
                    {triggerForTest && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Using trigger: {triggerForTest.name} ({triggerForTest.trigger_type})
                        {triggerForTest.input_mapping && Object.keys(triggerForTest.input_mapping).length > 0 && (
                          <span className="ml-2">
                            ({Object.keys(triggerForTest.input_mapping).length} input fields)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleTest}
                    disabled={testExecutionStatus === 'running' || !workflowId}
                    variant="primary"
                  >
                    {testExecutionStatus === 'running' ? 'Running...' : 'Run Test'}
                  </Button>
                </div>

                {/* Test Input Dialog */}
                <Dialog open={showTestInputDialog} onOpenChange={setShowTestInputDialog}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Test Execution Input</DialogTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter test data according to the trigger's input schema
                      </p>
                    </DialogHeader>
                    <TriggerInputForm
                      trigger={selectedTrigger}
                      onSubmit={handleTestInputSubmit}
                      onCancel={() => setShowTestInputDialog(false)}
                    />
                  </DialogContent>
                </Dialog>

                {/* Test Summary Card */}
                {testResults && (
                  <TestSummaryCard
                    totalNodes={testResults.summary.total_nodes}
                    successfulNodes={testResults.summary.successful_nodes}
                    failedNodes={testResults.summary.failed_nodes}
                    totalDuration={nodes.reduce((total, node) => {
                      return total + (testResults.node_results[node.id]?.duration_seconds || 0);
                    }, 0)}
                    averageNodeTime={
                      nodes.length > 0
                        ? nodes.reduce((total, node) => {
                            return total + (testResults.node_results[node.id]?.duration_seconds || 0);
                          }, 0) / nodes.length
                        : 0
                    }
                  />
                )}

                {/* Timeline and Logs - Side by Side */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Execution Timeline */}
                  <div className="min-h-[600px] flex flex-col">
                    {testResults && (
                      <ExecutionTimeline
                        nodes={nodes.map((node, index) => {
                          const nodeResult = testResults.node_results[node.id] || testResults.node_results[node.apiNodeId || ''];
                          const NodeIcon = node.icon || Settings;
                          
                          // Get input data from previous nodes (simplified)
                          const inputData = node.type === 'trigger' ? undefined : {
                            trigger_data: testExecutionResults?.trigger_data,
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
                        totalDuration={nodes.reduce((total, node) => {
                          const nodeResult = testResults.node_results[node.id] || testResults.node_results[node.apiNodeId || ''];
                          return total + (nodeResult?.duration_seconds || 0);
                        }, 0)}
                      />
                    )}
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
                          <p className="text-success">[INFO] Workflow test started</p>
                          <p className="text-muted-foreground">[INFO] {nodes.length} nodes loaded</p>
                          <p className="text-success">[INFO] Executing workflow...</p>
                          {testResults && nodes.map((node) => {
                            const result = testResults.node_results[node.id] || testResults.node_results[node.apiNodeId || ''];
                            if (!result) return null;
                            return (
                              <p 
                                key={node.id}
                                className={result?.status === 'SUCCESS' ? 'text-success' : result?.status === 'FAILED' ? 'text-destructive' : 'text-muted-foreground'}
                              >
                                [{result?.status || 'PENDING'}] {node.title} - {result?.duration_seconds ? `completed in ${result.duration_seconds.toFixed(2)}s` : 'pending...'}
                                {result?.error_message && (
                                  <span className="block ml-4 text-destructive">↳ Error: {result.error_message}</span>
                                )}
                              </p>
                            );
                          })}
                          {testExecutionStatus === 'completed' && (
                            <>
                              <p className="text-success">[INFO] Test execution completed</p>
                              <p className="text-muted-foreground">
                                [SUMMARY] Success: {testResults?.summary.successful_nodes || 0}, Failed: {testResults?.summary.failed_nodes || 0}
                              </p>
                            </>
                          )}
                          {testExecutionStatus === 'running' && (
                            <p className="text-muted-foreground">[INFO] Test execution in progress...</p>
                          )}
                          {testExecutionStatus === 'idle' && (
                            <p className="text-muted-foreground">[INFO] Click "Run Test" to start execution</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PathProvider>
  );
}
