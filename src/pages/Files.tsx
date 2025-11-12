import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchFilterBar } from '@/components/layout/SearchFilterBar';

const Files = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Files"
          description="Manage files and assets for your workflows"
        />

        <SearchFilterBar
          searchPlaceholder="Search files..."
          createButtonText="Upload File"
          onCreateClick={() => console.log('Upload file')}
          onSearch={(value) => console.log('Search:', value)}
        />

        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No files uploaded yet. Upload files to use in your workflows.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Files;
