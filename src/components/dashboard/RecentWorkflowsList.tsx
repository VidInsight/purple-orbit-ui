import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'draft';
  updated_at: string;
}

interface RecentWorkflowsListProps {
  workflows: Workflow[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-success/20 text-success border-success/30">Aktif</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Pasif</Badge>;
    case 'draft':
      return <Badge variant="outline">Taslak</Badge>;
    default:
      return null;
  }
};

export const RecentWorkflowsList = ({ workflows }: RecentWorkflowsListProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Son Workflow'lar</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/workflows')}>
          Tümünü Gör
        </Button>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Henüz workflow yok
          </p>
        ) : (
          <div className="space-y-2">
            {workflows.slice(0, 5).map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
                className="flex items-center justify-between p-3 rounded-lg bg-surface/50 hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                    {workflow.name}
                  </span>
                  {getStatusBadge(workflow.status)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true, locale: tr })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
