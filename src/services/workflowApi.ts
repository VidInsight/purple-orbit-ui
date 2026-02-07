import { apiClient, getBaseUrl } from '@/utils/apiClient';
import { handleApiResponse } from '@/utils/errorHandler';

const BASE_URL = getBaseUrl();

export interface WorkflowApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: any; // API response formatına göre güncellenecek
}

export interface FormSchemaResponse {
  node_id: string;
  node_name: string;
  script_id: string;
  custom_script_id: string | null;
  script_name: string;
  script_type: string;
  form_schema: Record<string, {
    front: {
      order: number;
      type: string;
      values: string[] | null;
      placeholder: string | null;
      supports_reference: boolean;
      reference_types: string[];
    };
    type: string;
    default_value: any;
    value: any;
    required: boolean;
    description: string;
    is_reference: boolean;
  }>;
  output_schema: any;
}

export interface UpdateNodeFormSchemaData {
  [key: string]: {
    value?: any;
    is_reference?: boolean;
    reference_path?: string;
  };
}

/**
 * Get workflows for a workspace
 */
export const getWorkflows = async (workspaceId: string): Promise<WorkflowApiResponse> => {
  try {
    const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows`, {
      method: 'GET',
    });

    return await handleApiResponse<WorkflowApiResponse>(response, 'Failed to fetch workflows');
  } catch (error) {
    throw error;
  }
};

export interface CreateWorkflowData {
  name: string;
  description?: string;
  priority?: number;
  tags?: string[];
}

/**
 * Create a new workflow in a workspace
 */
export const createWorkflow = async (
  workspaceId: string,
  workflowData: CreateWorkflowData
): Promise<WorkflowApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!workflowData.name || workflowData.name.trim() === '') {
    throw new Error('Workflow name is required.');
  }

  try {
    const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows`, {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });

    return await handleApiResponse<WorkflowApiResponse>(response, 'Failed to create workflow');
  } catch (error) {
    throw error;
  }
};

export interface CreateNodeData {
  name: string;
  script_id: string;
  description: string;
  input_params: Record<string, any>;
}

/**
 * Get workflow graph data
 */
