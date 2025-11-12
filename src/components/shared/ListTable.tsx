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
      <div className="hidden md:block bg-surface rounded-lg border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground">{item.id}</p>
                <p className="text-base font-medium text-foreground">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              {hasActions && (
                <div className="flex items-center gap-2 ml-4">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(item)}
                      aria-label="View details"
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
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-surface rounded-lg border border-border p-4 space-y-3"
          >
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{item.id}</p>
              <p className="text-base font-medium text-foreground">{item.name}</p>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
            {hasActions && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {onView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onView(item)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
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
