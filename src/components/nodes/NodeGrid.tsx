import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NodeItem {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  subcategory?: string;
}

interface NodeGridProps {
  nodes: NodeItem[];
  onDocumentation?: (node: NodeItem) => void;
  onEdit?: (node: NodeItem) => void;
  onDelete?: (node: NodeItem) => void;
  readOnly?: boolean;
  columns?: number;
}

export const NodeGrid = ({ 
  nodes, 
  onDocumentation, 
  onEdit, 
  onDelete,
  readOnly = false,
  columns = 2
}: NodeGridProps) => {
  // Group nodes by category and subcategory
  const groupedNodes = nodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = {};
    }
    const subcat = node.subcategory || 'General';
    if (!acc[node.category][subcat]) {
      acc[node.category][subcat] = [];
    }
    acc[node.category][subcat].push(node);
    return acc;
  }, {} as Record<string, Record<string, NodeItem[]>>);

  const gridCols = columns === 5 
    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
    : 'grid-cols-1 lg:grid-cols-2';

  return (
    <div className="space-y-8">
      {Object.entries(groupedNodes).map(([category, subcategories]) => (
        <div key={category}>
          {/* Category Header */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground">{category}</h2>
            <div className="h-0.5 w-12 bg-primary rounded-full mt-1.5"></div>
          </div>

          {/* Subcategories */}
          {Object.entries(subcategories).map(([subcategory, items]) => (
            <div key={`${category}-${subcategory}`} className="mb-6">
              {subcategory !== 'General' && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {subcategory}
                </h3>
              )}

              {/* Node Grid */}
              <div className={cn("grid gap-3", gridCols)}>
                {items.map((node) => (
                  <div
                    key={node.id}
                    className="group relative bg-surface border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Icon and Actions */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:shadow-glow-primary transition-all duration-300">
                        <node.icon className="h-5 w-5 text-primary" />
                      </div>

                      {/* Actions for Custom Nodes */}
                      {!readOnly && (onEdit || onDelete) && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(node)}
                              className="h-6 w-6 p-0"
                              aria-label="Edit node"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(node)}
                              className="h-6 w-6 p-0 hover:text-destructive"
                              aria-label="Delete node"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Name & Description */}
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {node.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    {/* Documentation Button */}
                    {onDocumentation && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onDocumentation(node)}
                        className="w-full h-7 text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Docs
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
