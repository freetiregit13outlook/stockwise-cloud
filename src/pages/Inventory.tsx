import { useEffect, useState } from 'react';
import { Plus, Minus, ArrowUpDown, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { inventoryService, StockAdjustment } from '@/services/inventoryService';
import { Product } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT'>('IN');
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: '',
    reason: 'purchase' as StockAdjustment['reason'],
    notes: '',
  });

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await inventoryService.getInventory();
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAdjustDialog = (product: Product, type: 'IN' | 'OUT') => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentData({
      quantity: '',
      reason: type === 'IN' ? 'purchase' : 'sale',
      notes: '',
    });
    setIsAdjustDialogOpen(true);
  };

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const quantity = parseInt(adjustmentData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: 'Please enter a valid quantity', variant: 'destructive' });
      return;
    }

    const adjustment: StockAdjustment = {
      productId: selectedProduct.id,
      quantityChange: adjustmentType === 'IN' ? quantity : -quantity,
      type: adjustmentType,
      reason: adjustmentData.reason,
      notes: adjustmentData.notes || undefined,
    };

    try {
      const response = await inventoryService.adjustStock(adjustment);
      if (response.data) {
        toast({
          title: 'Stock adjusted successfully',
          description: `${adjustmentType === 'IN' ? 'Added' : 'Removed'} ${quantity} units`,
        });
        setIsAdjustDialogOpen(false);
        fetchInventory();
      } else if (response.error) {
        toast({ title: response.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error adjusting stock', variant: 'destructive' });
    }
  };

  const getStockStatus = (product: Product) => {
    const ratio = product.currentStock / product.reorderThreshold;
    if (ratio <= 0.5) return { label: 'Critical', color: 'bg-destructive text-destructive-foreground' };
    if (ratio < 1) return { label: 'Low', color: 'bg-amber-500 text-white' };
    return { label: 'Good', color: 'bg-emerald-500 text-white' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground">Monitor and adjust stock levels</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const status = getStockStatus(product);
            const isLowStock = product.currentStock < product.reorderThreshold;

            return (
              <div
                key={product.id}
                className={cn(
                  'bg-card rounded-xl border p-5 transition-all hover:shadow-md',
                  isLowStock ? 'border-amber-500/50' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.sku}</p>
                  </div>
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium', status.color)}>
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{product.currentStock}</p>
                    <p className="text-xs text-muted-foreground">Current Stock</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-muted-foreground">{product.reorderThreshold}</p>
                    <p className="text-xs text-muted-foreground">Reorder At</p>
                  </div>
                </div>

                {product.location && (
                  <p className="text-sm text-muted-foreground mb-4">
                    <Warehouse className="w-4 h-4 inline mr-1" />
                    {product.location}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openAdjustDialog(product, 'IN')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Stock
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openAdjustDialog(product, 'OUT')}
                    disabled={product.currentStock === 0}
                  >
                    <Minus className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5" />
              {adjustmentType === 'IN' ? 'Add Stock' : 'Remove Stock'} - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdjustment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentData.quantity}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: e.target.value })}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select
                value={adjustmentData.reason}
                onValueChange={(value) => setAdjustmentData({ ...adjustmentData, reason: value as StockAdjustment['reason'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentType === 'IN' ? (
                    <>
                      <SelectItem value="purchase">Purchase/Restock</SelectItem>
                      <SelectItem value="return">Customer Return</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="wastage">Wastage/Damage</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={adjustmentData.notes}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdjustDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {adjustmentType === 'IN' ? 'Add Stock' : 'Remove Stock'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
