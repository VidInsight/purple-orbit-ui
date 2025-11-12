import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchFilterBar } from '@/components/layout/SearchFilterBar';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';

const Workflows = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <PageHeader
          title="Workflows"
          description="Manage and monitor your automation workflows"
          actions={
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          }
        />

        <SearchFilterBar
          searchPlaceholder="Search workflows..."
          createButtonText="New Workflow"
          onCreateClick={() => console.log('Create workflow')}
          onSearch={(value) => console.log('Search:', value)}
          onFilterChange={(value) => console.log('Filter:', value)}
        />

        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No workflows yet. Create your first automation workflow.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Workflows;
