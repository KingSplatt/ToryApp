// Configuration for different environments
export const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5217'
    : (import.meta as any).env?.VITE_API_URL || 'https://toryappwebservice.onrender.com',
  
  // Environment detection
  IS_DEVELOPMENT: window.location.hostname === 'localhost',
  IS_PRODUCTION: window.location.hostname !== 'localhost'
};

// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/Account/login',
  REGISTER: '/Account/register',
  LOGOUT: '/Account/logout',
  PROFILE: '/Account/profile',
  GOOGLE_LOGIN: '/Account/google-login',
  FACEBOOK_LOGIN: '/Account/facebook-login',
  
  // Inventories endpoints
  INVENTORIES: '/api/Inventories',
  CATEGORIES: '/api/Categories',
  
  // Items endpoints
  ITEMS: '/api/Items',
  
  // Health check
  HEALTH: '/api/health'
};

export default CONFIG;
