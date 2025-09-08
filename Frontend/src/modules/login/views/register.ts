import '../styles/register.css'
import { Router } from "../../router/router";
import { ApiService } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { RegisterRequest } from '../../../interfaces/RegisterRequestInterface';
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
            <div class="password-requirements" id="password-requirements" style="display: none;">
              <p class="requirements-title">Password must contain:</p>
              <ul class="requirements-list">
                <li id="req-length" class="requirement">
                  <span class="requirement-icon">✗</span>
                  <span class="requirement-text">At least 4 characters</span>
                </li>
                <li id="req-digit" class="requirement">
                  <span class="requirement-icon">✗</span>
                  <span class="requirement-text">At least 1 number</span>
                </li>
                <li id="req-uppercase" class="requirement">
                  <span class="requirement-icon">✗</span>
                  <span class="requirement-text">At least 1 uppercase letter</span>
                </li>
                <li id="req-lowercase" class="requirement">
                  <span class="requirement-icon">✗</span>
                  <span class="requirement-text">At least 1 lowercase letter</span>
                </li>
                <li id="req-special" class="requirement">
                  <span class="requirement-icon">✗</span>
                  <span class="requirement-text">At least 1 special character</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirm Password:</label>
            <input type="password" id="confirm-password" name="confirm-password" required />
            <div class="password-match" id="password-match" style="display: none;">
              <span class="match-icon">✗</span>
              <span class="match-text">Passwords must match</span>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full" id="register-btn" disabled>Register</button>
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
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
  const submitButton = document.getElementById('register-btn') as HTMLButtonElement;
  const apiService = ApiService.getInstance();
  const authService = AuthService.getInstance();

  authService.onAuthStateChanged((user) => {
    if (user) {
      console.log('User already authenticated:', user);
      Router.navigate('/');
      return;
    }
  });

  // Show password requirements when user starts typing
  passwordInput.addEventListener('focus', () => {
    const requirementsDiv = document.getElementById('password-requirements');
    if (requirementsDiv) {
      requirementsDiv.style.display = 'block';
    }
  });

  // Validate password in real time
  passwordInput.addEventListener('input', () => {
    validatePassword();
    validatePasswordMatch();
    updateSubmitButton();
  });

  // Validate password match in real time
  confirmPasswordInput.addEventListener('input', () => {
    validatePasswordMatch();
    updateSubmitButton();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    
    if (!isPasswordValid(password)) {
      UIUtils.showMessage('Please ensure all password requirements are met.', 'error');
      return;
    }
    
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

  function validatePassword() {
    const password = passwordInput.value;
    const requirements = {
      length: password.length >= 4,
      digit: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    updateRequirement('req-length', requirements.length);
    updateRequirement('req-digit', requirements.digit);
    updateRequirement('req-uppercase', requirements.uppercase);
    updateRequirement('req-lowercase', requirements.lowercase);
    updateRequirement('req-special', requirements.special);
  }

  function validatePasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const matchDiv = document.getElementById('password-match');
    
    if (confirmPassword.length > 0) {
      if (matchDiv) {
        matchDiv.style.display = 'block';
      }
      
      const isMatch = password === confirmPassword;
      updatePasswordMatch(isMatch);
    } else {
      if (matchDiv) {
        matchDiv.style.display = 'none';
      }
    }
  }

  function updateRequirement(id: string, isValid: boolean) {
    const requirement = document.getElementById(id);
    if (requirement) {
      const icon = requirement.querySelector('.requirement-icon') as HTMLElement;
      if (icon) {
        icon.textContent = isValid ? '✓' : '✗';
        icon.style.color = isValid ? '#28a745' : '#dc3545';
      }
      requirement.style.color = isValid ? '#28a745' : '#dc3545';
    }
  }

  function updatePasswordMatch(isMatch: boolean) {
    const matchDiv = document.getElementById('password-match');
    if (matchDiv) {
      const icon = matchDiv.querySelector('.match-icon') as HTMLElement;
      const text = matchDiv.querySelector('.match-text') as HTMLElement;
      
      if (icon) {
        icon.textContent = isMatch ? '✓' : '✗';
        icon.style.color = isMatch ? '#28a745' : '#dc3545';
      }
      
      if (text) {
        text.textContent = isMatch ? 'Passwords match' : 'Passwords must match';
      }
      
      matchDiv.style.color = isMatch ? '#28a745' : '#dc3545';
    }
  }

  function isPasswordValid(password: string): boolean {
    return password.length >= 4 &&
           /\d/.test(password) &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[^A-Za-z0-9]/.test(password);
  }

  function updateSubmitButton() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const isPasswordOk = isPasswordValid(password);
    const isMatchOk = password === confirmPassword && confirmPassword.length > 0;
    
    submitButton.disabled = !(isPasswordOk && isMatchOk);
  }
}
