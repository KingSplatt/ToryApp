import { Router } from './modules/router/router';
import { createLayout, initializeTheme, initializeLanguage, initializeLayout } from './modules/layout/layout';
import { homePage, initializeHome } from './modules/home/home';
import { loginPage, initializeLogin } from './modules/login/views/login';
import { inventoriesPage, initializeInventories } from './modules/inventories/inventories';
import { searchPage, initializeSearch } from './modules/search/search';
import { profilePage, initializeProfile } from './modules/profile/profile';
import { AuthService } from './modules/login/services/auth';
import { Register } from './modules/login/views/register';
import { adminPage, initAdminPage } from './modules/admin/views/admin';
import { initializeRegisterForm } from './modules/login/views/register';
import { UIUtils } from './modules/utils/ui';

const router = Router.getInstance();

// Routes
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
  path: '/register',
  title: 'Register',
  component: () => {
    const content = Register();
    setTimeout(initializeRegisterForm, 0);
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
  path: '/adminMan',
  title: 'Admin Panel',
  component: () => {
    const content = adminPage();
    setTimeout(initAdminPage, 100);
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
  const authService = AuthService.getInstance();
  await authService.initialize();

  initializeLayout();
  setTimeout(() => {
    initializeTheme();
    initializeLanguage();
  }, 0);
  
  const urlParams = new URLSearchParams(window.location.search);
  const loginStatus = urlParams.get('login');
  const error = urlParams.get('error');
  const blockedAt = urlParams.get('blockedAt');
  
  if (error) {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (error === 'account_blocked') {
      const blockedMessage = blockedAt 
        ? `Your account was blocked on ${new Date(blockedAt).toLocaleDateString()}.`
        : 'Your account has been blocked.';
      UIUtils.showMessage(`Access denied. ${blockedMessage} Please contact support.`, 'error');
    } else {
      UIUtils.handleErrorOAuth(error);
    }
    router.navigate('/login');
    initializeLayout();
    return;
  }
  
  if (loginStatus === 'success') {
    const user = authService.getUser();
    if (user && user.isBlocked) {
      await authService.logout();
      const blockedMessage = user.blockedAt 
        ? `Your account was blocked on ${new Date(user.blockedAt).toLocaleDateString()}.`
        : 'Your account has been blocked.';
      UIUtils.showMessage(`Access denied. ${blockedMessage} Please contact support.`, 'error');
      router.navigate('/login');
      initializeLayout();
      return;
    }
    
    router.navigate('/');
    initializeLayout();
    return;
  }
  
  if (authService.isAuthenticated()) {
    if (authService.isBlocked()) {
      const user = authService.getUser();
      const blockedMessage = user?.blockedAt 
        ? `Your account was blocked on ${new Date(user.blockedAt).toLocaleDateString()}.`
        : 'Your account has been blocked.';
      UIUtils.showMessage(`Access denied. ${blockedMessage} Please contact support.`, 'error');
      await authService.logout();
      router.navigate('/login');
      initializeLayout();
      return;
    }
    router.navigate('/');
  } else {
    router.navigate('/');
  }
}

initializeApp();