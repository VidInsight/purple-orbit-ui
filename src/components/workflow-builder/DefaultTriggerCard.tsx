import { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Loader2, AlertCircle, Edit2, X } from 'lucide-react';
import { getWorkflowTriggers, updateWorkflowTrigger, Trigger, UpdateTriggerData } from '@/services/workflowApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface DefaultTriggerCardProps {
  workspaceId?: string;
  workflowId?: string;
}

export const DefaultTriggerCard = ({ workspaceId, workflowId }: DefaultTriggerCardProps) => {
  const [defaultTrigger, setDefaultTrigger] = useState<Trigger | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState<UpdateTriggerData>({
    name: '',
    description: '',
    trigger_type: '',
    config: {},
    input_mapping: {},
  });

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
        } else {
          setDefaultTrigger(null);
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
  useEffect(() => {
    if (defaultTrigger && isEditOpen) {
      setEditForm({
        name: defaultTrigger.name || '',
        description: defaultTrigger.description || '',
        trigger_type: defaultTrigger.trigger_type || '',
        config: defaultTrigger.config || {},
        input_mapping: {},
      });
    }
  }, [defaultTrigger, isEditOpen]);

  const handleEdit = () => {
    setIsEditOpen(true);
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
      if (editForm.input_mapping && Object.keys(editForm.input_mapping).length > 0) updateData.input_mapping = editForm.input_mapping;

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
      {isEditOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsEditOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-[350px] bg-surface border-l border-border z-50 animate-slide-in-right flex flex-col">
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
              </div>
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
        </>
      )}
    </>
  );
};

