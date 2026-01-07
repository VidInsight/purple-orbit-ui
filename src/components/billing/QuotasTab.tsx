import { CurrentSubscription } from '@/types/billing';
import { UsageBar } from './UsageBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuotasTabProps {
  subscription: CurrentSubscription;
}

export const QuotasTab = ({ subscription }: QuotasTabProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage & Quotas</CardTitle>
        <CardDescription>
          Current billing period: {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <UsageBar
          label="Members"
          used={subscription.usage.members.used}
          limit={subscription.usage.members.limit}
        />
        
        <UsageBar
          label="Workflows"
          used={subscription.usage.workflows.used}
          limit={subscription.usage.workflows.limit}
        />
        
        <UsageBar
          label="Executions"
          used={subscription.usage.executions.used}
          limit={subscription.usage.executions.limit}
        />
        
        <UsageBar
          label="Storage"
          used={subscription.usage.storage.used}
          limit={subscription.usage.storage.limit}
          unit="GB"
        />
      </CardContent>
    </Card>
  );
};
