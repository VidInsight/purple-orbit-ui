import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, CheckCircle2, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExpiringCredential {
  id: string;
  name: string;
  service: string;
  daysUntilExpiry: number;
}

interface ExpiringCredentialsAlertProps {
  credentials: ExpiringCredential[];
}

export const ExpiringCredentialsAlert = ({ credentials }: ExpiringCredentialsAlertProps) => {
  const navigate = useNavigate();

  const getExpiryColor = (days: number) => {
    if (days < 7) return 'text-destructive';
    if (days < 14) return 'text-warning';
    return 'text-warning';
  };

  const getExpiryBg = (days: number) => {
    if (days < 7) return 'bg-destructive/10 border-destructive/30';
    if (days < 14) return 'bg-warning/10 border-warning/30';
    return 'bg-warning/10 border-warning/30';
  };

  if (credentials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Credentials Status
          </CardTitle>
          <CardDescription>All credentials are up to date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <span>No credentials require renewal at this time</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Expiring Credentials
        </CardTitle>
        <CardDescription>
          {credentials.length} credential{credentials.length > 1 ? 's' : ''} need{credentials.length === 1 ? 's' : ''} attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {credentials.map((credential) => (
            <div
              key={credential.id}
              className={`p-3 rounded-lg border ${getExpiryBg(credential.daysUntilExpiry)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded bg-surface">
                    <Key className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {credential.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{credential.service}</div>
                    <div className={`text-xs font-medium mt-1 ${getExpiryColor(credential.daysUntilExpiry)}`}>
                      Expires in {credential.daysUntilExpiry} day{credential.daysUntilExpiry !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/credentials')}
                  className="shrink-0"
                >
                  Renew
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
