import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchFilterBar } from '@/components/layout/SearchFilterBar';
import { ListTable } from './ListTable';
import { Pagination } from './Pagination';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { DropdownOption } from '@/components/ui/Dropdown';

interface ListPageTemplateProps<T extends { id: string; name: string; description?: string }> {
  pageTitle: string;
  pageDescription: string;
  items: T[];
  filterOptions?: DropdownOption[];
  searchPlaceholder?: string;
  createButtonText?: string;
  itemTypeName?: string;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  onCreate?: () => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => Promise<void>;
  headerActions?: React.ReactNode;
  itemsPerPage?: number;
}

export function ListPageTemplate<T extends { id: string; name: string; description?: string }>({
  pageTitle,
  pageDescription,
  items,
  filterOptions,
  searchPlaceholder = 'Search...',
  createButtonText = 'Create',
  itemTypeName = 'item',
  isLoading = false,
  error,
  emptyMessage,
  emptyDescription,
  onCreate,
  onView,
  onEdit,
  onDelete,
  headerActions,
  itemsPerPage = 30,
}: ListPageTemplateProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply search
    if (searchTerm) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter (you can customize this logic per page)
    if (filterValue !== 'all') {
      result = result.filter((item: any) => {
        if ('status' in item) {
          return item.status === filterValue;
        }
        return true;
      });
    }

    return result;
  }, [items, searchTerm, filterValue]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset to page 1 when search/filter changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      
      // Adjust page if needed
      const newTotalPages = Math.ceil((filteredItems.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title={pageTitle}
          description={pageDescription}
          actions={headerActions}
        />

        <SearchFilterBar
          searchPlaceholder={searchPlaceholder}
          createButtonText={createButtonText}
          filterOptions={filterOptions}
          showFilter={!!filterOptions}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onCreateClick={onCreate}
        />

        <ListTable
          items={paginatedItems}
          isLoading={isLoading}
          error={error}
          emptyMessage={emptyMessage}
          emptyDescription={emptyDescription}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete ? handleDeleteClick : undefined}
        />

        {filteredItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredItems.length}
            onPageChange={setCurrentPage}
          />
        )}

        {onDelete && (
          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            itemName={itemToDelete?.name || ''}
            itemType={itemTypeName}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </PageLayout>
  );
}
