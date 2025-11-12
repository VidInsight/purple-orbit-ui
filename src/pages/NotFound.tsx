import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="mb-8 p-6 bg-surface rounded-lg border border-border">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Try checking the URL or navigate back to a known page.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Link to="/dashboard">
            <Button variant="primary">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Quick Links</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/workflows" className="text-xs text-primary hover:underline">
              Workflows
            </Link>
            <span className="text-xs text-muted-foreground">•</span>
            <Link to="/executions" className="text-xs text-primary hover:underline">
              Executions
            </Link>
            <span className="text-xs text-muted-foreground">•</span>
            <Link to="/credentials" className="text-xs text-primary hover:underline">
              Credentials
            </Link>
            <span className="text-xs text-muted-foreground">•</span>
            <Link to="/billing" className="text-xs text-primary hover:underline">
              Billing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
