// Authentication Service - Ready for AWS Cognito integration

import { API_CONFIG } from '@/config/api';
import { apiService } from './api';
import { mockUser, mockShop } from '@/data/mockData';
import { User, Shop, ApiResponse } from '@/types/inventory';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  firstName?: string;
  lastName?: string;
  shopName?: string;
}

export interface AuthState {
  user: User | null;
  shop: Shop | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';

  // Mock authentication - Replace with Cognito SDK calls
  async signIn(credentials: AuthCredentials): Promise<ApiResponse<{ user: User; shop: Shop; token: string }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock validation
      if (credentials.email && credentials.password.length >= 6) {
        const token = 'mock-jwt-token-' + Date.now();
        this.setToken(token);
        return {
          data: {
            user: mockUser,
            shop: mockShop,
            token,
          },
        };
      }
      return { error: 'Invalid credentials' };
    }

    // Real Cognito integration would go here:
    // const cognitoUser = await Auth.signIn(credentials.email, credentials.password);
    // const token = cognitoUser.signInUserSession.idToken.jwtToken;
    // this.setToken(token);
    // const userData = await this.getCurrentUser();
    // return { data: userData };
    
    return apiService.post('/auth/signin', credentials);
  }

  async signUp(data: SignUpData): Promise<ApiResponse<{ message: string }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (data.email && data.password.length >= 8) {
        return {
          data: { message: 'Account created successfully. Please check your email to verify.' },
        };
      }
      return { error: 'Password must be at least 8 characters' };
    }

    // Real Cognito integration:
    // await Auth.signUp({
    //   username: data.email,
    //   password: data.password,
    //   attributes: {
    //     email: data.email,
    //     'custom:firstName': data.firstName,
    //     'custom:lastName': data.lastName,
    //   },
    // });
    
    return apiService.post('/auth/signup', data);
  }

  async signOut(): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      this.clearTokens();
      return;
    }

    // Real Cognito: await Auth.signOut();
    this.clearTokens();
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User; shop: Shop }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      const token = this.getToken();
      if (token) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: { user: mockUser, shop: mockShop } };
      }
      return { error: 'Not authenticated' };
    }

    return apiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: { message: 'Password reset email sent' } };
    }

    // Real Cognito: await Auth.forgotPassword(email);
    return apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: { message: 'Password reset successfully' } };
    }

    // Real Cognito: await Auth.forgotPasswordSubmit(email, code, newPassword);
    return apiService.post('/auth/reset-password', { email, code, newPassword });
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
