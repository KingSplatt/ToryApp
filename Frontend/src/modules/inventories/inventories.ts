// Inventories listing page
export function inventoriesPage() {
  return `
    <div class="inventories-container">
      <div class="page-header">
        <h1>Inventarios</h1>
        <div class="page-actions">
          <button class="btn btn-primary" id="create-inventory">Crear Inventario</button>
        </div>
      </div>
      
      <div class="filters-bar">
        <div class="filter-group">
          <label for="category-filter">Categoría:</label>
          <select id="category-filter">
            <option value="">Todas</option>
            <option value="electronica">Electrónica</option>
            <option value="herramientas">Herramientas</option>
            <option value="libros">Libros</option>
            <option value="hogar">Hogar</option>
            <option value="coleccion">Colección</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="sort-filter">Ordenar por:</label>
          <select id="sort-filter">
            <option value="recent">Más recientes</option>
            <option value="popular">Más populares</option>
            <option value="name">Nombre A-Z</option>
            <option value="items">Número de elementos</option>
          </select>
        </div>
        
        <div class="filter-group">
          <input type="search" id="search-inventories" placeholder="Buscar inventarios...">
        </div>
      </div>
      
      <div class="inventories-grid" id="inventories-list">
        <!-- Inventories will be loaded here -->
      </div>
      
      <div class="pagination" id="pagination">
        <!-- Pagination will be added here -->
      </div>
    </div>
  `;
}

export function initializeInventories() {
  loadInventories();
  setupFilters();
  setupCreateButton();
}

async function loadInventories() {
  const container = document.getElementById('inventories-list');
  if (!container) return;
  
  // Mock data
  const mockInventories = [
    {
      id: 1,
      title: 'Libros de Programación',
      description: 'Colección de libros técnicos y manuales de programación',
      category: 'Educación',
      itemCount: 25,
      isPublic: true,
      owner: 'usuario1',
      lastUpdated: '2025-08-10',
      tags: ['programación', 'libros', 'técnico']
    },
    {
      id: 2,
      title: 'Herramientas de Taller',
      description: 'Inventario completo de herramientas para carpintería',
      category: 'Herramientas',
      itemCount: 18,
      isPublic: false,
      owner: 'usuario2',
      lastUpdated: '2025-08-12',
      tags: ['herramientas', 'carpintería', 'taller']
    },
    {
      id: 3,
      title: 'Equipo de Fotografía',
      description: 'Cámaras, lentes y accesorios fotográficos',
      category: 'Electrónicos',
      itemCount: 12,
      isPublic: true,
      owner: 'usuario3',
      lastUpdated: '2025-08-11',
      tags: ['fotografía', 'cámaras', 'electrónicos']
    }
  ];
  
  container.innerHTML = mockInventories.map(inv => `
    <div class="inventory-card-full">
      <div class="inventory-header">
        <h3><a href="/inventory/${inv.id}" data-navigate="/inventory/${inv.id}">${inv.title}</a></h3>
        <div class="inventory-meta">
          <span class="access-type ${inv.isPublic ? 'public' : 'private'}">
            ${inv.isPublic ? '🌐 Público' : '🔒 Privado'}
          </span>
        </div>
      </div>
      
      <div class="inventory-content">
        <p class="inventory-description">${inv.description}</p>
        <div class="inventory-stats">
          <span class="stat">📦 ${inv.itemCount} elementos</span>
          <span class="stat">📂 ${inv.category}</span>
          <span class="stat">👤 ${inv.owner}</span>
          <span class="stat">📅 ${new Date(inv.lastUpdated).toLocaleDateString()}</span>
        </div>
        <div class="inventory-tags">
          ${inv.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      
      <div class="inventory-actions">
        <a href="/inventory/${inv.id}" data-navigate="/inventory/${inv.id}" class="btn btn-sm">Ver</a>
        <button class="btn btn-sm btn-secondary" onclick="shareInventory(${inv.id})">Compartir</button>
      </div>
    </div>
  `).join('');
}

function setupFilters() {
  const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;
  const sortFilter = document.getElementById('sort-filter') as HTMLSelectElement;
  const searchInput = document.getElementById('search-inventories') as HTMLInputElement;
  
  categoryFilter?.addEventListener('change', () => {
    console.log('Category filter changed:', categoryFilter.value);
    // TODO: Implement filtering logic
  });
  
  sortFilter?.addEventListener('change', () => {
    console.log('Sort filter changed:', sortFilter.value);
    // TODO: Implement sorting logic
  });
  
  searchInput?.addEventListener('input', debounce(() => {
    console.log('Search input:', searchInput.value);
    // TODO: Implement search logic
  }, 300));
}

function setupCreateButton() {
  const createBtn = document.getElementById('create-inventory');
  createBtn?.addEventListener('click', () => {
    // TODO: Navigate to create inventory page or show modal
    alert('Create inventory functionality will be implemented');
  });
}

// Utility function for debouncing
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Global function for sharing
(window as any).shareInventory = function(id: number) {
  console.log('Sharing inventory:', id);
  // TODO: Implement share functionality
  alert(`Share inventory ${id} functionality will be implemented`);
};
