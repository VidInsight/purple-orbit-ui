import { createWorkspace, setCurrentWorkspace } from './workspaceStorage';
import { saveWorkflow } from './workflowStorage';

export const seedDemoData = () => {
  // Check if already seeded
  if (localStorage.getItem('demo_data_seeded') === 'true') {
    return;
  }

  // Create demo workspace
  const workspace = createWorkspace('Demo Workspace', 'A sample workspace with demo data');

  setCurrentWorkspace(workspace.id);

  // Create demo workflows
  const demoWorkflow1 = {
    id: `workflow-${Date.now()}-1`,
    name: 'Customer Onboarding',
    description: 'Automated customer onboarding process',
    status: 'active' as const,
    version: 1,
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger' as const,
        position: { x: 100, y: 100 },
        data: {
          label: 'New Customer',
          description: 'Trigger when a new customer signs up',
          config: {},
        },
      },
      {
        id: 'action-1',
        type: 'action' as const,
        position: { x: 100, y: 250 },
        data: {
          label: 'Send Welcome Email',
          description: 'Send welcome email to customer',
          config: { template: 'welcome' },
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'action-1',
        type: 'default',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const demoWorkflow2 = {
    id: `workflow-${Date.now()}-2`,
    name: 'Daily Report Generator',
    description: 'Generate and send daily analytics reports',
    status: 'active' as const,
    version: 1,
    nodes: [
      {
        id: 'trigger-2',
        type: 'trigger' as const,
        position: { x: 100, y: 100 },
        data: {
          label: 'Daily Schedule',
          description: 'Runs every day at 9 AM',
          config: { schedule: '0 9 * * *' },
        },
      },
    ],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveWorkflow(demoWorkflow1);
  saveWorkflow(demoWorkflow2);

  // Mark as seeded
  localStorage.setItem('demo_data_seeded', 'true');
};
