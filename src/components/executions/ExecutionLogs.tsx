import { useState } from 'react';
import { ExecutionLog } from '@/types/execution';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ExecutionLogsProps {
  logs: ExecutionLog[];
}

export const ExecutionLogs = ({ logs }: ExecutionLogsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'error' | 'debug'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'error' && (log.level === 'error' || log.level === 'warn')) ||
      (activeTab === 'debug' && log.level === 'debug');

    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    const colors = {
      info: 'text-foreground',
      warn: 'text-warning',
      error: 'text-destructive',
      debug: 'text-muted-foreground',
    };
    return colors[level as keyof typeof colors];
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      info: 'bg-primary/10 text-primary',
      warn: 'bg-warning/10 text-warning',
      error: 'bg-destructive/10 text-destructive',
      debug: 'bg-muted text-muted-foreground',
    };
    return badges[level as keyof typeof badges];
  };

  const copyLogs = () => {
    const logsText = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleString()}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join('\n');
    navigator.clipboard.writeText(logsText);
    toast({
      title: 'Copied',
      description: 'Logs copied to clipboard',
    });
  };

  const downloadLogs = () => {
    const logsText = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleString()}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'all'
                ? 'text-foreground border-b-2 border-primary bg-accent/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
            )}
          >
            All Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('error')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'error'
                ? 'text-foreground border-b-2 border-primary bg-accent/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
            )}
          >
            Errors ({logs.filter((l) => l.level === 'error' || l.level === 'warn').length})
          </button>
          <button
            onClick={() => setActiveTab('debug')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'debug'
                ? 'text-foreground border-b-2 border-primary bg-accent/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
            )}
          >
            Debug ({logs.filter((l) => l.level === 'debug').length})
          </button>
        </div>

        <div className="flex items-center gap-2 px-4">
          <Button variant="ghost" size="sm" onClick={copyLogs}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadLogs}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Logs */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No logs found</p>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 hover:bg-accent/50 rounded px-2">
                <span className="text-muted-foreground whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    getLevelBadge(log.level)
                  )}
                >
                  {log.level.toUpperCase()}
                </span>
                <span className={cn('flex-1', getLevelColor(log.level))}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
