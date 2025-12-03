import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Shop, ApiResponse } from '@/types/inventory';
import { API_CONFIG } from '@/config/api';
import { useAuth } from './AuthContext';

interface ShopContextType {
  shops: Shop[];
  selectedShop: Shop | null;
  shopLimit: number;
  isLoading: boolean;
  setSelectedShop: (shop: Shop) => void;
  createShop: (data: CreateShopData) => Promise<{ success: boolean; error?: string }>;
  updateShop: (shopId: string, data: Partial<Shop>) => Promise<{ success: boolean; error?: string }>;
  deleteShop: (shopId: string) => Promise<{ success: boolean; error?: string }>;
  refreshShops: () => Promise<void>;
  canCreateShop: boolean;
  remainingShops: number;
}

export interface CreateShopData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Mock shops for development
const getMockShops = (userId: string): Shop[] => [
  {
    id: 'shop-001',
    name: 'Downtown Electronics',
    ownerId: userId,
    address: '123 Main Street, Downtown',
    phone: '+1 555-0123',
    email: 'info@downtownelectronics.com',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-01T14:30:00Z',
  },
  {
    id: 'shop-002',
    name: 'Mall Gadgets',
    ownerId: userId,
    address: '456 Shopping Mall, Level 2',
    phone: '+1 555-0456',
    email: 'info@mallgadgets.com',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-10-15T09:00:00Z',
  },
];

const SHOP_LIMIT = 5;
const SELECTED_SHOP_KEY = 'selectedShopId';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShopState] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShops = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setShops([]);
      setSelectedShopState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      if (API_CONFIG.USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const mockShops = getMockShops(user.id);
        setShops(mockShops);
        
        // Restore selected shop from localStorage or use first shop
        const savedShopId = localStorage.getItem(SELECTED_SHOP_KEY);
        const savedShop = mockShops.find(s => s.id === savedShopId);
        setSelectedShopState(savedShop || mockShops[0] || null);
      } else {
        // Real API call
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHOPS}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const data: ApiResponse<Shop[]> = await response.json();
        if (data.data) {
          setShops(data.data);
          const savedShopId = localStorage.getItem(SELECTED_SHOP_KEY);
          const savedShop = data.data.find(s => s.id === savedShopId);
          setSelectedShopState(savedShop || data.data[0] || null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const setSelectedShop = (shop: Shop) => {
    setSelectedShopState(shop);
    localStorage.setItem(SELECTED_SHOP_KEY, shop.id);
  };

  const createShop = async (data: CreateShopData): Promise<{ success: boolean; error?: string }> => {
    if (shops.length >= SHOP_LIMIT) {
      return { success: false, error: 'SHOP_LIMIT_REACHED' };
    }

    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newShop: Shop = {
        id: `shop-${Date.now()}`,
        name: data.name,
        ownerId: user?.id || '',
        address: data.address,
        phone: data.phone,
        email: data.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setShops(prev => [...prev, newShop]);
      if (!selectedShop) {
        setSelectedShop(newShop);
      }
      return { success: true };
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHOPS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.error === 'SHOP_LIMIT_REACHED') {
        return { success: false, error: 'SHOP_LIMIT_REACHED' };
      }
      if (result.data) {
        await fetchShops();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Failed to create shop' };
    }
  };

  const updateShop = async (shopId: string, data: Partial<Shop>): Promise<{ success: boolean; error?: string }> => {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setShops(prev => prev.map(s => s.id === shopId ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
      if (selectedShop?.id === shopId) {
        setSelectedShopState(prev => prev ? { ...prev, ...data } : prev);
      }
      return { success: true };
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHOPS}/${shopId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.data) {
        await fetchShops();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Failed to update shop' };
    }
  };

  const deleteShop = async (shopId: string): Promise<{ success: boolean; error?: string }> => {
    if (shops.length <= 1) {
      return { success: false, error: 'Cannot delete your only shop' };
    }

    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setShops(prev => prev.filter(s => s.id !== shopId));
      if (selectedShop?.id === shopId) {
        const remaining = shops.filter(s => s.id !== shopId);
        setSelectedShop(remaining[0]);
      }
      return { success: true };
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHOPS}/${shopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const result = await response.json();
      if (result.data?.success) {
        await fetchShops();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Failed to delete shop' };
    }
  };

  return (
    <ShopContext.Provider
      value={{
        shops,
        selectedShop,
        shopLimit: SHOP_LIMIT,
        isLoading,
        setSelectedShop,
        createShop,
        updateShop,
        deleteShop,
        refreshShops: fetchShops,
        canCreateShop: shops.length < SHOP_LIMIT,
        remainingShops: SHOP_LIMIT - shops.length,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
