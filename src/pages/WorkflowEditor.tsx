import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { WorkflowToolbar } from '@/components/workflow-editor/WorkflowToolbar';
import { NodeCanvas } from '@/components/workflow-editor/NodeCanvas';
import { SidePanel } from '@/components/workflow-editor/SidePanel';
import { Workflow, WorkflowNode, NodeTemplate } from '@/types/workflow';
import { getWorkflow, saveWorkflow, createNewWorkflow } from '@/utils/workflowStorage';
import { toast } from '@/hooks/use-toast';
import { Node, Edge } from '@xyflow/react';

const WorkflowEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load workflow
  useEffect(() => {
    const loadWorkflow = () => {
      setIsLoading(true);
      try {
        let loadedWorkflow: Workflow;

        if (id && id !== 'new') {
          const existing = getWorkflow(id);
          if (!existing) {
            toast({
              title: 'Workflow not found',
              description: 'Creating a new workflow instead.',
              variant: 'destructive',
            });
            loadedWorkflow = createNewWorkflow();
          } else {
            loadedWorkflow = existing;
          }
        } else {
          loadedWorkflow = createNewWorkflow();
        }

        setWorkflow(loadedWorkflow);
      } catch (error) {
        console.error('Error loading workflow:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workflow.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [id]);

  // Auto-save
  useEffect(() => {
    if (!workflow || isLoading) return;

    const timer = setTimeout(() => {
      try {
        saveWorkflow(workflow);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [workflow, isLoading]);

  const handleSave = useCallback(async () => {
    if (!workflow) return;

    setIsSaving(true);
    try {
      saveWorkflow(workflow);
      toast({
        title: 'Workflow Saved',
        description: 'Your workflow has been saved successfully.',
      });
      
      // Update URL if it's a new workflow
      if (id === 'new') {
        navigate(`/workflows/${workflow.id}/edit`, { replace: true });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save workflow.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [workflow, id, navigate]);

  const handleTest = () => {
    toast({
      title: 'Test Run',
      description: 'Starting test execution...',
    });
  };

  const handlePublish = () => {
    if (!workflow) return;

    setWorkflow({
      ...workflow,
      status: workflow.status === 'active' ? 'inactive' : 'active',
    });

    toast({
      title: workflow.status === 'active' ? 'Workflow Deactivated' : 'Workflow Published',
      description:
        workflow.status === 'active'
          ? 'Workflow is now inactive.'
          : 'Workflow is now active and running.',
    });
  };

  const handleNameChange = (name: string) => {
    if (!workflow) return;
    setWorkflow({ ...workflow, name });
  };

  const handleNodesChange = (nodes: Node[]) => {
    if (!workflow) return;
    setWorkflow({ ...workflow, nodes: nodes as WorkflowNode[] });
  };

  const handleEdgesChange = (edges: Edge[]) => {
    if (!workflow) return;
    setWorkflow({ ...workflow, edges });
  };

  const handleNodeUpdate = (nodeId: string, data: Partial<WorkflowNode['data']>) => {
    if (!workflow) return;

    const updatedNodes = workflow.nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    );

    setWorkflow({ ...workflow, nodes: updatedNodes });

    // Update selected node if it's the one being updated
    if (selectedNode?.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, ...data },
      });
    }
  };

  const handleNodeDelete = (nodeId: string) => {
    if (!workflow) return;

    const updatedNodes = workflow.nodes.filter((node) => node.id !== nodeId);
    const updatedEdges = workflow.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );

    setWorkflow({
      ...workflow,
      nodes: updatedNodes,
      edges: updatedEdges,
    });

    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }

    toast({
      title: 'Node Deleted',
      description: 'The node has been removed from the workflow.',
    });
  };

  const handleNodeSelect = (node: WorkflowNode | null) => {
    setSelectedNode(node);
  };

  const handleNodeDragStart = (nodeType: NodeTemplate) => {
    // Can add visual feedback here if needed
  };

  if (isLoading || !workflow) {
    return (
      <PageLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading workflow...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="h-screen flex flex-col">
        <WorkflowToolbar
          workflowName={workflow.name}
          workflowStatus={workflow.status}
          onNameChange={handleNameChange}
          onSave={handleSave}
          onTest={handleTest}
          onPublish={handlePublish}
          isSaving={isSaving}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            <NodeCanvas
              initialNodes={workflow.nodes}
              initialEdges={workflow.edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeSelect={handleNodeSelect}
            />
          </div>

          <SidePanel
            selectedNode={selectedNode}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onNodeDragStart={handleNodeDragStart}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default WorkflowEditor;
