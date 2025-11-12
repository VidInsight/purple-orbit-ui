import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, GitPullRequest, AlertCircle, CheckCircle } from 'lucide-react';

interface Update {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: string;
}

const mockUpdates: Update[] = [
  {
    id: '1',
    type: 'success',
    title: 'Workflow Completed',
    message: 'Data Sync workflow completed successfully',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'info',
    title: 'New Feature',
    message: 'Advanced scheduling now available',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    type: 'warning',
    title: 'API Rate Limit',
    message: 'Approaching rate limit for external API',
    timestamp: '1 day ago',
  },
];

const getUpdateIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertCircle;
    default:
      return Bell;
  }
};

const getUpdateColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    default:
      return 'text-primary';
  }
};

export const UpdatesFeed = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Updates</CardTitle>
        <CardDescription>Recent activity and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockUpdates.map((update) => {
            const Icon = getUpdateIcon(update.type);
            const colorClass = getUpdateColor(update.type);
            
            return (
              <div key={update.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className={`mt-0.5 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{update.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{update.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{update.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
