import { AuthService } from "../login/services/auth";
import { User } from "../login/interfaces/UserInterface";
import { UIUtils } from "../utils/ui";
import { Theme } from "../utils/theme";
import { Language } from "../utils/language";
import "./layout.css"

export function createLayout(content: string, currentPath: string) {
  const isAdmin = UIUtils.isAdmin();
  const authService = AuthService.getInstance();
  const currentUser = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();
  const isBlocked = authService.isBlocked();

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
      ${loadFooter()}
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
          <a href="/logout" data-navigate="/logout" class="btn btn-secondary ">
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
    ${loadFooter()}
  `;
}

export function initializeTheme() {
  Theme.initializeTheme();
  Theme.attachThemeButton();
}

export function initializeLayout() {
  const authService = AuthService.getInstance();
  initializeTheme();
  initializeLanguage();
  attachNavigationListeners();
  attachFooterListeners();
}

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

function attachFooterListeners() {
  const footerLinks = document.querySelectorAll('.footer a[data-navigate]');
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('data-navigate');
      if (href) {
        window.history.pushState({}, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  });
}

export function initializeLanguage() {
}

function loadFooter(){
  return `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>ToryApp</h4>
          <p>ToryApp is your solution for managing inventories with ease.
          Developed by <a href="https://github.com/KingSplatt" target="_blank">Splatt</a>
          </p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/" data-navigate="/">Home</a></li>
            <li><a href="/inventories" data-navigate="/inventories">Inventories</a></li>
            <li><a href="/search" data-navigate="/search">Search</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contact Me</h4>
          <div class="social-links">
            <a href="https://www.facebook.com/miguel.lopez.885937" target="_blank" title="Facebook">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="https://www.instagram.com/reels/DIr2CBrNQPS/" target="_blank" title="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/in/miguellopez17/" target="_blank" title="LinkedIn">
              <i class="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com/KingSplatt" target="_blank" title="GitHub">
              <i class="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ToryApp. All rights reserved.</p>
      </div>
    </footer>
  `;
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