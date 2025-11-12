import { useState } from 'react';
import { NodeLibrary } from './NodeLibrary';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { WorkflowNode, NodeTemplate } from '@/types/workflow';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidePanelProps {
  selectedNode: WorkflowNode | null;
  onNodeUpdate: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeDragStart: (nodeType: NodeTemplate) => void;
}

export const SidePanel = ({
  selectedNode,
  onNodeUpdate,
  onNodeDelete,
  onNodeDragStart,
}: SidePanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'properties'>('library');

  return (
    <div
      className={cn(
        'relative bg-surface border-l border-border transition-all duration-300',
        isCollapsed ? 'w-0' : 'w-80'
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          'absolute -left-3 top-4 h-6 w-6 rounded-full border border-border bg-surface',
          'flex items-center justify-center hover:bg-accent transition-colors z-10',
          'shadow-md'
        )}
      >
        <ChevronRight
          className={cn(
            'h-4 w-4 text-foreground transition-transform',
            !isCollapsed && 'rotate-180'
          )}
        />
      </button>

      {!isCollapsed && (
        <div className="h-full flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('library')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'library'
                  ? 'text-foreground border-b-2 border-primary bg-accent/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
              )}
            >
              Library
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'properties'
                  ? 'text-foreground border-b-2 border-primary bg-accent/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
              )}
              disabled={!selectedNode}
            >
              Properties
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'library' && (
              <NodeLibrary onNodeDragStart={onNodeDragStart} />
            )}
            {activeTab === 'properties' && selectedNode && (
              <NodePropertiesPanel
                node={selectedNode}
                onUpdate={onNodeUpdate}
                onDelete={onNodeDelete}
              />
            )}
            {activeTab === 'properties' && !selectedNode && (
              <div className="h-full flex items-center justify-center p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Select a node to view its properties
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
