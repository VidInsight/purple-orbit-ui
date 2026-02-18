import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Server, Sparkles } from 'lucide-react';

const MCPServer = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-[1400px] w-full min-w-0 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-10 overflow-x-auto">
        <PageHeader
          title="MCP Server"
          description="MCP (Model Context Protocol) server management
"
        />

        <div className="relative mt-6 sm:mt-12 flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] w-full min-w-0 px-2">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl blur-3xl -z-10 max-w-2xl mx-auto" />

          <div className="relative flex flex-col items-center text-center w-full max-w-lg mx-auto p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl border border-border bg-card shadow-md hover:border-primary/60 hover:shadow-primary/20 transition-all duration-300 min-w-0 dark:border-white/10 dark:bg-white/8 dark:backdrop-blur-2xl dark:shadow-2xl dark:shadow-black/40 dark:hover:bg-white/12 dark:hover:shadow-primary/30">
            <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <Server className="h-14 w-14 text-primary mx-auto" strokeWidth={1.5} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Coming Soon
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-6">
            We are working on the management features for MCP (Model Context Protocol) servers. You will be able to add and configure MCP servers shortly.            </p>

            <div className="flex items-center gap-2 text-sm text-primary/80">
              <Sparkles className="h-4 w-4" />
              <span>To be added soon</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MCPServer;
