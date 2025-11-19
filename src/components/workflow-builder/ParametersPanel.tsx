import { useState, useEffect } from 'react';
import { X, Link } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PathChip } from './PathChip';
import { usePathContext } from './PathContext';

interface Parameter {
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
}

interface ParametersPanelProps {
  node: {
    id: string;
    title: string;
    icon?: string;
    parameters?: Parameter[];
  };
  isOpen: boolean;
  onClose: () => void;
  onParameterChange: (parameterId: string, value: any, isDynamic?: boolean) => void;
}

export const ParametersPanel = ({ node, isOpen, onClose, onParameterChange }: ParametersPanelProps) => {
  const [waitingForDrop, setWaitingForDrop] = useState<string | null>(null);
  const { activePath, setActivePath } = usePathContext();

  useEffect(() => {
    // When a path is active and we're waiting for drop, apply it
    if (activePath && waitingForDrop) {
      handleValueChange(waitingForDrop, activePath, true);
      setWaitingForDrop(null);
      setActivePath(null);
    }
  }, [activePath, waitingForDrop]);

  const handleValueChange = (parameterId: string, value: any, isDynamic: boolean = false) => {
    console.log('Parameter changed:', { 
      nodeId: node.id, 
      parameterId, 
      value, 
      isDynamic,
      type: isDynamic ? 'dynamic' : 'static' 
    });
    onParameterChange(parameterId, value, isDynamic);
  };

  const handleToggleMode = (parameterId: string, currentIsDynamic: boolean) => {
    if (currentIsDynamic) {
      // Switch to static mode
      handleValueChange(parameterId, '', false);
    } else {
      // Switch to dynamic mode - wait for path
      setWaitingForDrop(parameterId);
    }
  };

  const handleRemoveDynamicPath = (parameterId: string) => {
    handleValueChange(parameterId, '', false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[350px] bg-surface border-l border-border z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Node Configuration
          </h3>
          <button
            onClick={onClose}
            className="h-6 w-6 flex items-center justify-center hover:bg-accent/50 rounded transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-4">
            {node.parameters?.map((param) => (
              <div key={param.id} className="space-y-1.5">
                <label className="text-[11px] font-medium text-foreground flex items-center justify-between leading-tight">
                  {param.label}
                  {!param.isDynamic && (
                    <button
                      onClick={() => handleToggleMode(param.id, false)}
                      className="h-6 px-2 rounded bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 transition-all text-[10px] font-medium"
                      title="Switch to dynamic mode"
                    >
                      <Link className="h-3 w-3" />
                      Dynamic
                    </button>
                  )}
                </label>

                {waitingForDrop === param.id && !param.isDynamic && (
                  <div className="px-2 py-1.5 bg-primary/10 border border-dashed border-primary/40 rounded text-[11px] text-primary">
                    Select value from Previous Outputs
                  </div>
                )}

                {/* Dynamic Mode - Show Path Chip */}
                {param.isDynamic && param.dynamicPath && (
                  <PathChip
                    path={param.dynamicPath}
                    onRemove={() => handleRemoveDynamicPath(param.id)}
                  />
                )}

                {/* Static Mode - Show Regular Inputs */}
                {!param.isDynamic && (
                  <>
                    {/* Text Input */}
                    {param.type === 'text' && (
                      <Input
                        value={param.value || ''}
                        onChange={(e) => handleValueChange(param.id, e.target.value)}
                        placeholder={param.placeholder}
                        className="w-full px-2.5 py-1.5 text-[11px] h-auto rounded"
                      />
                    )}

                {/* Dropdown */}
                {param.type === 'dropdown' && (
                  <select
                    value={param.value || ''}
                    onChange={(e) => handleValueChange(param.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-background border border-input text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select option...</option>
                    {param.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {/* Number Input */}
                {param.type === 'number' && (
                  <Input
                    type="number"
                    value={param.value ?? ''}
                    onChange={(e) => handleValueChange(param.id, parseFloat(e.target.value))}
                    placeholder={param.placeholder}
                    min={param.min}
                    max={param.max}
                    step="0.1"
                    className="w-full px-2.5 py-1.5 text-[11px] h-auto rounded"
                  />
                )}

                {/* Toggle Switch */}
                {param.type === 'toggle' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={param.value || false}
                        onChange={(e) => handleValueChange(param.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-accent rounded-full peer peer-checked:bg-primary transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-background rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {param.value ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                )}

                {/* Textarea */}
                {param.type === 'textarea' && (
                  <textarea
                    value={param.value || ''}
                    onChange={(e) => handleValueChange(param.id, e.target.value)}
                    placeholder={param.placeholder}
                    rows={3}
                    className="w-full px-2.5 py-1.5 rounded bg-background border border-input text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-tight"
                  />
                )}

                    {/* Credential Dropdown */}
                    {param.type === 'credential' && (
                      <select
                        value={param.value || ''}
                        onChange={(e) => handleValueChange(param.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-background border border-input text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Select credential...</option>
                        <option value="new" className="text-primary font-medium">
                          + Connect New
                        </option>
                        {param.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <Button
            variant="primary"
            className="w-full h-8 text-[11px]"
            onClick={onClose}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
};
