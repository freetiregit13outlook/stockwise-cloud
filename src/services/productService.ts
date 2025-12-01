// Product Service - Ready for AWS Lambda/DynamoDB integration

import { API_CONFIG } from '@/config/api';
import { apiService } from './api';
import { mockProducts, categories } from '@/data/mockData';
import { Product, ProductFilters, ApiResponse, PaginatedResponse } from '@/types/inventory';

class ProductService {
  private products = [...mockProducts]; // Local state for mock mode

  async getProducts(filters?: ProductFilters): Promise<ApiResponse<PaginatedResponse<Product>>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let filtered = [...this.products];
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          p => p.name.toLowerCase().includes(search) || 
               p.sku.toLowerCase().includes(search)
        );
      }
      
      if (filters?.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      
      if (filters?.lowStockOnly) {
        filtered = filtered.filter(p => p.currentStock < p.reorderThreshold);
      }
      
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
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.lowStockOnly) params.append('lowStockOnly', 'true');
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiService.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}${query}`);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const product = this.products.find(p => p.id === id);
      if (product) {
        return { data: product };
      }
      return { error: 'Product not found' };
    }

    return apiService.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  }

  async createProduct(product: Omit<Product, 'id' | 'shopId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newProduct: Product = {
        ...product,
        id: `prod-${Date.now()}`,
        shopId: 'shop-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      this.products.push(newProduct);
      return { data: newProduct };
    }

    return apiService.post(API_CONFIG.ENDPOINTS.PRODUCTS, product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const index = this.products.findIndex(p => p.id === id);
      if (index === -1) {
        return { error: 'Product not found' };
      }
      
      this.products[index] = {
        ...this.products[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      return { data: this.products[index] };
    }

    return apiService.put(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`, updates);
  }

  async deleteProduct(id: string): Promise<ApiResponse<{ success: boolean }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = this.products.findIndex(p => p.id === id);
      if (index === -1) {
        return { error: 'Product not found' };
      }
      
      this.products.splice(index, 1);
      return { data: { success: true } };
    }

    return apiService.delete(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      return { data: categories };
    }

    return apiService.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}/categories`);
  }

  async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const lowStock = this.products.filter(p => p.currentStock < p.reorderThreshold);
      return { data: lowStock };
    }

    return apiService.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}?lowStockOnly=true`);
  }
}

export const productService = new ProductService();
