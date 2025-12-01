import { TrendingUp } from 'lucide-react';
import { Sale } from '@/types/inventory';
import { format } from 'date-fns';

interface RecentSalesCardProps {
  sales: Sale[];
}

export const RecentSalesCard = ({ sales }: RecentSalesCardProps) => {
  const recentSales = sales.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        Recent Sales
      </h3>

      {recentSales.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recent sales</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{sale.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {sale.quantity} × ${sale.unitPrice.toFixed(2)}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-emerald-600">${sale.totalAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(sale.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
