import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Share2 } from 'lucide-react';

interface ListTableProps<T> {
  items: T[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onShare?: (item: T) => void;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function ListTable<T extends { id: string; name: string; description?: string }>({
  items,
  onView,
  onEdit,
  onDelete,
  onShare,
  isLoading = false,
  error,
  emptyMessage = 'No items found',
  emptyDescription = 'Get started by creating your first item.',
}: ListTableProps<T>) {
  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-solid border-transparent border-r-primary/40" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="mt-6 text-sm font-medium text-muted-foreground">Loading items...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-destructive font-semibold text-base">{error}</p>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-full bg-muted/50 p-6 mb-6">
          <svg className="h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-foreground font-semibold text-lg mb-2">{emptyMessage}</p>
        <p className="text-muted-foreground text-sm text-center max-w-md">{emptyDescription}</p>
      </div>
    );
  }

  const hasActions = onView || onEdit || onDelete || onShare;

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative flex items-center justify-between px-6 py-4 rounded-xl border border-border/50 bg-gradient-to-r from-surface/50 to-surface/30 hover:from-surface/70 hover:to-surface/50 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 ease-out"
          >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-primary/0 transition-all duration-300 pointer-events-none" />
            
            <div className="relative flex-1 space-y-1.5 min-w-0">
              <p className="text-[10px] font-mono text-muted-foreground/40 tracking-wider uppercase">{item.id.substring(0, 8)}</p>
              <p className="text-base font-semibold text-foreground leading-tight truncate">{item.name}</p>
              {item.description && (
                <p className="text-sm text-muted-foreground/80 line-clamp-1 leading-relaxed">{item.description}</p>
              )}
            </div>
            {hasActions && (
              <div className="relative flex items-center gap-1 ml-6 opacity-60 group-hover:opacity-100 transition-all duration-300">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(item)}
                    aria-label="View details"
                    className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    aria-label="Edit"
                    className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </Button>
                )}
                {onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare(item)}
                    aria-label="Share"
                    className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Share2 className="h-4.5 w-4.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    aria-label="Delete"
                    className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative p-4 rounded-xl border border-border/50 bg-gradient-to-br from-surface/50 to-surface/30 hover:from-surface/70 hover:to-surface/50 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-mono text-muted-foreground/40 tracking-wider uppercase">{item.id.substring(0, 8)}</p>
              <p className="text-base font-semibold text-foreground leading-tight">{item.name}</p>
              {item.description && (
                <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-2">{item.description}</p>
              )}
            </div>
            {hasActions && (
              <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                {onView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onView(item)}
                    className="flex-1 h-9 text-xs font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="flex-1 h-9 text-xs font-medium"
                  >
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                )}
                {onShare && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onShare(item)}
                    className="flex-1 h-9 text-xs font-medium"
                  >
                    <Share2 className="h-4 w-4 mr-1.5" />
                    Share
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="flex-1 h-9 text-xs font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
