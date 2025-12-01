import { AlertTriangle } from 'lucide-react';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LowStockTableProps {
  products: Product[];
}

export const LowStockTable = ({ products }: LowStockTableProps) => {
  const navigate = useNavigate();

  if (products.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Low Stock Alerts
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-muted-foreground">All products are well-stocked!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Low Stock Alerts
        </h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground border-b border-border">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">SKU</th>
              <th className="pb-3 font-medium text-right">Current</th>
              <th className="pb-3 font-medium text-right">Threshold</th>
              <th className="pb-3 font-medium text-right">Deficit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const deficit = product.reorderThreshold - product.currentStock;
              const isCritical = product.currentStock <= product.reorderThreshold * 0.5;

              return (
                <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{product.sku}</td>
                  <td className="py-3 text-right">
                    <span
                      className={cn(
                        'font-semibold',
                        isCritical ? 'text-destructive' : 'text-amber-600'
                      )}
                    >
                      {product.currentStock}
                    </span>
                  </td>
                  <td className="py-3 text-right text-muted-foreground">{product.reorderThreshold}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive">
                      -{deficit}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
