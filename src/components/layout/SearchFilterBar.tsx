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
      <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 bg-surface/60 backdrop-blur-xl rounded-2xl border border-border/60 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 min-w-0">
        {/* Search & Filter - Left Side */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0 overflow-hidden">
          <div className="relative flex-1 min-w-0 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-9 h-10 w-full min-w-0 bg-background/60 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
            />
          </div>
          
          {showFilter && (
            <div className="w-full sm:w-52 relative z-[100] min-w-0 shrink-0">
              <Dropdown
                options={filterOptions}
                value={filterValue}
                onChange={handleFilterChange}
                placeholder="Filter..."
              />
            </div>
          )}
        </div>

        {/* Actions - Right Side - shrink-0 so Add button is never hidden when sidebar is open */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          {actions}
          {onCreateClick && (
            <Button 
              variant="primary" 
              onClick={onCreateClick}
              className="h-10 px-4 sm:px-5 font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{createButtonText}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
