import { Workflow } from '@/types/workflow';

const STORAGE_KEY = 'workflows';

export const getWorkflows = (): Workflow[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading workflows:', error);
    return [];
  }
};

export const getWorkflow = (id: string): Workflow | null => {
  const workflows = getWorkflows();
  return workflows.find((w) => w.id === id) || null;
};

export const saveWorkflow = (workflow: Workflow): void => {
  try {
    const workflows = getWorkflows();
    const index = workflows.findIndex((w) => w.id === workflow.id);
    
    workflow.updatedAt = new Date().toISOString();
    
    if (index >= 0) {
      workflows[index] = workflow;
    } else {
      workflows.push(workflow);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  } catch (error) {
    console.error('Error saving workflow:', error);
    throw error;
  }
};

export const deleteWorkflow = (id: string): void => {
  try {
    const workflows = getWorkflows();
    const filtered = workflows.filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
};

export const createNewWorkflow = (): Workflow => {
  return {
    id: `workflow-${Date.now()}`,
    name: 'Untitled Workflow',
    description: '',
    status: 'draft',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Trigger',
          description: 'Start your workflow',
        },
      },
    ],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
};
