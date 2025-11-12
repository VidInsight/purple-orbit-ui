import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageBar } from '@/components/billing/UsageBar';

export const QuotasWidget = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage & Quotas</CardTitle>
        <CardDescription>Current usage limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <UsageBar
          label="Workflows"
          used={45}
          limit={100}
        />
        
        <UsageBar
          label="Executions"
          used={2840}
          limit={5000}
        />
        
        <UsageBar
          label="Storage"
          used={2.4}
          limit={10}
          unit="GB"
        />
      </CardContent>
    </Card>
  );
};
