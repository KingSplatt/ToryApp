// Login page component
export function loginPage() {
  return `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Iniciar Sesión</h2>
        <p class="auth-subtitle">Accede a tu cuenta para gestionar inventarios</p>
        
        <form class="auth-form" id="login-form">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <button type="submit" class="btn btn-primary btn-full">Iniciar Sesión</button>
        </form>
        
        <div class="auth-divider">
          <span>o continúa con</span>
        </div>
        
        <div class="social-auth">
          <button class="btn btn-social btn-google" id="google-login">
            <span class="social-icon">🔍</span>
            Google
          </button>
          <button class="btn btn-social btn-facebook" id="facebook-login">
            <span class="social-icon">📘</span>
            Facebook
          </button>
        </div>
        
        <div class="auth-footer">
          <p>¿No tienes cuenta? <a href="/register" data-navigate="/register">Regístrate</a></p>
          <p><a href="/forgot-password" data-navigate="/forgot-password">¿Olvidaste tu contraseña?</a></p>
        </div>
      </div>
    </div>
  `;
}

// Initialize login page functionality
export function initializeLogin() {
  const form = document.getElementById('login-form') as HTMLFormElement;
  const googleBtn = document.getElementById('google-login');
  const facebookBtn = document.getElementById('facebook-login');
  
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    console.log('Login attempt:', { email, password });
    // TODO: Implement actual login logic
    alert('Login functionality will be implemented with backend');
  });
  
  googleBtn?.addEventListener('click', () => {
    console.log('Google login clicked');
    // TODO: Implement Google OAuth
    alert('Google OAuth will be implemented');
  });
  
  facebookBtn?.addEventListener('click', () => {
    console.log('Facebook login clicked');
    // TODO: Implement Facebook OAuth
    alert('Facebook OAuth will be implemented');
  });
}
