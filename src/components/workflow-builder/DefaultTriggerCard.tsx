import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, CheckCircle2, Loader2, AlertCircle, Edit2, X, Plus, Trash2 } from 'lucide-react';
import { getWorkflowTriggers, getWorkflowTrigger, updateWorkflowTrigger, Trigger, UpdateTriggerData } from '@/services/workflowApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface DefaultTriggerCardProps {
  workspaceId?: string;
  workflowId?: string;
  onTriggerDataChange?: (triggerData: { input_mapping: Record<string, { type: string; value: any }> } | null) => void;
}

export const DefaultTriggerCard = ({ workspaceId, workflowId, onTriggerDataChange }: DefaultTriggerCardProps) => {
  const [defaultTrigger, setDefaultTrigger] = useState<Trigger | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTriggerDetail, setIsLoadingTriggerDetail] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState<UpdateTriggerData>({
    name: '',
    description: '',
    trigger_type: '',
    config: {},
    input_mapping: {},
  });

  // Store types for each input mapping parameter
  const [inputMappingTypes, setInputMappingTypes] = useState<Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>>({});

  useEffect(() => {
    const fetchDefaultTrigger = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken || !workspaceId || !workflowId || workflowId === 'new') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getWorkflowTriggers(workspaceId, workflowId);
        
        if (response.status === 'success' && response.data) {
          // Get the first trigger from the triggers array
          const triggers = response.data.triggers || [];
          const trigger = triggers.length > 0 ? triggers[0] : null;
          setDefaultTrigger(trigger);
          
          // Notify parent about trigger data change
          if (onTriggerDataChange) {
            const triggerWithMapping = trigger as Trigger & { input_mapping?: Record<string, any> };
            onTriggerDataChange({
              input_mapping: triggerWithMapping.input_mapping || {},
            });
          }
        } else {
          setDefaultTrigger(null);
          if (onTriggerDataChange) {
            onTriggerDataChange(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch default trigger:', err);
        setError(err instanceof Error ? err.message : 'Failed to load default trigger');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultTrigger();
  }, [workspaceId, workflowId]);

  // Initialize edit form when trigger is loaded or edit panel opens
  // Also reinitialize when defaultTrigger changes while edit panel is open
  useEffect(() => {
    if (defaultTrigger && isEditOpen) {
      console.log('Initializing edit form with trigger:', defaultTrigger);
      
      // Try to get input_mapping from trigger if available
      const triggerWithMapping = defaultTrigger as Trigger & { input_mapping?: Record<string, any> };
      const inputMapping = triggerWithMapping.input_mapping || {};
      
      console.log('Input mapping from trigger:', inputMapping);
      
      // Parse input_mapping - API returns {type, value} format
      const types: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'> = {};
      const parsedMapping: Record<string, { type: string; value: any }> = {};
      
      Object.entries(inputMapping).forEach(([key, mappingValue]) => {
        console.log(`Processing input mapping key: ${key}, value:`, mappingValue);
        
        // Check if it's already in {type, value} format
        if (mappingValue && typeof mappingValue === 'object' && 'type' in mappingValue && 'value' in mappingValue) {
          types[key] = mappingValue.type as 'string' | 'number' | 'boolean' | 'object' | 'array';
          parsedMapping[key] = {
            type: mappingValue.type,
            value: mappingValue.value,
          };
        } else {
          // Legacy format - detect type from value
          let detectedType: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string';
          if (typeof mappingValue === 'number') {
            detectedType = 'number';
          } else if (typeof mappingValue === 'boolean') {
            detectedType = 'boolean';
          } else if (Array.isArray(mappingValue)) {
            detectedType = 'array';
          } else if (typeof mappingValue === 'object' && mappingValue !== null) {
            detectedType = 'object';
          } else if (typeof mappingValue === 'string') {
            // Try to detect if it's JSON
            try {
              const parsed = JSON.parse(mappingValue);
              if (Array.isArray(parsed)) {
                detectedType = 'array';
              } else if (typeof parsed === 'object' && parsed !== null) {
                detectedType = 'object';
              }
            } catch {
              detectedType = 'string';
            }
          }
          
          types[key] = detectedType;
          parsedMapping[key] = {
            type: detectedType,
            value: mappingValue,
          };
        }
      });
      
      console.log('Parsed mapping:', parsedMapping);
      console.log('Types:', types);
      
      setInputMappingTypes(types);
      setEditForm({
        name: defaultTrigger.name || '',
        description: defaultTrigger.description || '',
        trigger_type: defaultTrigger.trigger_type || '',
        config: defaultTrigger.config || {},
        input_mapping: parsedMapping,
      });
    } else if (!isEditOpen) {
      // Reset form when panel closes
      setInputMappingTypes({});
      setEditForm({
        name: '',
        description: '',
        trigger_type: '',
        config: {},
        input_mapping: {},
      });
    }
  }, [defaultTrigger, isEditOpen]);

  const handleEdit = async () => {
    if (!workspaceId || !workflowId || !defaultTrigger?.id) {
      toast({
        title: 'Error',
        description: 'Missing required information to load trigger details',
        variant: 'destructive',
      });
      return;
    }

    setIsEditOpen(true);
    setIsLoadingTriggerDetail(true);

    try {
      // Fetch trigger details from API
      const response = await getWorkflowTrigger(workspaceId, workflowId, defaultTrigger.id);
      
      if (response.status === 'success' && response.data) {
        const triggerDetail = response.data;
        console.log('Trigger detail loaded:', triggerDetail);
        
        const inputMapping = triggerDetail.input_mapping || {};
        
        // Parse input_mapping - API returns {type, value} format
        const types: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'> = {};
        const parsedMapping: Record<string, { type: string; value: any }> = {};
        
        Object.entries(inputMapping).forEach(([key, mappingValue]) => {
          // Check if it's already in {type, value} format
          if (mappingValue && typeof mappingValue === 'object' && 'type' in mappingValue && 'value' in mappingValue) {
            const mappingType = String(mappingValue.type) as 'string' | 'number' | 'boolean' | 'object' | 'array';
            types[key] = mappingType;
            parsedMapping[key] = {
              type: String(mappingValue.type),
              value: mappingValue.value,
            };
          } else {
            // Legacy format - detect type from value
            let detectedType: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string';
            if (typeof mappingValue === 'number') {
              detectedType = 'number';
            } else if (typeof mappingValue === 'boolean') {
              detectedType = 'boolean';
            } else if (Array.isArray(mappingValue)) {
              detectedType = 'array';
            } else if (typeof mappingValue === 'object' && mappingValue !== null) {
              detectedType = 'object';
            } else if (typeof mappingValue === 'string') {
              // Try to detect if it's JSON
              try {
                const parsed = JSON.parse(mappingValue);
                if (Array.isArray(parsed)) {
                  detectedType = 'array';
                } else if (typeof parsed === 'object' && parsed !== null) {
                  detectedType = 'object';
                }
              } catch {
                detectedType = 'string';
              }
            }
            
            types[key] = detectedType;
            parsedMapping[key] = {
              type: detectedType,
              value: mappingValue,
            };
          }
        });
        
        console.log('Parsed mapping:', parsedMapping);
        console.log('Types:', types);
        
        setInputMappingTypes(types);
        setEditForm({
          name: triggerDetail.name || '',
          description: triggerDetail.description || '',
          trigger_type: triggerDetail.trigger_type || '',
          config: triggerDetail.config || {},
          input_mapping: parsedMapping,
        });
        
        // Notify parent about trigger data change
        if (onTriggerDataChange) {
          onTriggerDataChange({
            input_mapping: triggerDetail.input_mapping || {},
          });
        }
      }
    } catch (err) {
      console.error('Failed to load trigger details:', err);
      toast({
        title: 'Warning',
        description: err instanceof Error ? err.message : 'Failed to load trigger details. Using cached data.',
        variant: 'default',
      });
      
      // Fallback to defaultTrigger data
      if (defaultTrigger) {
        const triggerWithMapping = defaultTrigger as Trigger & { input_mapping?: Record<string, any> };
        const inputMapping = triggerWithMapping.input_mapping || {};
        
        const types: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'> = {};
        const parsedMapping: Record<string, { type: string; value: any }> = {};
        
        Object.entries(inputMapping).forEach(([key, mappingValue]) => {
          if (mappingValue && typeof mappingValue === 'object' && 'type' in mappingValue && 'value' in mappingValue) {
            types[key] = mappingValue.type as 'string' | 'number' | 'boolean' | 'object' | 'array';
            parsedMapping[key] = {
              type: mappingValue.type,
              value: mappingValue.value,
            };
          }
        });
        
        setInputMappingTypes(types);
        setEditForm({
          name: defaultTrigger.name || '',
          description: defaultTrigger.description || '',
          trigger_type: defaultTrigger.trigger_type || '',
          config: defaultTrigger.config || {},
          input_mapping: parsedMapping,
        });
      }
    } finally {
      setIsLoadingTriggerDetail(false);
    }
  };

  const handleSave = async () => {
    if (!workspaceId || !workflowId || !defaultTrigger?.id) {
      toast({
        title: 'Error',
        description: 'Missing required information to update trigger',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Only send fields that have values
      const updateData: UpdateTriggerData = {};
      if (editForm.name) updateData.name = editForm.name;
      if (editForm.description) updateData.description = editForm.description;
      if (editForm.trigger_type) updateData.trigger_type = editForm.trigger_type;
      if (editForm.config && Object.keys(editForm.config).length > 0) updateData.config = editForm.config;
      
      // Format input_mapping to API format: {key: {type, value}}
      // Always send input_mapping, even if empty
      const formattedMapping: Record<string, { type: string; value: any }> = {};
      if (editForm.input_mapping && Object.keys(editForm.input_mapping).length > 0) {
        Object.entries(editForm.input_mapping).forEach(([key, mappingData]) => {
          // Check if it's already in correct format
          if (mappingData && typeof mappingData === 'object' && 'type' in mappingData && 'value' in mappingData) {
            formattedMapping[key] = {
              type: mappingData.type,
              value: mappingData.value,
            };
          } else {
            // Convert to correct format
            const type = inputMappingTypes[key] || 'string';
            formattedMapping[key] = {
              type: type,
              value: mappingData,
            };
          }
        });
      }
      // Always send input_mapping, even if empty (to clear it on the server)
      updateData.input_mapping = formattedMapping;

      await updateWorkflowTrigger(workspaceId, workflowId, defaultTrigger.id, updateData);
      
      toast({
        title: 'Success',
        description: 'Trigger updated successfully',
      });

      // Refresh trigger data
      const response = await getWorkflowTriggers(workspaceId, workflowId);
      if (response.status === 'success' && response.data) {
        const triggers = response.data.triggers || [];
        const trigger = triggers.length > 0 ? triggers[0] : null;
        setDefaultTrigger(trigger);
        
        // Notify parent about trigger data change
        if (onTriggerDataChange) {
          const triggerWithMapping = trigger as Trigger & { input_mapping?: Record<string, any> };
          onTriggerDataChange({
            input_mapping: triggerWithMapping.input_mapping || {},
          });
        }
        
        // If edit panel is still open, reinitialize form with updated data
        if (trigger && isEditOpen) {
          const triggerWithMapping = trigger as Trigger & { input_mapping?: Record<string, any> };
          const inputMapping = triggerWithMapping.input_mapping || {};
          
          // Parse input_mapping - API returns {type, value} format
          const types: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'> = {};
          const parsedMapping: Record<string, { type: string; value: any }> = {};
          
          Object.entries(inputMapping).forEach(([key, mappingValue]) => {
            // Check if it's already in {type, value} format
            if (mappingValue && typeof mappingValue === 'object' && 'type' in mappingValue && 'value' in mappingValue) {
              types[key] = mappingValue.type as 'string' | 'number' | 'boolean' | 'object' | 'array';
              parsedMapping[key] = {
                type: mappingValue.type,
                value: mappingValue.value,
              };
            } else {
              // Legacy format - detect type from value
              let detectedType: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string';
              if (typeof mappingValue === 'number') {
                detectedType = 'number';
              } else if (typeof mappingValue === 'boolean') {
                detectedType = 'boolean';
              } else if (Array.isArray(mappingValue)) {
                detectedType = 'array';
              } else if (typeof mappingValue === 'object' && mappingValue !== null) {
                detectedType = 'object';
              } else if (typeof mappingValue === 'string') {
                // Try to detect if it's JSON
                try {
                  const parsed = JSON.parse(mappingValue);
                  if (Array.isArray(parsed)) {
                    detectedType = 'array';
                  } else if (typeof parsed === 'object' && parsed !== null) {
                    detectedType = 'object';
                  }
                } catch {
                  detectedType = 'string';
                }
              }
              
              types[key] = detectedType;
              parsedMapping[key] = {
                type: detectedType,
                value: mappingValue,
              };
            }
          });
          
          setInputMappingTypes(types);
          setEditForm({
            name: trigger.name || '',
            description: trigger.description || '',
            trigger_type: trigger.trigger_type || '',
            config: trigger.config || {},
            input_mapping: parsedMapping,
          });
        }
      }

      setIsEditOpen(false);
    } catch (err) {
      console.error('Failed to update trigger:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update trigger',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  const handleInputMappingChange = (key: string, value: any) => {
    const type = inputMappingTypes[key] || 'string';
    setEditForm(prev => ({
      ...prev,
      input_mapping: {
        ...prev.input_mapping,
        [key]: {
          type: type,
          value: value,
        },
      },
    }));
  };

  const handleAddInputMapping = () => {
    const newKey = `param_${Date.now()}`;
    setInputMappingTypes(prev => ({
      ...prev,
      [newKey]: 'string',
    }));
    setEditForm(prev => ({
      ...prev,
      input_mapping: {
        ...prev.input_mapping,
        [newKey]: {
          type: 'string',
          value: '',
        },
      },
    }));
  };

  const handleInputMappingTypeChange = (key: string, type: 'string' | 'number' | 'boolean' | 'object' | 'array') => {
    setInputMappingTypes(prev => ({
      ...prev,
      [key]: type,
    }));
    
    // Reset value based on type
    let defaultValue: any = '';
    if (type === 'number') {
      defaultValue = 0;
    } else if (type === 'boolean') {
      defaultValue = false;
    } else if (type === 'object') {
      defaultValue = {};
    } else if (type === 'array') {
      defaultValue = [];
    }
    
    // Update the mapping with new type
    setEditForm(prev => ({
      ...prev,
      input_mapping: {
        ...prev.input_mapping,
        [key]: {
          type: type,
          value: defaultValue,
        },
      },
    }));
  };

  const handleRemoveInputMapping = (key: string) => {
    setEditForm(prev => {
      const newMapping = { ...prev.input_mapping };
      delete newMapping[key];
      return {
        ...prev,
        input_mapping: newMapping,
      };
    });
  };

  const handleInputMappingKeyChange = (oldKey: string, newKey: string) => {
    if (newKey === oldKey || !newKey.trim()) return;
    
    const currentType = inputMappingTypes[oldKey];
    const currentMapping = editForm.input_mapping?.[oldKey];
    
    setInputMappingTypes(prev => {
      const newTypes = { ...prev };
      if (currentType) {
        newTypes[newKey] = currentType;
      }
      delete newTypes[oldKey];
      return newTypes;
    });
    
    setEditForm(prev => {
      const newMapping = { ...prev.input_mapping };
      delete newMapping[oldKey];
      if (currentMapping !== undefined) {
        newMapping[newKey] = currentMapping;
      }
      return {
        ...prev,
        input_mapping: newMapping,
      };
    });
  };

  const handleInputMappingValueChange = (key: string, rawValue: string) => {
    const type = inputMappingTypes[key] || 'string';
    let parsedValue: any = rawValue;
    
    try {
      if (type === 'number') {
        parsedValue = rawValue === '' ? 0 : parseFloat(rawValue);
        if (isNaN(parsedValue)) {
          parsedValue = 0;
        }
      } else if (type === 'boolean') {
        parsedValue = rawValue === 'true' || rawValue === '1';
      } else if (type === 'object' || type === 'array') {
        parsedValue = rawValue === '' ? (type === 'array' ? [] : {}) : JSON.parse(rawValue);
      } else {
        parsedValue = rawValue;
      }
    } catch (error) {
      // If JSON parsing fails, keep as string for object/array types
      if (type === 'object' || type === 'array') {
        parsedValue = type === 'array' ? [] : {};
      }
    }
    
    handleInputMappingChange(key, parsedValue);
  };

  const getInputMappingValueDisplay = (key: string, mappingData: any): string => {
    // Extract value from {type, value} format
    const value = mappingData && typeof mappingData === 'object' && 'value' in mappingData 
      ? mappingData.value 
      : mappingData;
    
    const type = inputMappingTypes[key] || 'string';
    
    if (type === 'object' || type === 'array') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '';
      }
    } else if (type === 'boolean') {
      return String(value);
    } else {
      return String(value || '');
    }
  };

  const getInputMappingValue = (key: string, mappingData: any): any => {
    // Extract value from {type, value} format
    if (mappingData && typeof mappingData === 'object' && 'value' in mappingData) {
      return mappingData.value;
    }
    return mappingData;
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg shadow-md overflow-hidden border-2 border-border">
        <div className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-32 mb-2 animate-pulse" />
              <div className="h-3 bg-muted rounded w-48 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-lg shadow-md overflow-hidden border-2 border-destructive/20">
        <div className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Error Loading Trigger</h3>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!defaultTrigger) {
    return null;
  }

  return (
    <>
      <div className="bg-surface rounded-lg shadow-md overflow-hidden transition-all duration-200 border-2 border-primary/50 hover:border-primary hover:shadow-lg">
        {/* Header */}
        <div className="px-5 py-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="text-xs">
                    Default Trigger
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-xs text-success font-medium">Available</span>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground truncate">{defaultTrigger.name}</h3>
                {defaultTrigger.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {defaultTrigger.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0 flex-shrink-0"
              title="Edit Trigger"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="px-5 py-3 border-t border-border bg-surface/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Trigger Type:</span>
            <Badge variant="secondary" className="text-xs">
              {defaultTrigger.trigger_type}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            {defaultTrigger.is_enabled ? (
              <Badge variant="default" className="text-xs bg-success/10 text-success border-success/20">
                Enabled
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Disabled
              </Badge>
            )}
          </div>
          {defaultTrigger.id && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">ID:</span>
              <span className="text-xs text-foreground font-mono">{defaultTrigger.id}</span>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Edit Panel */}
      {isEditOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsEditOpen(false)}
          />
          
          {/* Panel */}
          <div 
            className="fixed right-0 top-0 h-full w-[350px] bg-surface border-l border-border z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Edit Trigger</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Update trigger configuration
                </p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="h-6 w-6 flex items-center justify-center hover:bg-accent/50 rounded transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLoadingTriggerDetail ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Loading trigger details...</p>
                  </div>
                </div>
              ) : (
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Name
                  </label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Trigger name"
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Trigger description"
                    rows={3}
                    className="w-full px-3 py-2 rounded bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {/* Trigger Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Trigger Type
                  </label>
                  <select
                    value={editForm.trigger_type || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, trigger_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select trigger type...</option>
                    <option value="WEBHOOK">WEBHOOK</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="MANUAL">MANUAL</option>
                  </select>
                </div>

                {/* Config Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Configuration
                  </label>
                  <div className="space-y-3 p-3 bg-background rounded border border-input">
                    {/* Cron Expression (for SCHEDULED triggers) */}
                    {editForm.trigger_type === 'SCHEDULED' && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Cron Expression
                        </label>
                        <Input
                          value={editForm.config?.cron_expression || ''}
                          onChange={(e) => handleConfigChange('cron_expression', e.target.value)}
                          placeholder="0 0 * * *"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Example: 0 0 * * * (runs daily at midnight)
                        </p>
                      </div>
                    )}

                    {/* Other config fields can be added here */}
                    {Object.entries(editForm.config || {}).map(([key, value]) => {
                      if (key === 'cron_expression' && editForm.trigger_type === 'SCHEDULED') {
                        return null; // Already shown above
                      }
                      return (
                        <div key={key} className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            {key}
                          </label>
                          <Input
                            value={String(value || '')}
                            onChange={(e) => handleConfigChange(key, e.target.value)}
                            placeholder={`Enter ${key}`}
                            className="w-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Input Mapping Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Input Mapping
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddInputMapping}
                      className="h-7 px-2 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Parameter
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Define input parameters and their default values
                  </p>
                  <div className="space-y-3 p-3 bg-background rounded border border-input">
                    {Object.keys(editForm.input_mapping || {}).length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No input mappings defined
                      </p>
                    ) : (
                      Object.entries(editForm.input_mapping || {}).map(([key, mappingData]) => {
                        // Get type from mappingData if available, otherwise from inputMappingTypes
                        const paramType = (mappingData && typeof mappingData === 'object' && 'type' in mappingData)
                          ? (mappingData.type as 'string' | 'number' | 'boolean' | 'object' | 'array')
                          : (inputMappingTypes[key] || 'string');
                        return (
                          <div key={key} className="space-y-2 p-3 bg-surface rounded border border-border">
                            <div className="flex items-center gap-2">
                              <Input
                                value={key}
                                onChange={(e) => handleInputMappingKeyChange(key, e.target.value)}
                                placeholder="Parameter name"
                                className="flex-1 text-xs font-medium"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleRemoveInputMapping(key);
                                  setInputMappingTypes(prev => {
                                    const newTypes = { ...prev };
                                    delete newTypes[key];
                                    return newTypes;
                                  });
                                }}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive flex-shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            
                            {/* Type Selector */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Type</label>
                              <select
                                value={paramType}
                                onChange={(e) => {
                                  const newType = e.target.value as 'string' | 'number' | 'boolean' | 'object' | 'array';
                                  handleInputMappingTypeChange(key, newType);
                                  // Update inputMappingTypes state
                                  setInputMappingTypes(prev => ({
                                    ...prev,
                                    [key]: newType,
                                  }));
                                }}
                                className="w-full px-2 py-1.5 rounded bg-background border border-input text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="object">Object (JSON)</option>
                                <option value="array">Array (JSON)</option>
                              </select>
                            </div>

                            {/* Value Input */}
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">Value</label>
                              {(() => {
                                const actualValue = getInputMappingValue(key, mappingData);
                                return paramType === 'boolean' ? (
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={actualValue === true || actualValue === 'true' || actualValue === 1}
                                        onChange={(e) => handleInputMappingValueChange(key, String(e.target.checked))}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-accent rounded-full peer peer-checked:bg-primary transition-colors"></div>
                                      <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full transition-transform peer-checked:translate-x-5"></div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {actualValue === true || actualValue === 'true' || actualValue === 1 ? 'True' : 'False'}
                                    </span>
                                  </label>
                                ) : paramType === 'object' || paramType === 'array' ? (
                                  <textarea
                                    value={getInputMappingValueDisplay(key, mappingData)}
                                    onChange={(e) => handleInputMappingValueChange(key, e.target.value)}
                                    placeholder={paramType === 'array' ? '["item1", "item2"]' : '{"key": "value"}'}
                                    rows={4}
                                    className="w-full px-2 py-1.5 rounded bg-background border border-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
                                  />
                                ) : (
                                  <Input
                                    type={paramType === 'number' ? 'number' : 'text'}
                                    value={getInputMappingValueDisplay(key, mappingData)}
                                    onChange={(e) => handleInputMappingValueChange(key, e.target.value)}
                                    placeholder={paramType === 'number' ? 'Enter a number' : 'Enter a string'}
                                    className="w-full text-xs"
                                  />
                                );
                              })()}
                              <p className="text-xs text-muted-foreground">
                                {paramType === 'object' && 'Enter a valid JSON object'}
                                {paramType === 'array' && 'Enter a valid JSON array'}
                                {paramType === 'number' && 'Enter a numeric value'}
                                {paramType === 'boolean' && 'Toggle true/false'}
                                {paramType === 'string' && 'Enter a text value'}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border">
              <Button
                variant="default"
                className="w-full"
                onClick={handleSave}
                disabled={isSaving}
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
        </>,
        document.body
      )}
    </>
  );
};

