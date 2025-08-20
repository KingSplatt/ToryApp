export type Route = {
  path: string;
  title: string;
  component: () => string;
  requiresAuth?: boolean;
};

export class Router {
  static navigate(arg0: string) {
    throw new Error('Method not implemented.');
  }
  private routes: Route[] = [];
  private currentPath = '/';

  constructor() {
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });
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
    
    // Re-attach event listeners after DOM update
    this.attachEventListeners();
  }

  private attachEventListeners() {
    // Handle navigation links
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
