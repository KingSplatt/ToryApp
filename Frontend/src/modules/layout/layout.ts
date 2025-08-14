// Main layout component with navigation
export function createLayout(content: string, currentPath: string) {
  return `
    <nav class="navbar">
      <div class="nav-brand">
        <a href="/" data-navigate="/">ToryApp</a>
        <button class="btn btn-theme" id="theme-toggle">🌙</button>
        <button class="btn btn-lang" id="lang-toggle">ES</button>
      </div>
      <div class="nav-links">
        <a href="/" data-navigate="/" class="${currentPath === '/' ? 'active' : ''}">Inicio</a>
        <a href="/inventories" data-navigate="/inventories" class="${currentPath === '/inventories' ? 'active' : ''}">Inventarios</a>
        <a href="/search" data-navigate="/search" class="${currentPath === '/search' ? 'active' : ''}">Buscar</a>
        <a href="/profile" data-navigate="/profile" class="${currentPath === '/profile' ? 'active' : ''}">Perfil</a>
      </div>
      <div class="nav-tools">
        <a href="/logout" data-navigate="/logout" class="btn btn-secondary"><i class="fa-solid fa-arrow-right-from-bracket"></i> </a>
        <a href="/login" data-navigate="/login" class="btn btn-success">Log in</a>
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
