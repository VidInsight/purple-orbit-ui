export type ExecutionStatus = 'success' | 'failed' | 'running' | 'cancelled';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface ExecutionStep {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition' | 'loop';
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

export interface ExecutionDetails {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  triggeredBy: string;
  steps: ExecutionStep[];
  logs: ExecutionLog[];
  metadata?: Record<string, any>;
}
