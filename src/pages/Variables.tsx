import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchFilterBar } from '@/components/layout/SearchFilterBar';

const Variables = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Variables"
          description="Manage environment variables and constants"
        />

        <SearchFilterBar
          searchPlaceholder="Search variables..."
          createButtonText="Add Variable"
          onCreateClick={() => console.log('Add variable')}
          onSearch={(value) => console.log('Search:', value)}
        />

        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No variables yet. Add environment variables for your workflows.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Variables;
