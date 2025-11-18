import { useState } from 'react';
import { Zap, Edit2, CheckCircle2, Eye, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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
  onClick?: () => void;
}

export const TriggerNode = ({ node, onUpdate, onClick }: TriggerNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [variables, setVariables] = useState<Variable[]>(node.variables || []);
  
  const isConfigured = variables.length > 0 && variables.every(v => v.name && v.type);

  const handleNodeClick = () => {
    if (onClick && !isViewing && !isEditing) {
      onClick();
    }
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
      className={`bg-surface rounded-lg shadow-md overflow-hidden transition-all duration-200 border-2 border-primary hover:border-primary/80 hover:shadow-lg`}
    >
      {/* Header */}
      <div className="px-5 py-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1" onClick={handleNodeClick}>
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsViewing(!isViewing);
                setIsEditing(false);
              }}
              className="h-8 w-8 p-0"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setIsViewing(false);
                if (onClick) onClick();
              }}
              className="h-8 w-8 p-0"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content - View Mode */}
      {isViewing && (
        <div className="px-6 py-4 border-t border-border bg-surface/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Variables (Read-only)</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsViewing(false)}
              className="h-6 w-6 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {variables.map((variable, index) => (
              <div key={index} className="grid grid-cols-3 gap-3">
                <Input
                  value={variable.name}
                  disabled
                  className="text-sm"
                />
                <select
                  value={variable.type}
                  disabled
                  className="px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring opacity-60 cursor-not-allowed"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="object">Object</option>
                </select>
                <Input
                  value={variable.defaultValue}
                  disabled
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content - Edit Mode */}
      {isEditing && (
        <div className="px-6 py-4 border-t border-border bg-surface/50 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Variables</h4>
            <div className="space-y-3">
              {variables.map((variable, index) => (
                <div key={index} className="grid grid-cols-3 gap-3">
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
