import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchFilterBar } from '@/components/layout/SearchFilterBar';

const Databases = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Databases"
          description="Connect and manage database connections"
        />

        <SearchFilterBar
          searchPlaceholder="Search databases..."
          createButtonText="Add Database"
          onCreateClick={() => console.log('Add database')}
          onSearch={(value) => console.log('Search:', value)}
        />

        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No database connections yet. Connect to your databases for automation workflows.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Databases;
