import { ExecutionDetails, ExecutionStep, ExecutionLog, ExecutionStatus } from '@/types/execution';

export const generateMockExecutionDetails = (id: string, status: ExecutionStatus = 'success'): ExecutionDetails => {
  const startedAt = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const completedAt = status !== 'running' ? new Date(Date.now() - 2 * 60 * 1000).toISOString() : undefined;

  const steps: ExecutionStep[] = [
    {
      id: 'step-1',
      name: 'HTTP Request Trigger',
      type: 'trigger',
      status: 'success',
      startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 4.9 * 60 * 1000).toISOString(),
      duration: 100,
      input: {
        method: 'POST',
        url: 'https://api.example.com/webhook',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      output: {
        statusCode: 200,
        body: {
          event: 'order.created',
          orderId: '12345',
        },
      },
    },
    {
      id: 'step-2',
      name: 'Fetch Customer Data',
      type: 'action',
      status: status === 'running' ? 'running' : 'success',
      startedAt: new Date(Date.now() - 4.8 * 60 * 1000).toISOString(),
      completedAt: status !== 'running' ? new Date(Date.now() - 4.5 * 60 * 1000).toISOString() : undefined,
      duration: status !== 'running' ? 300 : undefined,
      input: {
        customerId: 'cus_123',
        fields: ['name', 'email', 'phone'],
      },
      output: status !== 'running' ? {
        customer: {
          id: 'cus_123',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
      } : undefined,
    },
  ];

  if (status !== 'running') {
    steps.push({
      id: 'step-3',
      name: 'Check Inventory',
      type: 'condition',
      status: status === 'failed' ? 'failed' : 'success',
      startedAt: new Date(Date.now() - 4.3 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      duration: 200,
      input: {
        productId: 'prod_789',
        quantity: 2,
      },
      output: status !== 'failed' ? {
        available: true,
        stock: 15,
      } : undefined,
      error: status === 'failed' ? {
        message: 'Inventory check failed: Database connection timeout',
        code: 'DB_TIMEOUT',
        stack: 'Error: Database connection timeout\n    at checkInventory (/app/functions/inventory.ts:45)\n    at executeStep (/app/engine/executor.ts:112)',
      } : undefined,
    });

    if (status === 'success') {
      steps.push({
        id: 'step-4',
        name: 'Send Confirmation Email',
        type: 'action',
        status: 'success',
        startedAt: new Date(Date.now() - 3.5 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        duration: 1500,
        input: {
          to: 'john@example.com',
          subject: 'Order Confirmation',
          template: 'order-confirmation',
          data: {
            orderId: '12345',
            customerName: 'John Doe',
          },
        },
        output: {
          messageId: 'msg_xyz',
          sent: true,
        },
      });
    }
  }

  const logs: ExecutionLog[] = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'Execution started',
      data: { executionId: id },
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 4.9 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'Processing HTTP trigger',
      data: { step: 'step-1' },
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 4.8 * 60 * 1000).toISOString(),
      level: 'debug',
      message: 'Fetching customer data from API',
      data: { customerId: 'cus_123' },
    },
  ];

  if (status !== 'running') {
    logs.push({
      id: 'log-4',
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      level: status === 'failed' ? 'error' : 'info',
      message: status === 'failed' ? 'Inventory check failed' : 'Inventory check completed',
      data: { step: 'step-3' },
    });

    if (status === 'failed') {
      logs.push({
        id: 'log-5',
        timestamp: new Date(Date.now() - 3.9 * 60 * 1000).toISOString(),
        level: 'error',
        message: 'Execution failed: Database connection timeout',
        data: {
          error: 'DB_TIMEOUT',
          step: 'step-3',
        },
      });
    } else {
      logs.push({
        id: 'log-5',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'Execution completed successfully',
      });
    }
  }

  return {
    id,
    workflowId: 'workflow-1',
    workflowName: 'Order Processing Workflow',
    status,
    startedAt,
    completedAt,
    duration: completedAt ? Math.floor((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000) : undefined,
    triggeredBy: 'webhook',
    steps,
    logs,
    metadata: {
      region: 'us-east-1',
      version: '1.0.0',
    },
  };
};
