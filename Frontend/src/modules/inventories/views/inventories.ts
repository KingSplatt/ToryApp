import "./inventories.css"
import { categories } from "../additions/categoriesContainer"
import { AuthService } from "../../login/services/auth";
import { getInventories } from "../services/inventoryServices";
import { CreateInventoryDto } from "../interfaces/CreateInventoryDto";
import { CreateCustomFieldDto } from "../interfaces/CreateInventoryDto";
import { createInventory } from "../services/inventoryServices";
import { UIUtils } from "../../utils/ui";
import { InventoryDto } from "../interfaces/InventoryDtoInterface";
const additionalFields = [
  {
    id: "inventory-serial-number",
    name: "Serial Number",
    type: "text",
    showintable: true,
    sortorder: 1,
    validationrules: { required: true, maxLength: 50 },
    options: null,
    placeholder: "E.g. 123456789"
  },
  {
    id: "inventory-brand",
    name: "Brand",
    type: "dropdown",
    showintable: true,
    sortorder: 2,
    validationrules: { required: true },
    options: ["Dell", "HP", "Lenovo", "Apple", "ASUS"],
    placeholder: "Select a brand"
  },
  {
    id: "inventory-model",
    name: "Model",
    type: "text",
    showintable: true,
    sortorder: 3,
    validationrules: { required: true, maxLength: 100 },
    options: null,
    placeholder: "E.g. MacBook Pro"
  },
  {
    id: "inventory-price",
    name: "Price",
    type: "number",
    showintable: true,
    sortorder: 4,
    validationrules: { min: 0, max: 50000 },
    options: null,
    placeholder: "E.g. 1200"
  },
  {
    id: "inventory-purchase-date",
    name: "Purchase Date",
    type: "date",
    showintable: true,
    sortorder: 5,
    validationrules: { required: true },
    options: null,
    placeholder: ""
  },
  {
    id: "inventory-under-warranty",
    name: "Under Warranty",
    type: "checkbox",
    showintable: true,
    sortorder: 6,
    validationrules: null,
    options: null,
    placeholder: ""
  },
  {
    id: "inventory-condition",
    name: "Condition",
    type: "dropdown",
    showintable: true,
    sortorder: 7,
    validationrules: { required: true },
    options: ["Excellent", "Good", "Fair", "Poor"],
    placeholder: "Select condition"
  },
  {
    id: "inventory-location",
    name: "Location",
    type: "text",
    showintable: false,
    sortorder: 8,
    validationrules: { maxLength: 200 },
    options: null,
    placeholder: "E.g. Office 2nd Floor"
  },
  {
    id: "inventory-notes",
    name: "Notes",
    type: "text",
    showintable: false,
    sortorder: 9,
    validationrules: { maxLength: 500 },
    options: null,
    placeholder: "Additional notes"
  }
];

const inventories = await getInventories();

