import { ReactNode, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/button';
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
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl blur-2xl -z-10" />
      
      {/* Main container */}
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-5 bg-surface/60 backdrop-blur-xl rounded-2xl border border-border/60 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300">
        {/* Search & Filter - Left Side */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/70 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-11 h-12 bg-background/60 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
            />
          </div>
          
          {showFilter && (
            <div className="w-52 relative z-[100]">
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
        <div className="flex items-center gap-3">
          {actions}
          {onCreateClick && (
            <Button 
              variant="primary" 
              onClick={onCreateClick}
              className="h-12 px-6 font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              {createButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
