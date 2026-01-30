import { useState, useMemo } from 'react';
import { FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NodeItem } from './NodeGrid';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface GlobalNodeListProps {
  nodes: NodeItem[];
  onDocumentation?: (node: NodeItem) => void;
  buttonLabel?: string;
}

export const GlobalNodeList = ({
  nodes,
  onDocumentation,
  buttonLabel = 'Details',
}: GlobalNodeListProps) => {
  const grouped = useMemo(() => nodes.reduce((acc, node) => {
    const cat = node.category;
    const sub = node.subcategory || 'General';
    if (!acc[cat]) acc[cat] = {};
    if (!acc[cat][sub]) acc[cat][sub] = [];
    acc[cat][sub].push(node);
    return acc;
  }, {} as Record<string, Record<string, NodeItem[]>>), [nodes]);

  const categoryKeys = Object.keys(grouped);
  const [openCategory, setOpenCategory] = useState<string | null>(() => categoryKeys[0] ?? null);

  return (
    <div className="space-y-4">
      {categoryKeys.map((category) => {
        const isOpen = openCategory === category;
        const subcategories = grouped[category];
        const nodeCount = Object.values(subcategories).flat().length;

        return (
          <Collapsible
            key={category}
            open={isOpen}
            onOpenChange={(open) => setOpenCategory(open ? category : null)}
            className="rounded-xl border border-border/50 bg-background/30 overflow-hidden"
          >
            <CollapsibleTrigger className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 focus:bg-muted/40 focus:outline-none transition-colors data-[state=open]:border-b data-[state=open]:border-border/40">
              <span
                className={cn(
                  'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200',
                  isOpen ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                <ChevronDown
                  className={cn('w-4 h-4', !isOpen && 'rotate-[-90deg]')}
                  aria-hidden
                />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                {category}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {nodeCount} node{nodeCount !== 1 ? 's' : ''}
              </span>
              <span className="h-px flex-1 max-w-16 bg-gradient-to-r from-border/80 to-transparent rounded-full" />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="space-y-1 border-t border-border/40">
                {Object.entries(subcategories).map(([subcategory, items]) => (
                  <div key={`${category}-${subcategory}`}>
                    {subcategory !== 'General' && (
                      <div className="px-4 py-2 bg-muted/30 border-b border-border/40">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {subcategory}
                        </span>
                      </div>
                    )}
                    <ul className="divide-y divide-border/40">
                      {items.map((node) => {
                        const Icon = node.icon;
                        return (
                          <li key={node.id}>
                            <button
                              type="button"
                              onClick={() => onDocumentation?.(node)}
                              className={cn(
                                'w-full flex items-center gap-4 px-4 py-3.5 text-left',
                                'transition-all duration-200 ease-out',
                                'hover:bg-primary/5 focus:bg-primary/5 focus:outline-none',
                                'group border-l-2 border-l-transparent hover:border-l-primary'
                              )}
                            >
                              <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_hsl(var(--primary)/0.25)] transition-all duration-200">
                                <Icon className="w-4 h-4" />
                              </span>
                              <div className="flex-1 min-w-0 pr-4">
                                <span className="block text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {node.name}
                                </span>
                                <span className="block text-xs text-muted-foreground truncate mt-0.5">
                                  {node.description}
                                </span>
                              </div>
                              {onDocumentation && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                                  <FileText className="w-3.5 h-3.5" />
                                  {buttonLabel}
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};
