import { Button } from '@/components/ui/Button';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface ListTableProps<T> {
  items: T[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
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

  const hasActions = onView || onEdit || onDelete;

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between px-5 py-4 border-b border-border hover:bg-accent/40 transition-colors"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-baseline gap-3">
                <p className="text-base font-semibold text-foreground">{item.name}</p>
                <p className="text-xs font-mono text-muted-foreground/50">{item.id}</p>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
              )}
            </div>
            {hasActions && (
              <div className="flex items-center gap-2 ml-6">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(item)}
                    aria-label="View details"
                    className="h-8 w-8 p-0"
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
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    aria-label="Delete"
                    className="h-8 w-8 p-0 hover:text-destructive"
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
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-border pb-4"
          >
            <div className="space-y-1 mb-3">
              <div className="flex items-baseline gap-2">
                <p className="text-base font-semibold text-foreground">{item.name}</p>
                <p className="text-xs font-mono text-muted-foreground/50">{item.id}</p>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
            {hasActions && (
              <div className="flex items-center gap-2">
                {onView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onView(item)}
                    className="flex-1 h-9 text-sm"
                  >
                    <Eye className="h-3.5 w-3.5 mr-2" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="flex-1 h-9 text-sm"
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="flex-1 h-9 text-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
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
