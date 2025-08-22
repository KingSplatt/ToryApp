import { AuthService } from "../login/services/auth";
import { User } from "../login/interfaces/UserInterface";

export function createLayout(content: string, currentPath: string) {
  const authService = AuthService.getInstance();
  const currentUser = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  return `
    <nav class="navbar">
      <div class="nav-brand">
        <a href="/" data-navigate="/">ToryApp</a>
        <button class="btn btn-theme" id="theme-toggle">🌙</button>
        <button class="btn btn-lang" id="lang-toggle">ES</button>
      </div>
      ${isAuthenticated ? `
      <div class="nav-links">
        <a href="/" data-navigate="/" class="${currentPath === '/' ? 'active' : ''}">Home</a>
        <a href="/inventories" data-navigate="/inventories" class="${currentPath === '/inventories' ? 'active' : ''}">Inventories</a>
        <a href="/search" data-navigate="/search" class="${currentPath === '/search' ? 'active' : ''}">Search</a>
        <a href="/profile" data-navigate="/profile" class="${currentPath === '/profile' ? 'active' : ''}">Profile</a>
      </div>
      ` : ''}
      <div class="nav-tools">
        ${isAuthenticated ? `
          <div class="user-info-nav">
            <span class="user-welcome">Bienvenido, ${currentUser?.fullName || currentUser?.email}</span>
          </div>
          <a href="/logout" data-navigate="/logout" class="btn btn-secondary">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar sesión
          </a>
        ` : `
          <a href="/login" data-navigate="/login" class="btn btn-success">Iniciar sesión</a>
        `}
      </div>
    </nav>
    <main class="main-content">
      ${content}
    </main>
  `;
}

// Theme and language management
export function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  themeToggle?.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update button icon
    const button = themeToggle as HTMLButtonElement;
    button.textContent = newTheme === 'light' ? '🌙' : '☀️';
  });
}

// Initialize layout with auth state management
export function initializeLayout() {
  const authService = AuthService.getInstance();
  
  // Listen for auth state changes and update layout accordingly
  authService.onAuthStateChanged((user) => {
    updateLayoutAuthState(user);
  });
}

// Update layout based on authentication state
function updateLayoutAuthState(user: User | null) {
  const navLinks = document.querySelector('.nav-links') as HTMLElement;
  const navTools = document.querySelector('.nav-tools') as HTMLElement;

  if (!navLinks) {
    console.log('Layout: navLinks not found, layout may not be rendered yet');
    return;
  }
  
  const isAuthenticated = user !== null;
  
  // Show/hide navigation links based on auth state
  if (navLinks) {
    navLinks.style.display = isAuthenticated ? 'flex' : 'none';
  }
  
  // Update nav tools content
  const newContent = isAuthenticated ? `
    <div class="user-info-nav">
      <span class="user-welcome">Bienvenido, ${user?.fullName || user?.email}</span>
    </div>
    <a href="/logout" data-navigate="/logout" class="btn btn-secondary">
      <i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar sesión
    </a>
  ` : `
    <a href="/login" data-navigate="/login" class="btn btn-success">Iniciar sesión</a>
  `;
  
  navTools.innerHTML = newContent;
  
  // Re-attach navigation event listeners
  attachNavigationListeners();
}

// Attach navigation event listeners
function attachNavigationListeners() {
  // Re-attach logout handler
  const logoutLink = document.querySelector('a[data-navigate="/logout"]');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const authService = AuthService.getInstance();
      await authService.logout();
      // Navigate to home after logout
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }
}

export function initializeLanguage() {
  const langToggle = document.getElementById('lang-toggle');
  const currentLang = localStorage.getItem('language') || 'es';
  
  langToggle?.addEventListener('click', () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('language', newLang);
    
    // Update button text
    const button = langToggle as HTMLButtonElement;
    button.textContent = newLang.toUpperCase();
    
    // Here you would implement actual language switching
    console.log('Language switched to:', newLang);
  });
}

export function userAtLayout() {
  const user = AuthService.getInstance().getUser();
  const userInfo = user ? `
    <div class="user-info">
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Full Name:</strong> ${user.fullName}</p>
    </div>
  ` : '<p>User not logged in</p>';

  return `
    <div class="user-layout">
      <h2>User Information</h2>
      ${userInfo}
    </div>
  `;
}