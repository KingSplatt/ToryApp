import { Router } from './modules/router/router';
import { createLayout, initializeTheme, initializeLanguage, initializeLayout } from './modules/layout/layout';
import { homePage, initializeHome } from './modules/home/home';
import { loginPage, initializeLogin } from './modules/login/views/login';
import { inventoriesPage, initializeInventories } from './modules/inventories/inventories';
import { searchPage, initializeSearch } from './modules/search/search';
import { profilePage, initializeProfile } from './modules/profile/profile';
import { AuthService } from './modules/login/services/auth';

// Initialize router
const router = new Router();

// Define routes
router.addRoute({
  path: '/',
  title: 'Home',
  component: () => {
    const content = homePage();
    setTimeout(initializeHome, 0);
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/login',
  title: 'Log In',
  component: () => {
    const content = loginPage();
    setTimeout(initializeLogin, 0);
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/inventories',
  title: 'Inventories',
  component: () => {
    const content = inventoriesPage();
    setTimeout(initializeInventories, 0);
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/search',
  title: 'Search',
  component: () => {
    const content = searchPage();
    setTimeout(initializeSearch, 0);
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/profile',
  title: 'Profile',
  component: () => {
    const content = profilePage();
    setTimeout(initializeProfile, 0);
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/logout',
  title: 'Logout',
  component: () => {
    // Handle logout in the background
    const authService = AuthService.getInstance();
    authService.logout().then(() => {
      router.navigate('/');
    });
    
    return createLayout(`
      <div class="page-header">
        <h1>Cerrando sesión...</h1>
        <p>Por favor espera mientras cerramos tu sesión.</p>
      </div>
    `, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/404',
  title: 'Page not found',
  component: () => {
    const content = `
      <div class="error-page">
        <h1>404 - Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <a href="/" data-navigate="/" class="btn btn-primary">Volver al inicio</a>
      </div>
    `;
    return createLayout(content, router.getCurrentPath());
  }
});

// Initialize app
async function initializeApp() {
  // Initialize authentication service first
  const authService = AuthService.getInstance();
  await authService.initialize();

  // Initialize layout with auth state management
  initializeLayout();

  // Initialize theme and language management
  setTimeout(() => {
    initializeTheme();
    initializeLanguage();
  }, 0);
  
  // Check for OAuth success/error parameters
  const urlParams = new URLSearchParams(window.location.search);
  console.log('URL Params:', urlParams.toString());
  console.log('Current URL:', window.location.href);
  
  const loginStatus = urlParams.get('login');
  const error = urlParams.get('error');
  const newUser = urlParams.get('new_user');
  
  console.log('Login Status:', loginStatus);
  console.log('Error:', error);
  console.log('New User:', newUser);

  if (loginStatus === 'success') {
    // Clean URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Show success message
    if (newUser === 'true') {
      console.log('Account created and login successful!');
    } else {
      console.log('Login successful!');
    }
    
    // Navigate to home
    router.navigate('/');
    return;
  } else if (error) {
    // Clean URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Show error message and redirect to login
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
    router.navigate('/login');
    return;
  }
  
  // Normal app initialization
  if (authService.isAuthenticated()) {
    router.navigate('/');
  } else {
    router.navigate('/');
  }
}

// Bootstrap the application
initializeApp();
