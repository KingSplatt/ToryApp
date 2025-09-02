export class Theme {
  private static instance: Theme;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): Theme {
    if (!Theme.instance) {
      Theme.instance = new Theme();
    }
    return Theme.instance;
  }

  static setTheme(theme: 'light' | 'dark') {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const themeButton = document.getElementById('theme-toggle') as HTMLButtonElement;
    if (themeButton) {
      themeButton.textContent = theme === 'light' ? '🌙' : '☀️';
    }
  }

  static getTheme(): 'light' | 'dark' {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return savedTheme || systemTheme;
  }

  static toggleTheme(): 'light' | 'dark' {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }

  static initializeTheme() {
    const instance = Theme.getInstance();
    const theme = this.getTheme();
    this.setTheme(theme);
    
    if (!instance.isInitialized) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
      instance.isInitialized = true;
    }
  }

  static attachThemeButton() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const newButton = themeToggle.cloneNode(true) as HTMLButtonElement;
      themeToggle.parentNode?.replaceChild(newButton, themeToggle);
      const currentTheme = this.getTheme();
      newButton.textContent = currentTheme === 'light' ? '🌙' : '☀️';

      newButton.addEventListener('click', () => {
        const newTheme = this.toggleTheme();
        console.log('Theme switched to:', newTheme);
      });
    }
  }
}

export function setTheme(theme: 'light' | 'dark') {
  Theme.setTheme(theme);
}

export function toggleTheme(): 'light' | 'dark' {
  return Theme.toggleTheme();
}

export function getTheme(): 'light' | 'dark' {
  return Theme.getTheme();
}

export function initializeTheme() {
  Theme.initializeTheme();
  Theme.attachThemeButton();
}