export function inventoriesPage() {
  console.log('Inventories:', inventories);
  // Obtener categorías únicas de los inventarios
  const uniqueCategories = Array.from(
    new Set(inventories.map((inv: any) => inv.category).filter(Boolean))
  );

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
          <label for="category-filter">Serach by Category:</label>
          <select id="category-filter">
            <option value="">All</option>
            ${uniqueCategories.map(category => `
              <option value="${category}">${category}</option>
            `).join('')}
          </select>
        </div>

        <div class="filter-group">
          <label for="sort-filter">Ordering by:</label>
          <select id="sort-filter">
            <option value="recent">Recent</option>
            <option value="tags">Per tags</option>
            <option value="name">Name A-Z</option>
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
                  ${categories.map(category => `
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
              <label>Additional Fields (Maximum 3)</label>
              <div id="custom-fields-container">
                <!-- Custom fields will be loaded here -->
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="add-custom-field">+ Add Custom Field</button>
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
  setupCreateButton();
}

async function loadInventories() {
  const container = document.getElementById('inventories-list');
  if (!container) return;

  let inventarios = await getInventories();
  const sortFilter = document.getElementById('sort-filter') as HTMLSelectElement;
  const sortCategory = document.getElementById('category-filter') as HTMLSelectElement;
  const searchInput = document.getElementById('search-inventories') as HTMLInputElement;

  // Helper: filtra por categoría
  function filterByCategory(list: any[], category: string) {
    if (!category) return list;
    return list.filter(inv => inv.category === category);
  }

  // Helper: filtra por búsqueda
  function filterBySearch(list: any[], search: string) {
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(inv =>
      inv.title.toLowerCase().includes(s) ||
      (inv.description && inv.description.toLowerCase().includes(s)) ||
      (inv.tags && inv.tags.some((tag: string) => tag.toLowerCase().includes(s)))
    );
  }

  // Helper: ordena
  function sortInventories(list: any[], option: string) {
    let sorted = [...list];
    if (option === 'recent') {
      sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    } else if (option === 'name') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (option === 'tags') {
      sorted.sort((a, b) => (b.tags?.length || 0) - (a.tags?.length || 0));
    }
    return sorted;
  }

  function renderInventories(list: any[]) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML = `<div class="empty-message">No inventories found.</div>`;
      return;
    }
    container.innerHTML = list.map((inv) => `
      <div class="inventory-card-full">
        <div class="inventory-header">
          <h3><a href="/inventories/${inv.id}" data-navigate="/inventories/${inv.id}">${inv.title}</a></h3>
          <div class="inventory-meta">
            <span class="access-type ${inv.isPublic ? 'public' : 'private'}">
              ${inv.isPublic ? '🌐 Public' : '🔒 Private'}
            </span>
          </div>
        </div>
        <div class="inventory-content">
          <p class="inventory-description">${inv.description}</p>
          <div class="inventory-stats">
            <span class="stat">📦 ${inv.itemCount} Items</span>
            <span class="stat">📂 ${inv.category}</span>
            <span class="stat">👤 ${inv.owner}</span>
            <span class="stat">📅 ${new Date(inv.lastUpdated).toLocaleDateString()}</span>
          </div>
          <div class="inventory-tags">
            ${inv.tags.map((tag: any) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Aplica todos los filtros y ordenamientos
  function applyFiltersAndSorting() {
    let filtered = [...inventarios];
    const selectedCategory = sortCategory.value;
    const selectedSort = sortFilter.value;
    const search = searchInput?.value || '';

    filtered = filterByCategory(filtered, selectedCategory);
    filtered = filterBySearch(filtered, search);
    filtered = sortInventories(filtered, selectedSort);

    renderInventories(filtered);
  }

  // Inicializa con los valores actuales
  applyFiltersAndSorting();

  sortFilter.addEventListener('change', applyFiltersAndSorting);
  sortCategory.addEventListener('change', applyFiltersAndSorting);
  searchInput?.addEventListener('input', applyFiltersAndSorting);
}


function setupCreateButton() {
  const createBtn = document.getElementById('create-inventory');
  const modalNewInventory = document.getElementById('modal-new-inventory');
  const closeModalBtn = document.getElementById('close-modal');
  const cancelBtn = document.getElementById('cancel-create');
  const saveBtn = document.getElementById('save-inventory');
  const form = document.getElementById('create-inventory-form') as HTMLFormElement;
  
  let selectedCustomFields: string[] = []; // Array para almacenar los IDs de campos seleccionados

  createBtn?.addEventListener('click', () => {
    modalNewInventory?.classList.add('is-active');
    setupCustomFields(); // Configurar los campos personalizados al abrir el modal
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

  function setupCustomFields() {
    const addFieldBtn = document.getElementById('add-custom-field');
    
    addFieldBtn?.addEventListener('click', () => {
      if (selectedCustomFields.length >= 3) {
        alert('Maximum 3 custom fields allowed');
        return;
      }
      showCustomFieldSelector();
    });
  }

  function showCustomFieldSelector() {
    // Filtrar campos que ya no están seleccionados
    const availableFields = additionalFields.filter(field => 
      !selectedCustomFields.includes(field.id)
    );

    if (availableFields.length === 0) {
      alert('No more fields available');
      return;
    }

    // Crear modal selector
    const selectorHTML = `
      <div id="field-selector-modal" class="modal is-active">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3>Select Custom Field</h3>
            <button class="modal-close" id="close-field-selector">&times;</button>
          </div>
          <div class="modal-body">
            <div class="field-options">
              ${availableFields.map(field => `
                <div class="field-option" data-field-id="${field.id}">
                  <h4>${field.name}</h4>
                  <p><strong>Type:</strong> ${field.type}</p>
                  <p><strong>Required:</strong> ${field.validationrules?.required ? 'Yes' : 'No'}</p>
                  ${field.options ? `<p><strong>Options:</strong> ${field.options.join(', ')}</p>` : ''}
                  <button class="btn btn-sm btn-primary select-field-btn" data-field-id="${field.id}">
                    Select
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Agregar al DOM
    document.body.insertAdjacentHTML('beforeend', selectorHTML);

    // Configurar eventos
    const selectorModal = document.getElementById('field-selector-modal');
    const closeSelectorBtn = document.getElementById('close-field-selector');
    const selectBtns = document.querySelectorAll('.select-field-btn');

    closeSelectorBtn?.addEventListener('click', () => {
      selectorModal?.remove();
    });

    selectorModal?.addEventListener('click', (e) => {
      if (e.target === selectorModal) {
        selectorModal.remove();
      }
    });

    selectBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fieldId = (e.target as HTMLElement).getAttribute('data-field-id');
        if (fieldId) {
          addCustomFieldToForm(fieldId);
          selectorModal?.remove();
        }
      });
    });
  }

  function addCustomFieldToForm(fieldId: string) {
    const field = additionalFields.find(f => f.id === fieldId);
    if (!field) return;

    selectedCustomFields.push(fieldId);
    const container = document.getElementById('custom-fields-container');
    
    const fieldHTML = createFieldHTML(field);
    container?.insertAdjacentHTML('beforeend', fieldHTML);

    // Actualizar botón si se alcanza el límite
    const addBtn = document.getElementById('add-custom-field');
    if (selectedCustomFields.length >= 3 && addBtn) {
      addBtn.style.display = 'none';
    }
  }

  function createFieldHTML(field: any): string {
    const fieldContainer = `
      <div class="custom-field-item" data-field-id="${field.id}">
        <div class="custom-field-header">
          <label>${field.name}${field.validationrules?.required ? ' *' : ''}</label>
          <button type="button" class="remove-field-btn" data-field-id="${field.id}">&times;</button>
        </div>
        ${createFieldInput(field)}
      </div>
    `;

    // Agregar event listener para el botón de eliminar después de que se agregue al DOM
    setTimeout(() => {
      const removeBtn = document.querySelector(`[data-field-id="${field.id}"] .remove-field-btn`);
      removeBtn?.addEventListener('click', () => removeCustomField(field.id));
    }, 0);

    return fieldContainer;
  }

  function createFieldInput(field: any): string {
    switch (field.type) {
      case 'text':
        return `<input type="text" name="custom_${field.id}" placeholder="${field.placeholder}" 
                ${field.validationrules?.required ? 'required' : ''} 
                ${field.validationrules?.maxLength ? `maxlength="${field.validationrules.maxLength}"` : ''}>`;
      
      case 'number':
        return `<input type="number" name="custom_${field.id}" placeholder="${field.placeholder}"
                ${field.validationrules?.required ? 'required' : ''}
                ${field.validationrules?.min !== undefined ? `min="${field.validationrules.min}"` : ''}
                ${field.validationrules?.max !== undefined ? `max="${field.validationrules.max}"` : ''}>`;
      
      case 'date':
        return `<input type="date" name="custom_${field.id}" 
                ${field.validationrules?.required ? 'required' : ''}>`;
      
      case 'dropdown':
        const options = field.options?.map((option: string) => 
          `<option value="${option}">${option}</option>`
        ).join('') || '';
        return `<select name="custom_${field.id}" ${field.validationrules?.required ? 'required' : ''}>
                  <option value="">${field.placeholder}</option>
                  ${options}
                </select>`;
      
      case 'checkbox':
        return `<input type="checkbox" name="custom_${field.id}">`;
      
      default:
        return `<input type="text" name="custom_${field.id}" placeholder="${field.placeholder}">`;
    }
  }

  function removeCustomField(fieldId: string) {
    // Remover del array
    selectedCustomFields = selectedCustomFields.filter(id => id !== fieldId);
    
    // Remover del DOM
    const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
    fieldElement?.remove();
    
    // Mostrar botón agregar si había llegado al límite
    const addBtn = document.getElementById('add-custom-field');
    if (addBtn && selectedCustomFields.length < 3) {
      addBtn.style.display = 'inline-block';
    }
  }

  function closeModal() {
    modalNewInventory?.classList.remove('is-active');
    form?.reset();
    
    // Limpiar campos personalizados
    selectedCustomFields = [];
    const container = document.getElementById('custom-fields-container');
    if (container) container.innerHTML = '';
    
    const addBtn = document.getElementById('add-custom-field');
    if (addBtn) addBtn.style.display = 'inline-block';
  }

  function handleCreateInventory() {
    const formData = new FormData(form);
    
    // Obtener usuario autenticado
    const authService = AuthService.getInstance();
    const currentUser = authService.getUser();
    
    if (!currentUser || !currentUser.id) {
      alert('You must be logged in to create an inventory');
      return;
    }
    
    // Recopilar datos básicos del inventario
    const inventoryData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      categoryName: formData.get('category') as string, // Enviar nombre de categoría
      isPublic: formData.get('isPublic') === 'on',
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(tag => tag),
      ownerId: currentUser.id, // Usar ID del usuario autenticado
      customFields: [] as any[] // Ensure this is always initialized as an array
    };

    // Recopilar datos de campos personalizados
    selectedCustomFields.forEach(fieldId => {
      const field = additionalFields.find(f => f.id === fieldId);
      if (field) {
        const fieldName = `custom_${fieldId}`;
        let value: any = formData.get(fieldName);
        
        // Convertir checkbox a boolean
        if (field.type === 'checkbox') {
          value = value === 'on';
        }
        
        // Preparar campo personalizado para envío al backend
        const customFieldData: CreateCustomFieldDto = {
          name: field.name ,
          type: field.type.charAt(0).toUpperCase() + field.type.slice(1), // Capitalize first letter
          showInTable: field.showintable,
          sortOrder: field.sortorder,
          validationRules: field.validationrules ? JSON.stringify(field.validationrules) : undefined,
          options: field.options ? JSON.stringify(field.options) : undefined
        };
        
        inventoryData.customFields.push(customFieldData);
      }
    });

    // Validación básica
    if (!inventoryData.title.trim()) {
      alert('Title is required');
      return;
    }

    // Validar campos personalizados requeridos
    for (const fieldId of selectedCustomFields) {
      const field = additionalFields.find(f => f.id === fieldId);
      if (field?.validationrules?.required) {
        const value = formData.get(`custom_${fieldId}`);
        if (!value || (typeof value === 'string' && !value.trim())) {
          alert(`${field.name} is required`);
          return;
        }
      }
    }

    console.log('Create inventory:', inventoryData);
    UIUtils.showModalForMessages('Creating inventory...');
    setTimeout(() => {
      createInventory(inventoryData);

    },1000)
    closeModal();
  }
}

// Global function for sharing
(window as any).shareInventory = function(id: number) {
  console.log('Sharing inventory:', id);
  // TODO: Implement share functionality
  alert(`Share inventory ${id} functionality will be implemented`);
};
