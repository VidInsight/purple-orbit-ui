import { useState } from 'react';
import { ExecutionStep } from '@/types/execution';
import { StepDetail } from './StepDetail';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExecutionTimelineProps {
  steps: ExecutionStep[];
}

export const ExecutionTimeline = ({ steps }: ExecutionTimelineProps) => {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Execution Steps</h3>
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
  );
};
