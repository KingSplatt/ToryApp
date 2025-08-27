import "./inventories.css"
import { categories } from "../additions/categoriesContainer";
import { customFields } from "../additions/customFields";

const categoriesField = categories
const additionalFields = customFields

export function inventoriesPage() {
  return `
    <div class="inventories-container">
      <div class="page-header">
        <h1>Inventories</h1>
        <div class="page-actions">
          <button class="btn btn-primary" id="create-inventory">Create Inventory</button>
        </div>
      </div>
      
      <div class="filters-bar">
        <div class="filter-group">
          <label for="category-filter">Category:</label>
          <select id="category-filter">
            <option value="">All</option>
            ${categoriesField.map(category => `
              <option value="${category.id}">${category.name}</option>
            `).join('')}
          </select>
        </div>

        <div class="filter-group">
          <label for="subcategory-filter">Subcategoría:</label>
          <select id="subcategory-filter">
            <option value="">Todas</option>
            ${categoriesField.map(category => `
              <option value="${category.id}">${category.name}</option>
            `).join('')}
          </select>
        </div>

        <div class="filter-group">
          <label for="sort-filter">Ordenar por:</label>
          <select id="sort-filter">
            <option value="recent">Más recientes</option>
            <option value="popular">Más populares</option>
            <option value="name">Nombre A-Z</option>
            <option value="others">Others</option>
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
    
    <!-- Modal para crear inventario -->
    <div id="modal-new-inventory" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create Inventory</h2>
          <button class="modal-close" id="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="create-inventory-form">
            <div class="form-group">
              <label for="inventory-title">Title *</label>
              <input type="text" id="inventory-title" name="title" required placeholder="E.g. Books">
            </div>
            
            <div class="form-group">
              <label for="inventory-description">Description</label>
              <textarea id="inventory-description" name="description" placeholder="Describe your inventory..."></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="inventory-category">Category</label>
                <select id="inventory-category" name="category">
                  <option value="">Select a category</option>
                  ${categoriesField.map(category => `
                    <option value="${category.id}">${category.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>
            
            <div class="checkbox-group">
              <input type="checkbox" id="inventory-public" name="isPublic">
              <label for="inventory-public">Is public</label>
            </div>
            
            <div class="form-group">
              <label for="inventory-tags">Tags (separated by commas)</label>
              <input type="text" id="inventory-tags" name="tags" placeholder="vintage, home, professional">
            </div>

            <div class="form-group">
              <label for="inventory-fields">Additional Fields</label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-create">Cancel</button>
          <button type="submit" class="btn btn-primary" id="save-inventory">Create Inventory</button>
        </div>
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
  const modalNewInventory = document.getElementById('modal-new-inventory');
  const closeModalBtn = document.getElementById('close-modal');
  const cancelBtn = document.getElementById('cancel-create');
  const saveBtn = document.getElementById('save-inventory');
  const form = document.getElementById('create-inventory-form') as HTMLFormElement;
  createBtn?.addEventListener('click', () => {
    modalNewInventory?.classList.add('is-active');
  });
  closeModalBtn?.addEventListener('click', () => {
    closeModal();
  });
  cancelBtn?.addEventListener('click', () => {
    closeModal();
  });
  modalNewInventory?.addEventListener('click', (e) => {
    if (e.target === modalNewInventory) {
      closeModal();
    }
  });
  saveBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    handleCreateInventory();
  });
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCreateInventory();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalNewInventory?.classList.contains('is-active')) {
      closeModal();
    }
  });

  function closeModal() {
    modalNewInventory?.classList.remove('is-active');
    form?.reset();
  }

  function handleCreateInventory() {
    const formData = new FormData(form);
    const inventoryData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      isPublic: formData.get('isPublic') === 'on',
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    // Validación básica
    if (!inventoryData.title.trim()) {
      alert('El título es requerido');
      return;
    }

    console.log('Crear inventario:', inventoryData);
    
    // TODO: Enviar datos al backend
    // Aquí irá la llamada a la API para crear el inventario
    
    // Simulación de éxito por ahora
    alert('Inventario creado exitosamente!');
    closeModal();
    
    // Recargar la lista de inventarios
    loadInventories();
  }
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
