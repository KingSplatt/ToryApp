export type Route = {
  path: string;
  title: string;
  component: () => string;
  requiresAuth?: boolean;
};

export class Router {
  private static instance: Router;
  private routes: Route[] = [];
  private currentPath = '/';

  constructor() {
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });
  }

  static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  static navigate(path: string, pushState = true): void {
    const instance = Router.getInstance();
    instance.navigate(path, pushState);
  }

  static getCurrentPath(): string {
    const instance = Router.getInstance();
    return instance.getCurrentPath();
  }

  static addRoute(route: Route): void {
    const instance = Router.getInstance();
    instance.addRoute(route);
  }

  addRoute(route: Route) {
    this.routes.push(route);
  }

  navigate(path: string, pushState = true) {
    this.currentPath = path;
    
    if (pushState) {
      window.history.pushState({}, '', path);
    }

    // Find exact match first, then try pattern matching
    let route = this.routes.find(r => r.path === path);
    
    if (!route) {
      // Try pattern matching for routes with parameters
      route = this.routes.find(r => {
        if (r.path.includes(':')) {
          const pattern = r.path.replace(/:([^/]+)/g, '([^/]+)');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(path);
        }
        return false;
      });
    }
    
    // Fallback to 404
    if (!route) {
      route = this.routes.find(r => r.path === '/404');
    }
    
    if (route) {
      document.title = `${route.title} - ToryApp`;
      this.render(route);
    }
  }

  private render(route: Route) {
    const appEl = document.getElementById('app')!;
    appEl.innerHTML = route.component();

    this.attachEventListeners();
    this.initializePageFeatures();
  }

  private attachEventListeners() {
    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const path = (e.target as HTMLElement).getAttribute('data-navigate')!;
        this.navigate(path);
      });
    });
  }

  private initializePageFeatures() {
    // Import and initialize layout features after DOM is ready
    import('../layout/layout').then(({ initializeLayout }) => {
      initializeLayout();
    }).catch(error => {
      console.error('Failed to initialize layout features:', error);
    });
  }

  getParams() {
    // Find the route that matches the current path
    const route = this.routes.find(r => {
      if (r.path.includes(':')) {
        const pattern = r.path.replace(/:([^/]+)/g, '([^/]+)');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(this.currentPath);
      }
      return r.path === this.currentPath;
    });

    if (!route || !route.path.includes(':')) {
      return {};
    }

    // Extract parameter names and values
    const paramNames = route.path.match(/:([^/]+)/g)?.map(p => p.substring(1)) || [];
    const pattern = route.path.replace(/:([^/]+)/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    const values = this.currentPath.match(regex)?.slice(1) || [];

    const params: Record<string, string> = {};
    paramNames.forEach((name, index) => {
      params[name] = values[index] || '';
    });

    return params;
  }

  getCurrentPath() {
    return this.currentPath;
  }
}