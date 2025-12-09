import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ExecutionStats {
  success: number;
  failed: number;
  running: number;
}

interface ExecutionStatsMiniProps {
  stats: ExecutionStats;
}

export const ExecutionStatsMini = ({ stats }: ExecutionStatsMiniProps) => {
  const items = [
    { label: 'Başarılı', value: stats.success, icon: CheckCircle2, color: 'text-success' },
    { label: 'Başarısız', value: stats.failed, icon: XCircle, color: 'text-destructive' },
    { label: 'Çalışan', value: stats.running, icon: Loader2, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-surface rounded-lg border border-border p-4 flex items-center gap-3"
        >
          <item.icon className={`h-5 w-5 ${item.color}`} />
          <div>
            <div className="text-2xl font-bold text-foreground">{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
