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

    const route = this.routes.find(r => r.path === path) || this.routes.find(r => r.path === '/404');
    
    if (route) {
      document.title = `${route.title} - ToryApp`;
      this.render(route);
    }
  }

  private render(route: Route) {
    const appEl = document.getElementById('app')!;
    appEl.innerHTML = route.component();

    this.attachEventListeners();
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
  
  getCurrentPath() {
    return this.currentPath;
  }
}