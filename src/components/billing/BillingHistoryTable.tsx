import { Invoice, InvoiceStatus } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BillingHistoryTableProps {
  invoices: Invoice[];
}

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  paid: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
};

export const BillingHistoryTable = ({ invoices }: BillingHistoryTableProps) => {
  const handleDownload = (invoice: Invoice) => {
    toast({
      title: 'Downloading Invoice',
      description: `Invoice ${invoice.number} is being downloaded...`,
    });
    // Mock download - in real app would trigger actual download
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto p-6">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/60">
            <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Invoice
            </th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Date
            </th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Amount
            </th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th className="text-right py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-b border-border/40 hover:bg-surface/40 transition-all duration-200 group"
            >
              <td className="py-5 px-6 font-semibold text-foreground">
                {invoice.number}
              </td>
              <td className="py-5 px-6 text-sm text-muted-foreground">
                {formatDate(invoice.date)}
              </td>
              <td className="py-5 px-6 text-base font-semibold text-foreground">
                ${invoice.amount.toFixed(2)}
              </td>
              <td className="py-5 px-6">
                <Badge className={`${STATUS_COLORS[invoice.status]} px-3 py-1 font-medium`}>
                  {STATUS_LABELS[invoice.status]}
                </Badge>
              </td>
              <td className="py-5 px-6 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(invoice)}
                  disabled={invoice.status !== 'paid'}
                  className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-30"
                >
                  <Download className="h-4.5 w-4.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-muted/50 p-6 mb-4">
            <svg className="h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-foreground font-semibold text-lg mb-2">No billing history yet</p>
          <p className="text-muted-foreground text-sm text-center max-w-md">Your invoices and receipts will appear here once you start using paid features.</p>
        </div>
      )}
    </div>
  );
};
