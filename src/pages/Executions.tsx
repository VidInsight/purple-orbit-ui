import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchFilterBar } from '@/components/layout/SearchFilterBar';

const Executions = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Executions"
          description="View execution history and logs"
        />

        <SearchFilterBar
          searchPlaceholder="Search executions..."
          showFilter={true}
          filterOptions={[
            { value: 'all', label: 'All Executions' },
            { value: 'success', label: 'Success' },
            { value: 'failed', label: 'Failed' },
            { value: 'running', label: 'Running' },
          ]}
          onSearch={(value) => console.log('Search:', value)}
          onFilterChange={(value) => console.log('Filter:', value)}
        />

        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No executions yet. Your workflow runs will appear here.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Executions;
