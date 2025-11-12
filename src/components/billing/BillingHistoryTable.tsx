import { Invoice, InvoiceStatus } from '@/types/billing';
import { Button } from '@/components/ui/Button';
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Invoice
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Amount
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-b border-border hover:bg-surface/50 transition-colors"
            >
              <td className="py-4 px-4 font-medium text-foreground">
                {invoice.number}
              </td>
              <td className="py-4 px-4 text-sm text-muted-foreground">
                {formatDate(invoice.date)}
              </td>
              <td className="py-4 px-4 text-sm font-medium text-foreground">
                ${invoice.amount.toFixed(2)}
              </td>
              <td className="py-4 px-4">
                <Badge className={STATUS_COLORS[invoice.status]}>
                  {STATUS_LABELS[invoice.status]}
                </Badge>
              </td>
              <td className="py-4 px-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(invoice)}
                  disabled={invoice.status !== 'paid'}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {invoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No billing history yet</p>
        </div>
      )}
    </div>
  );
};
