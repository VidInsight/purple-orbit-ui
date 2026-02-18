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
      <div className="min-h-screen relative overflow-hidden">
        {/* Global glass / glow background - subtle white + brand colors */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
        </div>

        <div className="container mx-auto max-w-[1600px] w-full min-w-0 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-10 overflow-x-auto space-y-4 sm:space-y-6">
          <PageHeader
            title={pageTitle}
            description={pageDescription}
            actions={headerActions}
          />

          <div className="relative z-20">
            <SearchFilterBar
              searchPlaceholder={searchPlaceholder}
              createButtonText={createButtonText}
              filterOptions={filterOptions}
              showFilter={!!filterOptions}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              onCreateClick={onCreate}
            />
          </div>

          <div className="relative">
            {/* Background gradient effect behind table */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-primary/10 to-slate-900 opacity-80 blur-3xl -z-10" />

            {/* Main content glass card */}
            <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-slate-950/80 shadow-2xl shadow-black/70 backdrop-blur-3xl p-4 sm:p-5 transition-all duration-300   min-w-0 overflow-x-auto">
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
            </div>
          </div>

          {filteredItems.length > 0 && (
            <div className="min-w-0 overflow-x-auto">
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-slate-950/80 shadow-xl shadow-black/70 backdrop-blur-2xl p-2 sm:p-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredItems.length}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
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
      </div>
    </PageLayout>
  );
}
