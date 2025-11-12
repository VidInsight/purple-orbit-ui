import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColumnConfig } from '@/types/common';

interface ListTableProps<T> {
  items: T[];
  columns: ColumnConfig<T>[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function ListTable<T extends { id: string; name: string }>({
  items,
  columns,
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
                {hasActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-[30%]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-accent/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 text-sm text-foreground"
                    >
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] ?? '-')}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-surface rounded-lg border border-border p-4 space-y-3"
          >
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={String(column.key)} className="flex justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {column.label}
                  </span>
                  <span className="text-sm text-foreground">
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? '-')}
                  </span>
                </div>
              ))}
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
