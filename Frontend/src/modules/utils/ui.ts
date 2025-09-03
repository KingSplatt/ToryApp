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
    const error = urlParams.get('error');
    const blockedAt = urlParams.get('blockedAt');
    
    if (error) {
      if (error === 'account_blocked') {
        const blockedMessage = blockedAt 
          ? `Your account was blocked on ${new Date(blockedAt).toLocaleDateString()}.`
          : 'Your account has been blocked.';
        UIUtils.showMessage(`Access denied. ${blockedMessage} Please contact support.`, 'error');
        Router.navigate('/login');
        return;
      } else {
        UIUtils.handleErrorOAuth(error);
        return;
      }
    }
    
    if (loginSuccess === 'success' || returnUrl || window.location.pathname.includes('callback')) {
      try {
        const authService = AuthService.getInstance();
        await authService.initialize();
        
        // Verificar si el usuario está bloqueado después de la inicialización
        const user = authService.getUser();
        if (user && user.isBlocked) {
          await authService.logout();
          const blockedMessage = user.blockedAt 
            ? `Your account was blocked on ${new Date(user.blockedAt).toLocaleDateString()}.`
            : 'Your account has been blocked.';
          UIUtils.showMessage(`Access denied. ${blockedMessage} Please contact support.`, 'error');
          Router.navigate('/login');
          return;
        }
        
        // Si todo está bien, navegar al home
        Router.navigate('/');
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
      UIUtils.showMessage('Session ended successfully', 'success');
      setTimeout(() => {
        Router.navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      UIUtils.showMessage('Logout error', 'error');
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
      case 'account_blocked':
        errorMessage = 'Your account has been blocked. Please contact support.';
        break;
    }

    console.error(errorMessage);
    UIUtils.showMessage(errorMessage, 'error');
  }

  static showModalForMessages(message: string, autoCloseAfter: number = 2000): void {
    // Remover modales existentes
    const existingModals = document.querySelectorAll('.ui-modal');
    existingModals.forEach(modal => modal.remove());

    // Crear modal con clases CSS
    const modal = document.createElement('div');
    modal.className = 'ui-modal';
    
    // Crear contenido del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    const message_p = document.createElement('p');
    message_p.textContent = message;
  
    // Ensamblar modal
    modalContent.appendChild(message_p);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  
    // Auto-cerrar después del tiempo especificado
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, autoCloseAfter);
    
    // Permitir cerrar haciendo clic fuera del contenido solo después del tiempo
    setTimeout(() => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    }, autoCloseAfter);
  }

  static ModalForConfirmation(message: string, onConfirm?: () => void, onCancel?: () => void): void {
    // Remover modales existentes de confirmación
    const existingModals = document.querySelectorAll('.ui-modal');
    existingModals.forEach(modal => modal.remove());

    const modal = document.createElement('div');
    modal.className = 'ui-modal';

    // Crear contenido del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    const message_p = document.createElement('p');
    message_p.textContent = message;

    // Crear botones
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.className = 'btn btn-primary';
    confirmButton.addEventListener('click', () => {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
      onConfirm?.();
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.addEventListener('click', () => {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
      onCancel?.();
    });

    // Handler para la tecla Escape
    const escapeHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escapeHandler);
        onCancel?.();
      }
    };

    // Prevenir cierre al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
      // No hacer nada - el modal solo se cierra con los botones
    });

    // Permitir que el contenido del modal no propague el click
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Agregar listener para tecla Escape
    document.addEventListener('keydown', escapeHandler);

    // Ensamblar modal
    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);
    modalContent.appendChild(message_p);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Enfocar el botón de cancelar por defecto
    setTimeout(() => {
      cancelButton.focus();
    }, 100);
  }
}
