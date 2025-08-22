import '../styles/login.css'
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth';
import { UIUtils } from '../../utils/ui';
import { LoginRequest } from '../interfaces/LoginRequestInterface';
import { Router } from '../../router/router';
import { LoginSchema } from '../schemas/LoginSchema';
import { ZodError } from 'zod';

export function loginPage() {
  return `
    <div class="login-container">
      <div class="login-card">
        <h2 class="titulos">Log in</h2>
        <p class="login-subtitle">Access your account to manage inventories</p>

        <form class="login-formm" id="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <div class="form-groupa">
            <label>
              Remember me
              <input type="checkbox" id="remember-me" name="rememberMe">
            </label>
          </div>
          
          <button type="submit" class="btn btn-primary btn-full">Log In</button>
        </form>
        
        <div class="login-span">
          <p>or continue with</p>
        </div>
        
        <div class="social-login">
          <button class="btn btn-social btn-google" id="google-login">
            <img src="/assets/icongoogle.png" alt="Google" class="social-icon">
            Google
          </button>
          <button class="btn btn-social btn-facebook" id="facebook-login">
            <img src="/assets/iconfacebook2.png" alt="Facebook" class="social-icon">
            Facebook
          </button>
        </div>
        
        <div class="login-footer">
          <p>Don't have an account? <a href="/register" data-navigate="/register">Sign Up</a></p>
        </div>
      </div>
    </div>
  `;
}

// Initialize login page functionality
export function initializeLogin() {
  const form = document.getElementById('login-form') as HTMLFormElement;
  const googleBtn = document.getElementById('google-login') as HTMLButtonElement;
  const facebookBtn = document.getElementById('facebook-login') as HTMLButtonElement;
  const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
  const apiService = ApiService.getInstance();
  const authService = AuthService.getInstance();

  UIUtils.handleOAuthCallback();

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("al clickear el boton")
    if (!submitBtn) return;
    
    const formData = new FormData(form);
    const credentials: LoginRequest = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      rememberMe: formData.get('rememberMe') === 'on'
    };

    // Validate form using Zod schema
    try {
      const validatedData = LoginSchema.parse({
        email: credentials.email,
        password: credentials.password
      });
      credentials.email = validatedData.email;
      credentials.password = validatedData.password;
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        UIUtils.showMessage(firstError.message, 'error');
      } else {
        UIUtils.showMessage('Please check your input data.', 'error');
      }
      return;
    }
    try {
      console.log("antes de llamar al api")
      const response = await apiService.login(credentials);
      if (response.user) {
        authService.setUser(response.user);
        Router.navigate('/');
        return;
      } else {
        UIUtils.showMessage('Login failed. Please check your credentials.', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      UIUtils.showMessage(errorMessage, 'error');
    }
  });
  
  // Google OAuth login
  googleBtn?.addEventListener('click', () => {
    UIUtils.showLoading(googleBtn, 'Redirecting...');
    
    try {
      apiService.loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      UIUtils.showMessage('Failed to initiate Google login. Please try again.', 'error');
      UIUtils.hideLoading(googleBtn, 'Google');
    }
  });
  
  // Facebook OAuth login
  facebookBtn?.addEventListener('click', () => {
    UIUtils.showLoading(facebookBtn, 'Redirecting...');
    
    try {
      apiService.loginWithFacebook();
    } catch (error) {
      console.error('Facebook login error:', error);
      UIUtils.showMessage('Failed to initiate Facebook login. Please try again.', 'error');
      UIUtils.hideLoading(facebookBtn, 'Facebook');
    }
  });
}
