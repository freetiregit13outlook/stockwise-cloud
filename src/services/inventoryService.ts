// Inventory Service - Ready for AWS Lambda/DynamoDB integration

import { API_CONFIG } from '@/config/api';
import { apiService } from './api';
import { mockProducts, mockTransactions } from '@/data/mockData';
import { Product, InventoryTransaction, ApiResponse } from '@/types/inventory';

export interface StockAdjustment {
  productId: string;
  quantityChange: number;
  type: 'IN' | 'OUT';
  reason: 'purchase' | 'sale' | 'adjustment' | 'wastage' | 'return';
  notes?: string;
}

class InventoryService {
  private products = [...mockProducts];
  private transactions = [...mockTransactions];

  async getInventory(): Promise<ApiResponse<Product[]>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { data: this.products };
    }

    return apiService.get(API_CONFIG.ENDPOINTS.INVENTORY);
  }

  async adjustStock(adjustment: StockAdjustment): Promise<ApiResponse<{ product: Product; transaction: InventoryTransaction }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const productIndex = this.products.findIndex(p => p.id === adjustment.productId);
      if (productIndex === -1) {
        return { error: 'Product not found' };
      }
      
      const newStock = this.products[productIndex].currentStock + adjustment.quantityChange;
      if (newStock < 0) {
        return { error: 'Insufficient stock for this adjustment' };
      }
      
      // Update product stock
      this.products[productIndex] = {
        ...this.products[productIndex],
        currentStock: newStock,
        updatedAt: new Date().toISOString(),
      };
      
      // Create transaction record
      const transaction: InventoryTransaction = {
        id: `tx-${Date.now()}`,
        productId: adjustment.productId,
        shopId: 'shop-001',
        quantityChange: adjustment.quantityChange,
        type: adjustment.type,
        reason: adjustment.reason,
        notes: adjustment.notes,
        performedBy: 'user-001',
        timestamp: new Date().toISOString(),
      };
      
      this.transactions.unshift(transaction);
      
      return {
        data: {
          product: this.products[productIndex],
          transaction,
        },
      };
    }

    return apiService.post(`${API_CONFIG.ENDPOINTS.INVENTORY}/adjust`, adjustment);
  }

  async getTransactionHistory(productId?: string): Promise<ApiResponse<InventoryTransaction[]>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filtered = this.transactions;
      if (productId) {
        filtered = filtered.filter(t => t.productId === productId);
      }
      
      return { data: filtered };
    }

    const query = productId ? `?productId=${productId}` : '';
    return apiService.get(`${API_CONFIG.ENDPOINTS.INVENTORY}/transactions${query}`);
  }

  async bulkAdjustStock(adjustments: StockAdjustment[]): Promise<ApiResponse<{ success: boolean; processed: number }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      for (const adjustment of adjustments) {
        await this.adjustStock(adjustment);
      }
      
      return { data: { success: true, processed: adjustments.length } };
    }

    return apiService.post(`${API_CONFIG.ENDPOINTS.INVENTORY}/bulk-adjust`, { adjustments });
  }
}

export const inventoryService = new InventoryService();
