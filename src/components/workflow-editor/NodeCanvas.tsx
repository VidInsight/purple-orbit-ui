import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowNode, WorkflowEdge, NodeTemplate } from '@/types/workflow';
import { CustomNode } from './CustomNode';

const nodeTypes: NodeTypes = {
  trigger: CustomNode,
  action: CustomNode,
  condition: CustomNode,
  loop: CustomNode,
  end: CustomNode,
};

interface NodeCanvasProps {
  initialNodes: WorkflowNode[];
  initialEdges: WorkflowEdge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeSelect: (node: WorkflowNode | null) => void;
}

export const NodeCanvas = ({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
}: NodeCanvasProps) => {
  const [nodes, setNodes, internalOnNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, internalOnEdgesChange] = useEdgesState(initialEdges);

  const handleNodesChange = useCallback(
    (changes: any) => {
      internalOnNodesChange(changes);
      onNodesChange(nodes);
    },
    [internalOnNodesChange, nodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      internalOnEdgesChange(changes);
      onEdgesChange(edges);
    },
    [internalOnEdgesChange, edges, onEdgesChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(connection, edges);
      setEdges(newEdges);
      onEdgesChange(newEdges);
    },
    [edges, setEdges, onEdgesChange]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const nodeTemplate: NodeTemplate = JSON.parse(data);
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      
      const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 30,
      };

      const newNode: WorkflowNode = {
        id: `${nodeTemplate.type}-${Date.now()}`,
        type: nodeTemplate.type,
        position,
        data: {
          label: nodeTemplate.label,
          description: nodeTemplate.description,
          config: nodeTemplate.defaultConfig,
        },
      };

      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode);
        onNodesChange(updatedNodes);
        return updatedNodes;
      });
    },
    [setNodes, onNodesChange]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect(node as WorkflowNode);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <div className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={true}
        elementsSelectable={true}
        panOnDrag={true}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        minZoom={0.5}
        maxZoom={1.5}
        translateExtent={[[-1000, -1000], [2000, 2000]]}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              trigger: 'hsl(var(--primary))',
              action: 'hsl(var(--accent))',
              condition: 'hsl(var(--warning))',
              loop: 'hsl(var(--success))',
              end: 'hsl(var(--destructive))',
            };
            return colors[node.type || 'action'];
          }}
          style={{
            backgroundColor: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
          }}
        />
      </ReactFlow>
    </div>
  );
};
