// Core data types for the Inventory Management System

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  address?: string;
  phone?: string;
  email?: string;
  notificationEmail?: string;
  notificationPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  shopId: string;
  firstName?: string;
  lastName?: string;
  role: 'owner' | 'staff';
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  reorderThreshold: number;
  location?: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  shopId: string;
  quantityChange: number;
  type: 'IN' | 'OUT';
  reason: 'purchase' | 'sale' | 'adjustment' | 'wastage' | 'return';
  notes?: string;
  performedBy: string;
  timestamp: string;
}

export interface Sale {
  id: string;
  shopId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  timestamp: string;
  performedBy: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  todaySalesValue: number;
  recentSalesValue: number;
}

export interface LowStockItem {
  product: Product;
  deficit: number;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  email?: string;
  phone?: string;
  lowStockThresholdPercent: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Filter types
export interface ProductFilters {
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}

export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
  category?: string;
}
