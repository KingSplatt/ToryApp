// Configuration for different environments
export const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5217'
    : (import.meta as any).env?.VITE_API_BASE_URL || 'https://toryappwebservice.onrender.com',
  
  // Environment detection
  IS_DEVELOPMENT: window.location.hostname === 'localhost',
  IS_PRODUCTION: window.location.hostname !== 'localhost'
};

// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/Account/login',
  REGISTER: '/api/Account/register',
  LOGOUT: '/api/Account/logout',
  PROFILE: '/api/Account/profile',
  GOOGLE_LOGIN: '/api/Account/login/google',
  FACEBOOK_LOGIN: '/api/Account/login/facebook',
  
  // Inventories endpoints
  INVENTORIES: '/api/Inventories',
  CATEGORIES: '/api/Categories',
  
  // Items endpoints
  ITEMS: '/api/Items',
  
  // Health check
  HEALTH: '/api/health'
};

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'dk8wdgwcn',
  UPLOAD_PRESET: (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'Tory-Images'
};

export default CONFIG;
