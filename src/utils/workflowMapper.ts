/**
 * Workflow Mapper
 * API format ↔ Frontend format dönüşümleri
 */

import type { Node, Edge, Trigger, ScriptContent } from '@/types/api';
import { Zap, MessageSquare, Image, Hash, FileJson, Type, Calendar, GitBranch, Repeat, Settings, LucideIcon } from 'lucide-react';

/**
 * Frontend WorkflowNode interface
 */
export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'conditional' | 'loop';
  title: string;
  icon?: LucideIcon;
  category?: string;
  nodeType?: string;
  configured?: boolean;
  variables?: Array<{ name: string; type: string; defaultValue: string }>;
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
  // API node metadata
  apiNodeId?: string;
  scriptId?: string;
  customScriptId?: string;
}

/**
 * API Node'u Frontend WorkflowNode formatına çevir
 */
export function mapApiNodeToWorkflowNode(apiNode: Node, scriptContent?: { input_schema?: any; output_schema?: any }): WorkflowNode {
  // Node type'ını belirle (script'ten veya node metadata'sından)
  const nodeType: 'trigger' | 'action' | 'conditional' | 'loop' = 'action'; // Default
  
  // Icon mapping
  const iconMap: Record<string, LucideIcon> = {
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

  // Input params'ı frontend parameter formatına çevir
  const parameters = scriptContent?.input_schema 
    ? Object.entries(scriptContent.input_schema).map(([key, schema]: [string, any]) => ({
        id: key,
        label: schema.description || key,
        type: mapSchemaTypeToFrontendType(schema.type),
        placeholder: schema.placeholder || '',
        value: apiNode.input_params[key]?.value || schema.default || '',
        isDynamic: typeof apiNode.input_params[key]?.value === 'string' && 
                   apiNode.input_params[key]?.value.startsWith('${'),
        dynamicPath: typeof apiNode.input_params[key]?.value === 'string' && 
                     apiNode.input_params[key]?.value.startsWith('${')
                     ? apiNode.input_params[key]?.value
                     : undefined,
      }))
    : [];

  return {
    id: apiNode.id,
    type: nodeType,
    title: apiNode.name,
    icon: Settings, // Default icon, script'ten alınabilir
    category: '',
    nodeType: '',
    configured: true,
    parameters,
  };
}

/**
 * Schema type'ını frontend type'a çevir
 */
function mapSchemaTypeToFrontendType(schemaType: string): 'text' | 'dropdown' | 'number' | 'toggle' | 'textarea' | 'credential' {
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
      return 'textarea'; // Array için textarea kullan
    case 'object':
    case 'dict':
      return 'textarea'; // Object için textarea kullan
    default:
      return 'text';
  }
}

/**
 * Frontend WorkflowNode'u API Node formatına çevir
 */
export function mapWorkflowNodeToApiNode(
  workflowNode: WorkflowNode,
  workflowId: string,
  scriptId?: string,
  customScriptId?: string
): Partial<Node> {
  // Input params'ı API formatına çevir
  const input_params: Record<string, any> = {};
  
  workflowNode.parameters?.forEach(param => {
    if (param.isDynamic && param.dynamicPath) {
      input_params[param.id] = {
        type: mapFrontendTypeToSchemaType(param.type),
        value: param.dynamicPath,
        required: true,
      };
    } else {
      input_params[param.id] = {
        type: mapFrontendTypeToSchemaType(param.type),
        value: param.value,
        required: true,
      };
    }
  });

  return {
    name: workflowNode.title,
    description: workflowNode.category,
    workflow_id: workflowId,
    script_id: scriptId,
    custom_script_id: customScriptId,
    input_params,
    output_params: {},
    max_retries: 3,
    timeout_seconds: 300,
  };
}

/**
 * Frontend type'ını schema type'a çevir
 */
function mapFrontendTypeToSchemaType(frontendType: string): string {
  switch (frontendType) {
    case 'text':
    case 'textarea':
      return 'string';
    case 'number':
      return 'integer';
    case 'toggle':
      return 'boolean';
    case 'dropdown':
      return 'string';
    case 'credential':
      return 'string';
    default:
      return 'string';
  }
}

