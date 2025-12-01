import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Package, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { salesService } from '@/services/salesService';
import { productService } from '@/services/productService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Analytics() {
  const [topProducts, setTopProducts] = useState<{ productId: string; productName: string; totalQuantity: number; totalRevenue: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [salesTrend, setSalesTrend] = useState<{ date: string; sales: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [topProductsRes, productsRes, salesRes] = await Promise.all([
          salesService.getTopSellingProducts(5),
          productService.getProducts(),
          salesService.getSales(),
        ]);

        if (topProductsRes.data) {
          setTopProducts(topProductsRes.data);
        }

        if (productsRes.data) {
          const catMap = new Map<string, number>();
          productsRes.data.items.forEach((p) => {
            catMap.set(p.category, (catMap.get(p.category) || 0) + p.currentStock);
          });
          setCategoryData(Array.from(catMap.entries()).map(([name, value]) => ({ name, value })));
        }

        if (salesRes.data) {
          const trendMap = new Map<string, number>();
          salesRes.data.items.forEach((s) => {
            const date = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            trendMap.set(date, (trendMap.get(date) || 0) + s.totalAmount);
          });
          setSalesTrend(
            Array.from(trendMap.entries())
              .map(([date, sales]) => ({ date, sales }))
              .reverse()
              .slice(-7)
          );
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Sales trends and inventory insights</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>QuickSight Integration</AlertTitle>
        <AlertDescription>
          For advanced analytics, this dashboard can be integrated with Amazon QuickSight. 
          Configure your QuickSight dashboard URL in the settings to embed interactive BI reports.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Sales Trend (Last 7 Days)
          </h3>
          {salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No sales data available
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Top Selling Products
          </h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={120}
                  tickFormatter={(v) => v.length > 15 ? `${v.slice(0, 15)}...` : v}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No sales data available
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Stock by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value} units`, 'Stock']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No inventory data available
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products Summary</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{product.productName}</p>
                    <p className="text-xs text-muted-foreground">{product.totalQuantity} units sold</p>
                  </div>
                </div>
                <p className="font-semibold text-emerald-600">${product.totalRevenue.toFixed(2)}</p>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No sales data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
