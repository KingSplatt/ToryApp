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

  // for auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authListeners.push(callback);
    callback(this.user);
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

  isBlocked(): boolean {
    return this.user?.isBlocked === true;
  }

  // Initialize from localStorage
  async initialize(): Promise<void> {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }

      const apiService = ApiService.getInstance();
      const response = await apiService.getAuthStatus();      
      if (response.user) {
        if (response.user.isBlocked) {
          await this.logout();
          return;
        }
        this.setUser(response.user);
      } else {
        this.setUser(null);
      }
    } catch (error) {
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
