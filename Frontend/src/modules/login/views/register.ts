import '../styles/register.css'
import { Router } from "../../router/router";
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth';
import { RegisterRequest } from '../interfaces/RegisterRequestInterface';
import { UIUtils } from '../../utils/ui';


export function Register() {
  return `
    <div class="login-container">
      <div class="login-card">
        <h2>Create your account</h2>
        <form id="register-form">
          <div class="form-group">
            <label for="fullName">Full Name:</label>
            <input type="text" id="fullName" name="fullName" required />
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirm Password:</label>
            <input type="password" id="confirm-password" name="confirm-password" required />
          </div>
          <button type="submit" class="btn btn-primary btn-full">Register</button>
        <div class="login-footer">
          <p>Have an account? join here! <a href="/login" data-navigate="/login">Log In</a></p>
        </div>
        </form>
      </div>
    </div>
  `;
}

export function initializeRegisterForm() {
  const form = document.getElementById('register-form') as HTMLFormElement;
  const apiService = ApiService.getInstance();
  const authService = AuthService.getInstance();

  authService.onAuthStateChanged((user) => {
    if (user) {
      console.log('User already authenticated:', user);
      Router.navigate('/');
      return;
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    if (password !== confirmPassword) {
      UIUtils.showMessage('Passwords do not match.', 'error');
      return;
    }
  
    const userData: RegisterRequest = {
      email: formData.get('email') as string,
      fullName: formData.get('fullName') as string,
      password: password,
    };
    
    try {
      const response = await apiService.register(userData);
      UIUtils.showModalForMessages('Registration successful! Redirecting...');
      setTimeout(() => {
        Router.navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  });
}
