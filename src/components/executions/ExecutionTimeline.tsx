import { useState } from 'react';
import { ExecutionStep } from '@/types/execution';
import { StepDetail } from './StepDetail';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExecutionTimelineProps {
  steps: ExecutionStep[];
}

export const ExecutionTimeline = ({ steps }: ExecutionTimelineProps) => {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div className="bg-surface rounded-lg border border-border h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <ChevronDown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Execution Steps</h3>
            <p className="text-xs text-muted-foreground">Step-by-step workflow execution timeline</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandAll(!expandAll)}
        >
          {expandAll ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Expand All
            </>
          )}
        </Button>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <div className="space-y-0">
          {steps.map((step, index) => (
            <StepDetail
              key={step.id}
              step={step}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
