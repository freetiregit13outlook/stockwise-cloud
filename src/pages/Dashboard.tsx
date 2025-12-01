import { useEffect, useState } from 'react';
import { Package, Boxes, AlertTriangle, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { LowStockTable } from '@/components/dashboard/LowStockTable';
import { RecentSalesCard } from '@/components/dashboard/RecentSalesCard';
import { productService } from '@/services/productService';
import { salesService } from '@/services/salesService';
import { Product, Sale, DashboardStats } from '@/types/inventory';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, salesRes, todayStatsRes] = await Promise.all([
          productService.getProducts(),
          salesService.getSales(),
          salesService.getSalesStats('today'),
        ]);

        if (productsRes.data) {
          const products = productsRes.data.items;
          const lowStock = products.filter((p) => p.currentStock < p.reorderThreshold);
          setLowStockProducts(lowStock);

          setStats({
            totalProducts: products.length,
            totalStockUnits: products.reduce((sum, p) => sum + p.currentStock, 0),
            lowStockCount: lowStock.length,
            todaySalesValue: todayStatsRes.data?.totalRevenue || 0,
            recentSalesValue: salesRes.data?.items.reduce((sum, s) => sum + s.totalAmount, 0) || 0,
          });
        }

        if (salesRes.data) {
          setRecentSales(salesRes.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory and sales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
        />
        <StatCard
          title="Stock Units"
          value={stats?.totalStockUnits.toLocaleString() || 0}
          icon={Boxes}
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          variant={stats?.lowStockCount && stats.lowStockCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Today's Sales"
          value={`$${stats?.todaySalesValue.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockTable products={lowStockProducts} />
        <RecentSalesCard sales={recentSales} />
      </div>
    </div>
  );
}
