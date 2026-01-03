import { useState } from 'react';
import { Zap, CheckCircle2, Plus, X, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Variable {
  name: string;
  type: string;
  defaultValue: string;
}

interface TriggerNodeProps {
  node: {
    id: string;
    title: string;
    icon?: LucideIcon;
    variables?: Variable[];
  };
  onUpdate: (updates: any) => void;
  onClick?: () => void;
}

export const TriggerNode = ({ node, onUpdate }: TriggerNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [variables, setVariables] = useState<Variable[]>(node.variables || []);
  
  const isConfigured = variables.length > 0 && variables.every(v => v.name && v.type);

  const handleVariableChange = (index: number, field: keyof Variable, value: string) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
    onUpdate({ variables: updated });
  };

  const handleAddVariable = () => {
    const updated = [...variables, { name: '', type: 'string', defaultValue: '' }];
    setVariables(updated);
    onUpdate({ variables: updated });
  };

  const handleRemoveVariable = (index: number) => {
    const updated = variables.filter((_, i) => i !== index);
    setVariables(updated);
    onUpdate({ variables: updated });
  };

  return (
    <div 
      className="bg-surface rounded-lg shadow-md overflow-hidden transition-all duration-200 border-2 border-primary hover:border-primary/80 hover:shadow-lg"
    >
      {/* Header */}
      <div className="px-5 py-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  {isConfigured ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-success" />
                      <span className="text-xs text-success font-medium">Configured</span>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-3 rounded-full border-2 border-warning" />
                      <span className="text-xs text-warning font-medium">Unconfigured</span>
                    </>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{node.title}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Variables Editor */}
      {isExpanded && (
        <div className="px-5 py-3 border-t border-border bg-surface/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Variables</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddVariable}
                className="h-7 px-2"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>

            {variables.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                No variables defined
              </p>
            ) : (
              <div className="space-y-2">
                {variables.map((variable, index) => (
                  <div key={index} className="p-2 bg-background rounded border border-border space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Variable name"
                          value={variable.name}
                          onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                          className="text-xs h-7"
                        />
                        <select
                          value={variable.type}
                          onChange={(e) => handleVariableChange(index, 'type', e.target.value)}
                          className="text-xs border border-border rounded-md px-2 bg-background h-7"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="object">Object</option>
                          <option value="array">Array</option>
                        </select>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVariable(index)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Default value"
                      value={variable.defaultValue}
                      onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                      className="text-xs h-7"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
