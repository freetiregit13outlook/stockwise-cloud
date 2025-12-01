import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AuthCredentials, SignUpData } from '@/services/authService';
import { User, Shop } from '@/types/inventory';

interface AuthContextType {
  user: User | null;
  shop: Shop | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    if (authService.isAuthenticated()) {
      try {
        const response = await authService.getCurrentUser();
        if (response.data) {
          setUser(response.data.user);
          setShop(response.data.shop);
        } else {
          authService.clearTokens();
        }
      } catch {
        authService.clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signIn = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.signIn(credentials);
      if (response.data) {
        setUser(response.data.user);
        setShop(response.data.shop);
        return { success: true };
      }
      return { success: false, error: response.error || 'Sign in failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const response = await authService.signUp(data);
      if (response.data) {
        return { success: true, message: response.data.message };
      }
      return { success: false, error: response.error || 'Sign up failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setShop(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
