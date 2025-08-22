import { AuthService } from '../login/services/auth';
import { User } from '../login/interfaces/UserInterface';
import { Router } from '../router/router';

export class UIUtils {
  static showLoading(element: HTMLButtonElement, text: string = 'Loading...'): void {
    element.disabled = true;
    element.innerHTML = `
      <span class="loading-spinner"></span>
      ${text}
    `;
  }

  static hideLoading(element: HTMLButtonElement, originalText: string): void {
    element.disabled = false;
    element.innerHTML = originalText;
  }

  static showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const existingMessages = document.querySelectorAll('.auth-message');
    existingMessages.forEach(msg => msg.remove());
    const messageElement = document.createElement('div');
    messageElement.className = `auth-message auth-message-${type}`;
    messageElement.textContent = message;
  
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
      loginContainer.appendChild(messageElement);
      loginContainer.scrollTop = loginContainer.scrollHeight;
      setTimeout(() => {
        messageElement.remove();
      }, 5000);
    }
  }

  static async handleOAuthCallback(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    const loginSuccess = urlParams.get('login');
    
    if (loginSuccess === 'success' || returnUrl || window.location.pathname.includes('callback')) {
      try {
        const authService = AuthService.getInstance();
        await authService.initialize();
      } catch (error) {
        console.error('OAuth callback error:', error);
        UIUtils.showMessage('Authentication failed. Please try again.', 'error');
      }
    }
  }

  static getCurrentUser(): User | null {
    const authService = AuthService.getInstance();
    return authService.getUser();
  }

  static isUserAuthenticated(): boolean {
    const authService = AuthService.getInstance();
    return authService.isAuthenticated();
  }

  static getUserDisplayName(user?: User | null): string {
    const currentUser = user || UIUtils.getCurrentUser();
    if (!currentUser) return 'Usuario';
    
    return currentUser.fullName || currentUser.email || 'Usuario';
  }

  static async logoutUser(): Promise<void> {
    try {
      const authService = AuthService.getInstance();
      await authService.logout();
      UIUtils.showMessage('Sesión cerrada exitosamente', 'success');
      setTimeout(() => {
        Router.navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      UIUtils.showMessage('Error al cerrar sesión', 'error');
    }
  }

  static listenToAuthChanges(callback: (user: User | null) => void): () => void {
    const authService = AuthService.getInstance();
    return authService.onAuthStateChanged(callback);
  }

  // Métodos para manejo de roles
  static getUserRoles(): string[] {
    const user = UIUtils.getCurrentUser();
    return user?.roles || [];
  }

  static hasRole(roleName: string): boolean {
    const roles = UIUtils.getUserRoles();
    return roles.includes(roleName);
  }

  static isAdmin(): boolean {
    return UIUtils.hasRole('Admin');
  }

  static isAuthenticatedUser(): boolean {
    return UIUtils.hasRole('AuthUser');
  }

  static showElementByRole(element: HTMLElement, requiredRoles: string[]): void {
    const userRoles = UIUtils.getUserRoles();
    const hasPermission = requiredRoles.some(role => userRoles.includes(role));
    
    if (hasPermission) {
      element.style.display = '';
    } else {
      element.style.display = 'none';
    }
  }

  static hideElementByRole(element: HTMLElement, forbiddenRoles: string[]): void {
    const userRoles = UIUtils.getUserRoles();
    const isForbidden = forbiddenRoles.some(role => userRoles.includes(role));
    
    if (isForbidden) {
      element.style.display = 'none';
    } else {
      element.style.display = '';
    }
  }

  static handleErrorOAuth(error: string): void {
    let errorMessage = 'Authentication failed.';
    switch (error) {
      case 'external_login_failed':
        errorMessage = 'External login failed. Please try again.';
        break;
      case 'email_not_provided':
        errorMessage = 'Email not provided by the authentication provider.';
        break;
      case 'user_creation_failed':
        errorMessage = 'Failed to create user account.';
        break;
      case 'login_association_failed':
        errorMessage = 'Failed to associate login with account.';
        break;
    }

    console.error(errorMessage);
    UIUtils.showMessage(errorMessage, 'error');
  }
}
