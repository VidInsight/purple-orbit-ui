import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchFilterBar } from '@/components/layout/SearchFilterBar';

const Credentials = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Credentials"
          description="Manage authentication credentials for integrations"
        />

        <SearchFilterBar
          searchPlaceholder="Search credentials..."
          createButtonText="Add Credential"
          onCreateClick={() => console.log('Add credential')}
          onSearch={(value) => console.log('Search:', value)}
        />

        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No credentials configured. Add credentials to connect with external services.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Credentials;
