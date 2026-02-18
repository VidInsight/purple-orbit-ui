import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Execution {
  id: string;
  workflow_name: string;
  status: 'COMPLETED' | 'FAILED' | 'RUNNING' | 'CANCELLED';
  started_at: string;
}

interface RecentExecutionsListProps {
  executions: Execution[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case 'FAILED':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'RUNNING':
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export const RecentExecutionsList = ({ executions }: RecentExecutionsListProps) => {
  const navigate = useNavigate();

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-md dark:border-white/10 dark:bg-white/6 dark:backdrop-blur-xl dark:shadow-lg dark:shadow-black/40 hover:border-primary/60 hover:shadow-primary/20 dark:hover:bg-white/10 dark:hover:shadow-primary/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Son Çalıştırmalar</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/executions')}>
          Tümünü Gör
        </Button>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Henüz çalıştırma yok
          </p>
        ) : (
          <div className="space-y-2">
            {executions.slice(0, 5).map((execution) => (
              <div
                key={execution.id}
                onClick={() => navigate(`/executions/${execution.id}`)}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group shadow-sm hover:shadow-primary/25 dark:border-white/8 dark:bg-white/5 dark:hover:bg-primary/10"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(execution.status)}
                  <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {execution.workflow_name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(execution.started_at), { addSuffix: true, locale: tr })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
