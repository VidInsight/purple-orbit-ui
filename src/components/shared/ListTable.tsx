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
      <div className="bg-surface rounded-lg border border-border">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-surface rounded-lg border border-destructive">
        <div className="p-8 text-center">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border">
        <div className="p-8 text-center">
          <p className="text-foreground font-medium">{emptyMessage}</p>
          <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  const hasActions = onView || onEdit || onDelete || onShare;

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block space-y-1">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group flex items-center justify-between px-4 py-2.5 rounded border border-border/40 bg-surface/30 hover:bg-accent/40 hover:border-primary/30 transition-all duration-200"
          >
            <div className="flex-1 space-y-0">
              <p className="text-[9px] font-mono text-muted-foreground/50">{item.id}</p>
              <p className="text-sm font-medium text-foreground leading-tight">{item.name}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground/70 line-clamp-1 leading-tight">{item.description}</p>
              )}
            </div>
            {hasActions && (
              <div className="flex items-center gap-1 ml-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(item)}
                    aria-label="View details"
                    className="h-9 w-9 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    aria-label="Edit"
                    className="h-9 w-9 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare(item)}
                    aria-label="Share"
                    className="h-9 w-9 p-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    aria-label="Delete"
                    className="h-9 w-9 p-0 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded border border-border/40 bg-surface/30 hover:bg-accent/40 hover:border-primary/30 transition-all duration-200"
          >
            <div className="space-y-0 mb-2">
              <p className="text-[9px] font-mono text-muted-foreground/50">{item.id}</p>
              <p className="text-sm font-medium text-foreground leading-tight">{item.name}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground/70 leading-tight">{item.description}</p>
              )}
            </div>
            {hasActions && (
              <div className="flex items-center gap-1.5">
                {onView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onView(item)}
                    className="flex-1 h-9 text-xs"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="flex-1 h-9 text-xs"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {onShare && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onShare(item)}
                    className="flex-1 h-9 text-xs"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="flex-1 h-9 text-xs"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
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
