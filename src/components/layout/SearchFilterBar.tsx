import { ReactNode, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { Search, Plus } from 'lucide-react';

interface SearchFilterBarProps {
  onSearch?: (value: string) => void;
  onFilterChange?: (value: string) => void;
  onCreateClick?: () => void;
  searchPlaceholder?: string;
  createButtonText?: string;
  filterOptions?: DropdownOption[];
  showFilter?: boolean;
  actions?: ReactNode;
}

export const SearchFilterBar = ({
  onSearch,
  onFilterChange,
  onCreateClick,
  searchPlaceholder = 'Search...',
  createButtonText = 'Create',
  filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],
  showFilter = true,
  actions,
}: SearchFilterBarProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [filterValue, setFilterValue] = useState('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleFilterChange = (value: string | string[]) => {
    const filterVal = value as string;
    setFilterValue(filterVal);
    onFilterChange?.(filterVal);
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Search & Filter - Left Side */}
      <div className="flex items-center gap-2 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="h-10 pl-9"
          />
        </div>
        
        {showFilter && (
          <div className="w-48">
            <Dropdown
              options={filterOptions}
              value={filterValue}
              onChange={handleFilterChange}
              placeholder="Filter..."
            />
          </div>
        )}
      </div>

      {/* Actions - Right Side */}
      <div className="flex items-center gap-2">
        {actions}
        {onCreateClick && (
          <Button variant="primary" size="md" onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            {createButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};
