// API Configuration - Update these values to connect to your AWS backend

export const API_CONFIG = {
  // Replace with your API Gateway endpoint
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://your-api-gateway-id.execute-api.region.amazonaws.com/prod',
  
  // Cognito configuration
  COGNITO: {
    USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'your-user-pool-id',
    CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID || 'your-client-id',
    REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  },
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      ME: '/auth/me',
    },
    SHOPS: '/shops',
    PRODUCTS: '/products',
    INVENTORY: '/inventory',
    SALES: '/sales',
    ALERTS: '/alerts',
  },
  
  // Feature flags
  USE_MOCK_DATA: true, // Set to false when connecting to real backend
};

export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
