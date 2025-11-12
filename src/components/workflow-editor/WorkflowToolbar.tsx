import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Play, Save, Settings, Upload } from 'lucide-react';
import { WorkflowStatus } from '@/types/workflow';
import { cn } from '@/lib/utils';

interface WorkflowToolbarProps {
  workflowName: string;
  workflowStatus: WorkflowStatus;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onTest: () => void;
  onPublish: () => void;
  isSaving?: boolean;
}

export const WorkflowToolbar = ({
  workflowName,
  workflowStatus,
  onNameChange,
  onSave,
  onTest,
  onPublish,
  isSaving = false,
}: WorkflowToolbarProps) => {
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);

  const getStatusColor = (status: WorkflowStatus) => {
    const colors = {
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-success/10 text-success',
      inactive: 'bg-destructive/10 text-destructive',
    };
    return colors[status];
  };

  return (
    <div className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/workflows')}
          aria-label="Back to workflows"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          {isEditingName ? (
            <Input
              value={workflowName}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              autoFocus
              className="h-8"
            />
          ) : (
            <h1
              className="text-lg font-semibold text-foreground cursor-pointer hover:text-primary transition-colors truncate"
              onClick={() => setIsEditingName(true)}
            >
              {workflowName}
            </h1>
          )}

          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
              getStatusColor(workflowStatus)
            )}
          >
            {workflowStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onTest}>
          <Play className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Test Run</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onSave}
          loading={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>

        <Button variant="primary" size="sm" onClick={onPublish}>
          <Upload className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Publish</span>
        </Button>

        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
