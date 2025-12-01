import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Receipt, Plus, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { salesService } from '@/services/salesService';
import { productService } from '@/services/productService';
import { Sale, Product, SalesFilters } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState<SalesFilters>({});
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
  });
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [salesRes, productsRes] = await Promise.all([
        salesService.getSales(filters),
        productService.getProducts(),
      ]);

      if (salesRes.data) {
        setSales(salesRes.data.items);
        setTotalRevenue(salesRes.data.items.reduce((sum, s) => sum + s.totalAmount, 0));
      }
      if (productsRes.data) {
        setProducts(productsRes.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseInt(formData.quantity);
    if (!formData.productId || isNaN(quantity) || quantity <= 0) {
      toast({ title: 'Please fill all fields correctly', variant: 'destructive' });
      return;
    }

    try {
      const response = await salesService.recordSale({
        productId: formData.productId,
        quantity,
      });

      if (response.data) {
        toast({ title: 'Sale recorded successfully' });
        setIsDialogOpen(false);
        setFormData({ productId: '', quantity: '' });
        fetchData();
      } else if (response.error) {
        toast({ title: response.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error recording sale', variant: 'destructive' });
    }
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const estimatedTotal = selectedProduct
    ? (selectedProduct.unitPrice * parseInt(formData.quantity || '0')).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground">Record and track sales history</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRecordSale} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter((p) => p.currentStock > 0)
                      .map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (${product.unitPrice.toFixed(2)}) - {product.currentStock} in stock
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct?.currentStock || 999}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  required
                />
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground">
                    Available: {selectedProduct.currentStock} units
                  </p>
                )}
              </div>

              {formData.productId && formData.quantity && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Estimated Total</span>
                    <span className="text-2xl font-bold text-foreground">${estimatedTotal}</span>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                Record Sale
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold text-foreground">{sales.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Calendar className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Order Value</p>
              <p className="text-2xl font-bold text-foreground">
                ${sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="date"
          className="sm:w-48"
          value={filters.startDate || ''}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
        />
        <Input
          type="date"
          className="sm:w-48"
          value={filters.endDate || ''}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
        />
        {(filters.startDate || filters.endDate) && (
          <Button variant="ghost" onClick={() => setFilters({})}>
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No sales recorded yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date & Time</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Unit Price</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium text-foreground">
                        {format(new Date(sale.timestamp), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(sale.timestamp), 'h:mm a')}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{sale.productName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{sale.productSku}</td>
                    <td className="px-4 py-3 text-right font-medium">{sale.quantity}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      ${sale.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      ${sale.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