export const getWorkflowGraph = async (
  workspaceId: string,
  workflowId: string
): Promise<WorkflowApiResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/graph`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to fetch workflow graph: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Add a node to a workflow
 */
export const addNodeToWorkflow = async (
  workspaceId: string,
  workflowId: string,
  nodeData: CreateNodeData
): Promise<WorkflowApiResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/nodes`, {
    method: 'POST',
    body: JSON.stringify(nodeData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to add node: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface CreateEdgeData {
  from_node_id: string;
  to_node_id: string;
}

/**
 * Add an edge (connection) between two nodes in a workflow
 */
export const addEdgeToWorkflow = async (
  workspaceId: string,
  workflowId: string,
  edgeData: CreateEdgeData
): Promise<WorkflowApiResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/edges`, {
    method: 'POST',
    body: JSON.stringify(edgeData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to add edge: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Get node form schema
 */
export const getNodeFormSchema = async (
  workspaceId: string,
  workflowId: string,
  nodeId: string
): Promise<WorkflowApiResponse & { data: FormSchemaResponse }> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/nodes/${nodeId}/form-schema`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to fetch node form schema: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Update node form schema
 */
export const updateNodeFormSchema = async (
  workspaceId: string,
  workflowId: string,
  nodeId: string,
  formData: UpdateNodeFormSchemaData
): Promise<WorkflowApiResponse> => {
  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/nodes/${nodeId}/form-schema`, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to update node form schema: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface UpdateNodeInputParamsData {
  input_params: Record<string, any>;
}

/**
 * Update node input parameters
 */
export const updateNodeInputParams = async (
  workspaceId: string,
  workflowId: string,
  nodeId: string,
  inputParams: Record<string, any>
): Promise<WorkflowApiResponse> => {
  const requestBody: UpdateNodeInputParamsData = {
    input_params: inputParams,
  };

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/nodes/${nodeId}/input-params`, {
    method: 'PUT',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to update node input params: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface WorkflowDetail {
  id: string;
  workspace_id: string;
  owner_id?: string;
  name: string;
  description?: string | null;
  status?: string;
  priority?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_executed?: string | null;
  execution_count?: number;
  [key: string]: any; // For any additional fields from API
}

export interface WorkflowDetailApiResponse {
  status: string;
  code: number;
  message: string | null;
  traceId: string;
  timestamp: string;
  data: WorkflowDetail;
}

/**
 * Get workflow detail by ID
 */
export const getWorkflowDetail = async (
  workspaceId: string,
  workflowId: string
): Promise<WorkflowDetailApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!workflowId || workflowId.trim() === '') {
    throw new Error('Workflow ID is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to fetch workflow detail: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Delete a node from a workflow
 */
export const deleteNodeFromWorkflow = async (
  workspaceId: string,
  workflowId: string,
  nodeId: string
): Promise<WorkflowApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!workflowId || workflowId.trim() === '') {
    throw new Error('Workflow ID is required.');
  }

  if (!nodeId || nodeId.trim() === '') {
    throw new Error('Node ID is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/nodes/${nodeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to delete node: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface TestExecutionData {
  input_data: Record<string, any>;
}

/**
 * Test workflow execution
 */
export const testWorkflowExecution = async (
  workspaceId: string,
  workflowId: string,
  testData: TestExecutionData
): Promise<WorkflowApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!workflowId || workflowId.trim() === '') {
    throw new Error('Workflow ID is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/executions/test`, {
    method: 'POST',
    body: JSON.stringify(testData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to test workflow execution: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Get execution details by ID
 */
export const getExecution = async (
  workspaceId: string,
  executionId: string
): Promise<WorkflowApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!executionId || executionId.trim() === '') {
    throw new Error('Execution ID is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/executions/${executionId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to fetch execution details: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface Trigger {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  config: Record<string, any>;
  is_enabled: boolean;
}

export interface WorkflowTriggersResponse {
  workflow_id: string;
  triggers: Trigger[];
  count: number;
}

/**
 * Get workflow triggers
 */
export const getWorkflowTriggers = async (
  workspaceId: string,
  workflowId: string
): Promise<WorkflowApiResponse & { data: WorkflowTriggersResponse }> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!workflowId || workflowId.trim() === '') {
    throw new Error('Workflow ID is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/triggers`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to fetch workflow triggers: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface TriggerDetail {
  id: string;
  workspace_id: string;
  workflow_id: string;
  name: string;
  description: string;
  trigger_type: string;
  config: Record<string, any>;
  input_mapping: Record<string, { type: string; value: any }>;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const stopExecution = async (
  workspaceId: string,
  executionId: string
): Promise<WorkflowApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!executionId || executionId.trim() === '') {
    throw new Error('Execution ID is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/executions/${executionId}/cancel`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to stop execution: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};


/**
 * Get workflow trigger detail by ID
 */
export const getWorkflowTrigger = async (
  workspaceId: string,
  workflowId: string,
  triggerId: string
): Promise<WorkflowApiResponse & { data: TriggerDetail }> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!workflowId || workflowId.trim() === '') {
    throw new Error('Workflow ID is required.');
  }

  if (!triggerId || triggerId.trim() === '') {
    throw new Error('Trigger ID is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/triggers/${triggerId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to fetch workflow trigger: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface UpdateTriggerData {
  name?: string;
  description?: string;
  trigger_type?: string;
  config?: Record<string, any>;
  input_mapping?: Record<string, any>;
}

/**
 * Update workflow trigger
 */
export const updateWorkflowTrigger = async (
  workspaceId: string,
  workflowId: string,
  triggerId: string,
  triggerData: UpdateTriggerData
): Promise<WorkflowApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!workflowId || workflowId.trim() === '') {
    throw new Error('Workflow ID is required.');
  }

  if (!triggerId || triggerId.trim() === '') {
    throw new Error('Trigger ID is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/triggers/${triggerId}`, {
    method: 'PUT',
    body: JSON.stringify(triggerData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to update workflow trigger: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Delete a workflow
 */
export const deleteWorkflow = async (
  workspaceId: string,
  workflowId: string
): Promise<WorkflowApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!workflowId || workflowId.trim() === '') {
    throw new Error('Workflow ID is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to delete workflow: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export interface InsertNodeBetweenData {
  from_node_id: string;
  to_node_id: string;
  name: string;
  script_id?: string;
  custom_script_id?: string;
  description?: string;
  input_params?: Record<string, any>;
  output_params?: Record<string, any>;
  meta_data?: Record<string, any>;
  max_retries?: number;
  timeout_seconds?: number;
}

/**
 * Insert a node between two existing nodes in a workflow
 */
export const insertNodeBetween = async (
  workspaceId: string,
  workflowId: string,
  nodeData: InsertNodeBetweenData
): Promise<WorkflowApiResponse> => {
  if (!workspaceId || workspaceId.trim() === '') {
    throw new Error('Workspace ID is required. Please select a workspace first.');
  }

  if (!workflowId || workflowId.trim() === '') {
    throw new Error('Workflow ID is required.');
  }

  if (!nodeData.from_node_id || nodeData.from_node_id.trim() === '') {
    throw new Error('From node ID is required.');
  }

  if (!nodeData.to_node_id || nodeData.to_node_id.trim() === '') {
    throw new Error('To node ID is required.');
  }

  if (!nodeData.name || nodeData.name.trim() === '') {
    throw new Error('Node name is required.');
  }

  const response = await apiClient(`${BASE_URL}/frontend/workspaces/${workspaceId}/workflows/${workflowId}/nodes/insert-between`, {
    method: 'POST',
    body: JSON.stringify(nodeData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    console.error('Parsed error data:', errorData);
    throw new Error(errorData.message || errorData.error || `Failed to insert node between: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};



