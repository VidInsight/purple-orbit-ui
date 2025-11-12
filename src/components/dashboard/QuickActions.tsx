import { Button } from '@/components/ui/Button';
import { Plus, PlayCircle, Key, Workflow } from 'lucide-react';

interface QuickActionsProps {
  onCreateWorkflow: () => void;
  onViewExecutions: () => void;
  onManageCredentials: () => void;
  onViewWorkflows: () => void;
}

export const QuickActions = ({
  onCreateWorkflow,
  onViewExecutions,
  onManageCredentials,
  onViewWorkflows,
}: QuickActionsProps) => {
  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={onCreateWorkflow}
          className="w-full justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Workflow
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={onViewWorkflows}
          className="w-full justify-center"
        >
          <Workflow className="h-5 w-5 mr-2" />
          View Workflows
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={onViewExecutions}
          className="w-full justify-center"
        >
          <PlayCircle className="h-5 w-5 mr-2" />
          View Executions
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={onManageCredentials}
          className="w-full justify-center"
        >
          <Key className="h-5 w-5 mr-2" />
          Manage Credentials
        </Button>
      </div>
    </div>
  );
};
