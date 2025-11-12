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
      <div className="hidden md:block space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative bg-surface rounded-lg border border-border overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex-1 space-y-1.5">
                <p className="text-xs font-mono text-muted-foreground/70">{item.id}</p>
                <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
              </div>
              {hasActions && (
                <div className="flex items-center gap-1.5 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(item)}
                      aria-label="View details"
                      className="hover:bg-primary/10 hover:text-primary"
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
                      className="hover:bg-primary/10 hover:text-primary"
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
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            {/* Accent line on hover */}
            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-primary/50 group-hover:w-full transition-all duration-300" />
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-surface rounded-lg border border-border p-4 space-y-3 transition-all duration-200 hover:shadow-lg hover:border-primary/30"
          >
            <div className="space-y-1.5">
              <p className="text-xs font-mono text-muted-foreground/70">{item.id}</p>
              <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{item.name}</p>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
            {hasActions && (
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                {onView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onView(item)}
                    className="flex-1 hover:bg-primary/10 hover:text-primary"
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
                    className="flex-1 hover:bg-primary/10 hover:text-primary"
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
