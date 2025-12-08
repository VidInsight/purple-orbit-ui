import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { UsageBar } from '@/components/billing/UsageBar';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuotaWarning {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

interface QuotaWarningsCardProps {
  quotas: QuotaWarning[];
}

export const QuotaWarningsCard = ({ quotas }: QuotaWarningsCardProps) => {
  const navigate = useNavigate();

  const warningQuotas = quotas.filter(q => {
    const percentage = (q.used / q.limit) * 100;
    return percentage >= 80;
  });

  const hasCriticalWarnings = warningQuotas.some(q => {
    const percentage = (q.used / q.limit) * 100;
    return percentage >= 90;
  });

  if (warningQuotas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Quota Status
          </CardTitle>
          <CardDescription>All quotas within safe limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <span>No quota warnings at this time</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={hasCriticalWarnings ? 'border-destructive/50' : 'border-warning/50'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${hasCriticalWarnings ? 'text-destructive' : 'text-warning'}`} />
          Quota Warnings
        </CardTitle>
        <CardDescription>
          {warningQuotas.length} quota{warningQuotas.length > 1 ? 's' : ''} near limit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {warningQuotas.map((quota, index) => (
            <UsageBar
              key={index}
              label={quota.label}
              used={quota.used}
              limit={quota.limit}
              unit={quota.unit}
            />
          ))}
          
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/billing')}
          >
            Upgrade Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
