import { LoginRequest } from "../interfaces/LoginRequestInterface";
import { AuthResponse } from "../interfaces/AuthRequestInterface";
import { RegisterRequest } from "../interfaces/RegisterRequestInterface";
import CONFIG from "../config/config";

export const API_CONFIG = {
  BASE_URL: CONFIG.API_BASE_URL,
  ENDPOINTS: {
    LOGIN: '/api/Account/login',
    REGISTER: '/api/Account/register',
    GOOGLE_LOGIN: '/api/Account/login/google',
    FACEBOOK_LOGIN: '/api/Account/login/facebook',
    STATUS: '/api/Account/status',
    LOGOUT: '/api/Account/logout'
  }
};

export class ApiService {
  private static instance: ApiService;
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (response.redirected) {
        window.location.href = response.url;
        return Promise.reject('Redirecting to OAuth provider');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getAuthStatus(): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(API_CONFIG.ENDPOINTS.STATUS);
  }

  async logout(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(API_CONFIG.ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  }

  // OAuth methods
  loginWithGoogle(): void {
    window.location.href = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GOOGLE_LOGIN}`;
  }

  loginWithFacebook(): void {
    window.location.href = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FACEBOOK_LOGIN}`;
  }
}
