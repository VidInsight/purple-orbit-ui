import { useState } from 'react';
import { Zap, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Variable {
  name: string;
  type: string;
  defaultValue: string;
}

interface TriggerNodeProps {
  node: {
    id: string;
    title: string;
    variables?: Variable[];
  };
  onUpdate: (updates: any) => void;
}

export const TriggerNode = ({ node, onUpdate }: TriggerNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [variables, setVariables] = useState<Variable[]>(node.variables || []);

  const handleVariableChange = (index: number, field: keyof Variable, value: string) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const handleSave = () => {
    onUpdate({ variables });
    setIsEditing(false);
  };

  const handleAddVariable = () => {
    setVariables([...variables, { name: '', type: 'string', defaultValue: '' }]);
  };

  return (
    <div className="bg-surface border-2 border-primary rounded-lg shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl">
      {/* Header */}
      <div 
        className="bg-primary/10 border-b border-primary/20 px-6 py-4 flex items-center justify-between cursor-pointer"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{node.title}</h3>
            <p className="text-xs text-muted-foreground">When this happens...</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setIsExpanded(true);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Variables</h4>
            <div className="space-y-3">
              {variables.map((variable, index) => (
                <div key={index} className="grid grid-cols-3 gap-3">
                  {isEditing ? (
                    <>
                      <Input
                        value={variable.name}
                        onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                        placeholder="Variable name"
                        className="text-sm"
                      />
                      <select
                        value={variable.type}
                        onChange={(e) => handleVariableChange(index, 'type', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="object">Object</option>
                      </select>
                      <Input
                        value={variable.defaultValue}
                        onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                        placeholder="Default value"
                        className="text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-foreground font-medium">{variable.name}</div>
                      <div className="text-sm text-muted-foreground">{variable.type}</div>
                      <div className="text-sm text-muted-foreground">{variable.defaultValue || '-'}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddVariable}
                className="flex-1"
              >
                Add Variable
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
