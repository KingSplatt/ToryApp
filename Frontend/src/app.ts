import { Router } from './modules/router/router';
import { createLayout, initializeTheme, initializeLanguage } from './modules/layout/layout';
import { homePage, initializeHome } from './modules/home/home';
import { loginPage, initializeLogin } from './modules/login/login';
import { inventoriesPage, initializeInventories } from './modules/inventories/inventories';
import { searchPage, initializeSearch } from './modules/search/search';

// Initialize router
const router = new Router();

// Define routes
router.addRoute({
  path: '/',
  title: 'Inicio',
  component: () => {
    const content = homePage();
    setTimeout(initializeHome, 0);
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/login',
  title: 'Iniciar Sesión',
  component: () => {
    const content = loginPage();
    setTimeout(initializeLogin, 0);
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/inventories',
  title: 'Inventarios',
  component: () => {
    const content = inventoriesPage();
    setTimeout(initializeInventories, 0);
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/search',
  title: 'Buscar',
  component: () => {
    const content = searchPage();
    setTimeout(initializeSearch, 0);
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/profile',
  title: 'Perfil',
  component: () => {
    const content = '<div class="page-header"><h1>Perfil de Usuario</h1><p>Esta página será implementada próximamente</p></div>';
    return createLayout(content, router.getCurrentPath());
  }
});

router.addRoute({
  path: '/404',
  title: 'Página no encontrada',
  component: () => {
    const content = `
      <div class="error-page">
        <h1>404 - Página no encontrada</h1>
        <p>La página que buscas no existe.</p>
        <a href="/" data-navigate="/" class="btn btn-primary">Volver al inicio</a>
      </div>
    `;
    return createLayout(content, router.getCurrentPath());
  }
});

// Initialize app
function initializeApp() {
  // Initialize theme and language management
  setTimeout(() => {
    initializeTheme();
    initializeLanguage();
  }, 0);
  
  // Start routing
  router.navigate(window.location.pathname, false);
}

// Bootstrap the application
initializeApp();
