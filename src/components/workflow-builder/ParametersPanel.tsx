import { useState } from 'react';
import { X, Link } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Parameter {
  id: string;
  label: string;
  type: 'text' | 'dropdown' | 'number' | 'toggle' | 'textarea' | 'credential';
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  value?: any;
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
  onParameterChange: (parameterId: string, value: any) => void;
}

export const ParametersPanel = ({ node, isOpen, onClose, onParameterChange }: ParametersPanelProps) => {
  const [waitingForDrop, setWaitingForDrop] = useState<string | null>(null);

  const handleValueChange = (parameterId: string, value: any) => {
    console.log('Parameter changed:', { nodeId: node.id, parameterId, value });
    onParameterChange(parameterId, value);
  };

  const handleDragDropClick = (parameterId: string) => {
    if (waitingForDrop === parameterId) {
      setWaitingForDrop(null);
    } else {
      setWaitingForDrop(parameterId);
      console.log('Waiting for drop on parameter:', parameterId);
    }
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
      <div className="fixed right-0 top-0 h-full w-[400px] bg-surface border-l border-border shadow-2xl z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {node.icon && <span className="text-2xl">{node.icon}</span>}
            <h2 className="text-lg font-semibold text-foreground">{node.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {node.parameters?.map((param) => (
              <div key={param.id} className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center justify-between">
                  {param.label}
                  <button
                    onClick={() => handleDragDropClick(param.id)}
                    className={`h-7 w-7 rounded flex items-center justify-center transition-all ${
                      waitingForDrop === param.id
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-accent/50 text-muted-foreground hover:bg-accent'
                    }`}
                    title="Link variable"
                  >
                    <Link className="h-4 w-4" />
                  </button>
                </label>

                {waitingForDrop === param.id && (
                  <div className="px-3 py-2 bg-primary/10 border-2 border-dashed border-primary rounded-lg text-sm text-primary animate-pulse">
                    Waiting for variable drop...
                  </div>
                )}

                {/* Text Input */}
                {param.type === 'text' && (
                  <Input
                    value={param.value || ''}
                    onChange={(e) => handleValueChange(param.id, e.target.value)}
                    placeholder={param.placeholder}
                    className="w-full"
                  />
                )}

                {/* Dropdown */}
                {param.type === 'dropdown' && (
                  <select
                    value={param.value || ''}
                    onChange={(e) => handleValueChange(param.id, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full"
                  />
                )}

                {/* Toggle Switch */}
                {param.type === 'toggle' && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={param.value || false}
                        onChange={(e) => handleValueChange(param.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-accent rounded-full peer peer-checked:bg-primary transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
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
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                )}

                {/* Credential Dropdown */}
                {param.type === 'credential' && (
                  <select
                    value={param.value || ''}
                    onChange={(e) => handleValueChange(param.id, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <Button
            variant="primary"
            className="w-full"
            onClick={onClose}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
};
