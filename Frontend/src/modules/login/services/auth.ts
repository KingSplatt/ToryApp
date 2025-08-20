import { User } from '../interfaces/UserInterface';
import { ApiService } from './api';

export class AuthService {
  private static instance: AuthService;
  private user: User | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Event listeners for auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authListeners.push(callback);
    // Call immediately with current state
    callback(this.user);
    
    // Return unsubscribe function
    return () => {
      const index = this.authListeners.indexOf(callback);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  private notifyAuthStateChange(): void {
    this.authListeners.forEach(callback => callback(this.user));
  }

  setUser(user: User | null): void {
    this.user = user;
    
    // Store in localStorage for persistence
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    
    this.notifyAuthStateChange();
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  // Initialize from localStorage
  async initialize(): Promise<void> {
    try {
      // First try to get from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }

      // Then verify with server
      const apiService = ApiService.getInstance();
      const response = await apiService.getAuthStatus();
      
      if (response.user) {
        this.setUser(response.user);
      } else {
        this.setUser(null);
      }
    } catch (error) {
      console.log('Not authenticated or server not available');
      this.setUser(null);
    }
  }

  async logout(): Promise<void> {
    try {
      const apiService = ApiService.getInstance();
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setUser(null);
    }
  }
}
