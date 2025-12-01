// Alert Service - Ready for AWS SNS integration

import { API_CONFIG } from '@/config/api';
import { apiService } from './api';
import { NotificationPreferences, ApiResponse } from '@/types/inventory';

class AlertService {
  private preferences: NotificationPreferences = {
    emailEnabled: true,
    smsEnabled: false,
    email: 'alerts@downtownelectronics.com',
    phone: '',
    lowStockThresholdPercent: 100,
  };

  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { data: this.preferences };
    }

    return apiService.get(`${API_CONFIG.ENDPOINTS.ALERTS}/preferences`);
  }

  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      this.preferences = { ...this.preferences, ...prefs };
      return { data: this.preferences };
    }

    return apiService.put(`${API_CONFIG.ENDPOINTS.ALERTS}/preferences`, prefs);
  }

  async sendTestAlert(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        data: {
          success: true,
          message: 'Test notification sent successfully! Check your email/phone.',
        },
      };
    }

    return apiService.post(`${API_CONFIG.ENDPOINTS.ALERTS}/test`, {});
  }

  async triggerLowStockAlert(productId: string): Promise<ApiResponse<{ sent: boolean }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`[Mock] Low stock alert triggered for product: ${productId}`);
      return { data: { sent: true } };
    }

    return apiService.post(`${API_CONFIG.ENDPOINTS.ALERTS}/low-stock`, { productId });
  }
}

export const alertService = new AlertService();
