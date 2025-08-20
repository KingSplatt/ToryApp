import { AuthService } from '../login/services/auth';
import { User } from '../login/interfaces/UserInterface';

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
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.auth-message');
    existingMessages.forEach(msg => msg.remove());

    const messageElement = document.createElement('div');
    messageElement.className = `auth-message auth-message-${type}`;
    messageElement.textContent = message;
    
    // Add to login container
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
    if (returnUrl || window.location.pathname.includes('callback')) {
      try {
        const authService = AuthService.getInstance();
        await authService.initialize();
        if (authService.isAuthenticated()) {
          UIUtils.showMessage('Login successful! Redirecting...', 'success');
          setTimeout(() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }, 1500);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        UIUtils.showMessage('Authentication failed. Please try again.', 'error');
      }
    }
  }

  // User-related utilities
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
      
      // Redirect to home after logout
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
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
}
