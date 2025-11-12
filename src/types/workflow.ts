import { Node, Edge } from '@xyflow/react';

export type WorkflowStatus = 'draft' | 'active' | 'inactive';

export type NodeType = 'trigger' | 'action' | 'condition' | 'loop' | 'end';

export interface WorkflowNode extends Node {
  type: NodeType;
  data: {
    label: string;
    description?: string;
    config?: Record<string, any>;
    icon?: string;
  };
}

export interface WorkflowEdge extends Edge {
  // Additional edge properties can be added here
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface NodeTemplate {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  category: string;
  defaultConfig?: Record<string, any>;
}
