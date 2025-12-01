// Sales Service - Ready for AWS Lambda/DynamoDB integration

import { API_CONFIG } from '@/config/api';
import { apiService } from './api';
import { mockSales, mockProducts } from '@/data/mockData';
import { Sale, SalesFilters, ApiResponse, PaginatedResponse } from '@/types/inventory';

export interface NewSale {
  productId: string;
  quantity: number;
}

class SalesService {
  private sales = [...mockSales];
  private products = [...mockProducts];

  async getSales(filters?: SalesFilters): Promise<ApiResponse<PaginatedResponse<Sale>>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let filtered = [...this.sales];
      
      if (filters?.startDate) {
        filtered = filtered.filter(s => new Date(s.timestamp) >= new Date(filters.startDate!));
      }
      
      if (filters?.endDate) {
        filtered = filtered.filter(s => new Date(s.timestamp) <= new Date(filters.endDate!));
      }
      
      if (filters?.productId) {
        filtered = filtered.filter(s => s.productId === filters.productId);
      }
      
      // Sort by timestamp descending
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return {
        data: {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: 50,
          hasMore: false,
        },
      };
    }

    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.productId) params.append('productId', filters.productId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiService.get(`${API_CONFIG.ENDPOINTS.SALES}${query}`);
  }

  async recordSale(sale: NewSale): Promise<ApiResponse<Sale>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const product = this.products.find(p => p.id === sale.productId);
      if (!product) {
        return { error: 'Product not found' };
      }
      
      if (product.currentStock < sale.quantity) {
        return { error: 'Insufficient stock' };
      }
      
      const newSale: Sale = {
        id: `sale-${Date.now()}`,
        shopId: 'shop-001',
        productId: sale.productId,
        productName: product.name,
        productSku: product.sku,
        quantity: sale.quantity,
        unitPrice: product.unitPrice,
        totalAmount: product.unitPrice * sale.quantity,
        timestamp: new Date().toISOString(),
        performedBy: 'user-001',
      };
      
      this.sales.unshift(newSale);
      
      // Update product stock (in mock mode)
      const productIndex = this.products.findIndex(p => p.id === sale.productId);
      if (productIndex !== -1) {
        this.products[productIndex].currentStock -= sale.quantity;
      }
      
      return { data: newSale };
    }

    return apiService.post(API_CONFIG.ENDPOINTS.SALES, sale);
  }

  async getSalesStats(period: 'today' | 'week' | 'month'): Promise<ApiResponse<{ totalSales: number; totalRevenue: number; averageOrderValue: number }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      
      const periodSales = this.sales.filter(s => new Date(s.timestamp) >= startDate);
      const totalRevenue = periodSales.reduce((sum, s) => sum + s.totalAmount, 0);
      
      return {
        data: {
          totalSales: periodSales.length,
          totalRevenue,
          averageOrderValue: periodSales.length > 0 ? totalRevenue / periodSales.length : 0,
        },
      };
    }

    return apiService.get(`${API_CONFIG.ENDPOINTS.SALES}/stats?period=${period}`);
  }

  async getTopSellingProducts(limit: number = 5): Promise<ApiResponse<{ productId: string; productName: string; totalQuantity: number; totalRevenue: number }[]>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const productStats = new Map<string, { productName: string; totalQuantity: number; totalRevenue: number }>();
      
      for (const sale of this.sales) {
        const existing = productStats.get(sale.productId) || {
          productName: sale.productName,
          totalQuantity: 0,
          totalRevenue: 0,
        };
        
        productStats.set(sale.productId, {
          productName: sale.productName,
          totalQuantity: existing.totalQuantity + sale.quantity,
          totalRevenue: existing.totalRevenue + sale.totalAmount,
        });
      }
      
      const sorted = Array.from(productStats.entries())
        .map(([productId, stats]) => ({ productId, ...stats }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);
      
      return { data: sorted };
    }

    return apiService.get(`${API_CONFIG.ENDPOINTS.SALES}/top-products?limit=${limit}`);
  }
}

export const salesService = new SalesService();
