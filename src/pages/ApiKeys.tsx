import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchFilterBar } from '@/components/layout/SearchFilterBar';

const ApiKeys = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="API Keys"
          description="Manage API keys for external service access"
        />

        <SearchFilterBar
          searchPlaceholder="Search API keys..."
          createButtonText="Generate Key"
          onCreateClick={() => console.log('Generate key')}
          onSearch={(value) => console.log('Search:', value)}
        />

        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No API keys yet. Generate keys to access your workflows via API.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default ApiKeys;
