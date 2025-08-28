import { AuthService } from "../login/services/auth";
import { User } from "../login/interfaces/UserInterface";
import { UIUtils } from "../utils/ui";
import "./layout.css"

export function createLayout(content: string, currentPath: string) {
  const isAdmin = UIUtils.isAdmin();
  const authService = AuthService.getInstance();
  const currentUser = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();
  const isBlocked = authService.isBlocked();
  console.log(currentUser)
  console.log('isAuthenticated at layout:', isAuthenticated);
  console.log('isBlocked at layout:', isBlocked);

  if (isAuthenticated && isBlocked) {
    console.log('Rendering blocked user message');
    return `
      <nav class="navbar">
        <div class="nav-brand">
          <a href="/" data-navigate="/">ToryApp</a>
          <button class="btn btn-theme" id="theme-toggle">🌙</button>
          <button class="btn btn-lang" id="lang-toggle">ES</button>
        </div>
        <div class="nav-tools">
          <a href="/logout" data-navigate="/logout" class="btn btn-secondary">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Log outs
          </a>
        </div>
      </nav>
      <main class="main-content">
        <div class="blocked-user-message">
          <div class="alert alert-danger">
            <h2>🚫 Account Blocked</h2>
            <p>Your account has been blocked. You cannot access the application's features.</p>
            <p>If you believe this is an error, please contact the administrator.</p>
            <p><strong>User:</strong> ${currentUser?.fullName}</p>
            <p><strong>Blocked Since:</strong> ${currentUser?.blockedAt ? new Date(currentUser.blockedAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </main>
    `;
  }

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
        ${isAdmin ? `
          <a href="/adminMan" data-navigate="/adminMan" class="btn btn-primary">🔧</a>
        ` : ''}
        ${isAuthenticated && !isBlocked ? `
          <div class="user-info-nav">
            <span class="user-welcome">Welcome, ${currentUser?.fullName} </span>
          </div>
          <a href="/logout" data-navigate="/logout" class="btn btn-secondary">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </a>
        ` : `
          <a href="/login" data-navigate="/login" class="btn btn-success">Log in</a>
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
    const button = themeToggle as HTMLButtonElement;
    button.textContent = newTheme === 'light' ? '🌙' : '☀️';
  });
}

// Initialize layout with auth state management
export function initializeLayout() {
  const authService = AuthService.getInstance();
}

// Attach navigation event listeners
function attachNavigationListeners() {
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
    
    const button = langToggle as HTMLButtonElement;
    button.textContent = newLang.toUpperCase();
    
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