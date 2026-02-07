import { useState, useEffect } from 'react';
import { X, Link, LucideIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PathChip } from './PathChip';
import { usePathContext } from './PathContext';
import { getNodeFormSchema, updateNodeInputParams, FormSchemaResponse } from '@/services/workflowApi';
import { toast } from '@/hooks/use-toast';

interface Parameter {
  id: string;
  label: string;
  type: 'text' | 'dropdown' | 'number' | 'toggle' | 'textarea' | 'credential'|'input';
  inputType?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'file' | 'image' | 'audio' | 'video' | 'textarea';
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
    icon?: LucideIcon;
    parameters?: Parameter[];
  };
  isOpen: boolean;
  onClose: () => void;
  onParameterChange: (parameterId: string, value: any, isDynamic?: boolean) => void;
  onSaveSuccess?: (nodeId: string) => void;
  workspaceId?: string;
  workflowId?: string;
}

export const ParametersPanel = ({ node, isOpen, onClose, onParameterChange, onSaveSuccess, workspaceId, workflowId }: ParametersPanelProps) => {
  const [waitingForDrop, setWaitingForDrop] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiParameters, setApiParameters] = useState<Parameter[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { activePath, setActivePath } = usePathContext();

  // Load form schema from API when panel opens
  useEffect(() => {
    if (isOpen && workspaceId && workflowId && node.id) {
      loadFormSchema();
    } else if (isOpen && node.parameters) {
      // Fallback to node.parameters if API is not available
      setApiParameters(node.parameters);
    }
  }, [isOpen, workspaceId, workflowId, node.id]);

  const loadFormSchema = async () => {
    if (!workspaceId || !workflowId || !node.id) return;

    setIsLoading(true);
    try {
      const response = await getNodeFormSchema(workspaceId, workflowId, node.id);
      
      if (response.status === 'success' && response.data?.form_schema) {
        const formSchema = response.data.form_schema as FormSchemaResponse['form_schema'];
        
        // Map API form schema to Parameter interface
        const mappedParameters: Parameter[] = Object.entries(formSchema)
          .sort(([, a], [, b]) => (a.front?.order || 0) - (b.front?.order || 0))
          .map(([key, schemaItem]) => {
            const front = schemaItem.front;
            const isReference = schemaItem.is_reference || false;
            
            // Determine input type based on front.type and schemaItem.type
            let paramType: Parameter['type'] = 'text';
            let inputType: Parameter['inputType'] = 'text';
            
            if (front.type === 'number' || schemaItem.type === 'integer' || schemaItem.type === 'number') {
              paramType = 'number';
              inputType = 'number';
            } else if (front.type === 'textarea' || schemaItem.type === 'string') {
              paramType = 'textarea';
              inputType = 'textarea';
            } else if (front.type === 'boolean' || schemaItem.type === 'boolean') {
              paramType = 'toggle';
            } else if (front.values && front.values.length > 0) {
              paramType = 'dropdown';
            } else if (front.type === 'credential') {
              paramType = 'credential';
            } else {
              paramType = 'input';
              inputType = front.type as Parameter['inputType'] || 'text';
            }

            return {
              id: key,
              label: schemaItem.description || front.placeholder || key,
              type: paramType,
              inputType: inputType,
              placeholder: front.placeholder || undefined,
              options: front.values || undefined,
              min: schemaItem.type === 'integer' || schemaItem.type === 'number' ? undefined : undefined,
              max: undefined,
              value: schemaItem.value ?? schemaItem.default_value ?? undefined,
              isDynamic: isReference,
              dynamicPath: isReference && typeof schemaItem.value === 'string' ? schemaItem.value : undefined,
            };
          });
        
        setApiParameters(mappedParameters);
      }
    } catch (error) {
      console.error('Error loading form schema:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load node parameters',
        variant: 'destructive',
      });
      // Fallback to node.parameters if API fails
      if (node.parameters) {
        setApiParameters(node.parameters);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // When a path is active and we're waiting for drop, apply it
    if (activePath && waitingForDrop) {
      handleValueChange(waitingForDrop, activePath, true);
      setWaitingForDrop(null);
      setActivePath(null);
    }
  }, [activePath, waitingForDrop]);

  const handleValueChange = (parameterId: string, value: any, isDynamic: boolean = false) => {
    // Update local state
    setApiParameters(prev => prev.map(param => 
      param.id === parameterId 
        ? { 
            ...param, 
            value, 
            isDynamic,
            dynamicPath: isDynamic ? value : undefined 
          } 
        : param
    ));

    // Call parent callback
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

  const handleSaveAll = async () => {
    if (!workspaceId || !workflowId || !node.id) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      const inputParams: Record<string, any> = {};
      
      apiParameters.forEach(param => {
        // Use dynamic path if it's a dynamic value, otherwise use the static value
        inputParams[param.id] = param.isDynamic && param.dynamicPath 
          ? param.dynamicPath 
          : param.value;
      });

      await updateNodeInputParams(workspaceId, workflowId, node.id, inputParams);
      
      toast({
        title: 'Success',
        description: 'All parameters saved successfully',
      });
      
      onSaveSuccess?.(node.id);
      onClose();
    } catch (error) {
      console.error('Error saving parameters:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save parameters',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Use API parameters if available, otherwise fallback to node.parameters
  const parameters = apiParameters.length > 0 ? apiParameters : (node.parameters || []);

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
        <div className="px-6 py-4 border-b border-border flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Node Configuration</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure parameters for this node
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-6 w-6 flex items-center justify-center hover:bg-accent/50 rounded transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {parameters.map((param) => (
              <div key={param.id} className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center justify-between">
                  {param.label}
                  {!param.isDynamic && (
                    <button
                      onClick={() => handleToggleMode(param.id, false)}
                      className="h-7 px-3 rounded bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1.5 transition-all text-xs font-medium"
                      title="Add a dynamic value from workspace resources"
                    >
                      <Link className="h-3.5 w-3.5" />
                      Add a Dynamic Value
                    </button>
                  )}
                </label>

                {waitingForDrop === param.id && !param.isDynamic && (
                  <div className="px-3 py-2 bg-primary/10 border border-dashed border-primary/40 rounded text-xs text-primary animate-pulse">
                    ← Select a value from the left panel
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
                        className="w-full"
                      />
                    )}

                    {/* Input with specific type */}
                    {param.type === 'input' && (
                      <Input
                        type={param.inputType || 'text'}
                        value={param.value || ''}
                        onChange={(e) => {
                          const value = param.inputType === 'number' 
                            ? (e.target.value === '' ? '' : parseFloat(e.target.value))
                            : e.target.value;
                          handleValueChange(param.id, value);
                        }}
                        placeholder={param.placeholder}
                        className="w-full"
                      />
                    )}

                {/* Dropdown */}
                {param.type === 'dropdown' && (
                  <select
                    value={param.value || ''}
                    onChange={(e) => handleValueChange(param.id, e.target.value)}
                    className="w-full px-3 py-2 rounded bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <label className="flex items-center gap-2 cursor-pointer">
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
                    className="w-full px-3 py-2 rounded bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                )}

                    {/* Credential Dropdown */}
                    {param.type === 'credential' && (
                      <select
                        value={param.value || ''}
                        onChange={(e) => handleValueChange(param.id, e.target.value)}
                        className="w-full px-3 py-2 rounded bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <Button
            variant="default"
            className="w-full"
            onClick={handleSaveAll}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
