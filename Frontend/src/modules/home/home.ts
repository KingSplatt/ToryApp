// Home page component
export function homePage() {
  return `
    <div class="home-container">
      <section class="hero">
        <h1>Bienvenido a ToryApp</h1>
        <p>Gestiona tus inventarios de forma sencilla y colaborativa</p>
        <div class="hero-actions">
          <a href="/inventories" data-navigate="/inventories" class="btn btn-primary">Ver Inventarios</a>
          <a href="/login" data-navigate="/login" class="btn btn-secondary">Iniciar Sesión</a>
        </div>
      </section>
      
      <section class="featured-section">
        <div class="section-header">
          <h2>Inventarios Recientes</h2>
          <a href="/inventories" data-navigate="/inventories">Ver todos</a>
        </div>
        <div class="inventory-grid" id="recent-inventories">
          <!-- Dynamic content will be loaded here -->
        </div>
      </section>
      
      <section class="featured-section">
        <div class="section-header">
          <h2>Inventarios Populares</h2>
          <a href="/inventories?sort=popular" data-navigate="/inventories">Ver todos</a>
        </div>
        <div class="inventory-grid" id="popular-inventories">
          <!-- Dynamic content will be loaded here -->
        </div>
      </section>
      
      <section class="tags-section">
        <h2>Explorar por Tags</h2>
        <div class="tag-cloud" id="tag-cloud">
          <!-- Tags will be loaded dynamically -->
        </div>
      </section>
    </div>
  `;
}

// Initialize home page functionality
export function initializeHome() {
  loadRecentInventories();
  loadPopularInventories();
  loadTagCloud();
}

async function loadRecentInventories() {
  const container = document.getElementById('recent-inventories');
  if (!container) return;
  
  // Mock data - will be replaced with actual API calls
  const mockInventories = [
    { id: 1, title: 'Libros de Programación', category: 'Educación', itemCount: 25, image: null },
    { id: 2, title: 'Herramientas de Taller', category: 'Herramientas', itemCount: 18, image: null },
    { id: 3, title: 'Equipo de Fotografía', category: 'Electrónicos', itemCount: 12, image: null }
  ];
  
  container.innerHTML = mockInventories.map(inv => `
    <div class="inventory-card">
      <div class="inventory-image">
        ${inv.image ? `<img src="${inv.image}" alt="${inv.title}">` : '<div class="image-placeholder">📦</div>'}
      </div>
      <div class="inventory-info">
        <h3><a href="/inventory/${inv.id}" data-navigate="/inventory/${inv.id}">${inv.title}</a></h3>
        <p class="inventory-category">${inv.category}</p>
        <p class="inventory-count">${inv.itemCount} elementos</p>
      </div>
    </div>
  `).join('');
}

async function loadPopularInventories() {
  const container = document.getElementById('popular-inventories');
  if (!container) return;
  
  // Mock data
  const mockInventories = [
    { id: 4, title: 'Colección de Vinilos', category: 'Música', itemCount: 150, image: null },
    { id: 5, title: 'Plantas del Jardín', category: 'Jardinería', itemCount: 35, image: null }
  ];
  
  container.innerHTML = mockInventories.map(inv => `
    <div class="inventory-card">
      <div class="inventory-image">
        ${inv.image ? `<img src="${inv.image}" alt="${inv.title}">` : '<div class="image-placeholder">📦</div>'}
      </div>
      <div class="inventory-info">
        <h3><a href="/inventory/${inv.id}" data-navigate="/inventory/${inv.id}">${inv.title}</a></h3>
        <p class="inventory-category">${inv.category}</p>
        <p class="inventory-count">${inv.itemCount} elementos</p>
      </div>
    </div>
  `).join('');
}

async function loadTagCloud() {
  const container = document.getElementById('tag-cloud');
  if (!container) return;
  
  // Mock tags
  const mockTags = [
    { name: 'electrónicos', count: 45 },
    { name: 'libros', count: 32 },
    { name: 'herramientas', count: 28 },
    { name: 'vintage', count: 24 },
    { name: 'colección', count: 18 },
    { name: 'hogar', count: 15 },
    { name: 'oficina', count: 12 }
  ];
  
  container.innerHTML = mockTags.map(tag => `
    <a href="/search?tag=${tag.name}" data-navigate="/search?tag=${tag.name}" 
       class="tag-item" style="font-size: ${Math.min(2, 1 + tag.count / 20)}em">
      ${tag.name} (${tag.count})
    </a>
  `).join('');
}
