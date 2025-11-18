import { useState } from 'react';
import { Zap, Edit2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';

interface Variable {
  name: string;
  type: string;
  defaultValue: string;
}

interface TriggerNodeProps {
  node: {
    id: string;
    title: string;
    icon?: string;
    variables?: Variable[];
  };
  onUpdate: (updates: any) => void;
}

export const TriggerNode = ({ node, onUpdate }: TriggerNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [variables, setVariables] = useState<Variable[]>(node.variables || []);
  
  const isConfigured = variables.length > 0 && variables.every(v => v.name && v.type);

  const handleNodeClick = () => {
    console.log('Node clicked:', {
      id: node.id,
      title: node.title,
      type: 'Trigger',
      configured: isConfigured,
      variables,
    });
    setIsExpanded(!isExpanded);
  };

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
    <div 
      className={`bg-surface rounded-lg shadow-md overflow-hidden transition-all duration-200 border-2 cursor-pointer ${
        isConfigured 
          ? 'border-success hover:border-success/80 hover:shadow-lg' 
          : 'border-warning hover:border-warning/80 hover:shadow-lg'
      }`}
      onClick={() => !isEditing && handleNodeClick()}
    >
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
              {node.icon || '⚡'}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{node.title}</h3>
            </div>
          </div>
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
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            Trigger
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isConfigured ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm text-success font-medium">Configured</span>
            </>
          ) : (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-warning" />
              <span className="text-sm text-warning font-medium">Unconfigured</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4 border-t border-border bg-surface/50">
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
