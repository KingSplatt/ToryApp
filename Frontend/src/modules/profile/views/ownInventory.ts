import { getUserInventories } from "../../inventories/services/inventoryServices";
import { AuthService } from "../../login/services/auth";
import { Router } from "../../router/router";
import { InventoryDto } from "../../inventories/interfaces/InventoryDtoInterface";
import { getUsers } from "../../admin/services/UserServices";
import "./ownInventory.css"
import { User } from "../../login/interfaces/UserInterface";
import { grantWriterAccess, revokeWriterAccess } from "../../inventories/services/inventoryServices";
import { GrantAccess, AccessLevel } from "../../inventories/interfaces/GrantAccessInterface";
import { UIUtils } from "../../utils/ui";

export function ownInventory(){
    return `
    <div class="inventory-container">
      <h1>Your Inventories</h1>
      <div class="inventory-actions">
        ${inventoryToolBar()}
      </div>
      <div class="inventories-list">

      </div>

      <div id="modal-grant-inventory-access" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Grant Writer Access to Selected Inventories</h2>
            <span class="close-button" id="close-grant-modal">&times;</span>
          </div>
          <div class="modal-body">
            <div class="selected-inventories-info">
              <p><strong>Selected inventories:</strong> <span id="grant-selected-count">0</span></p>
            </div>
            <div class="form-group">
              <label for="grant-search-user-input">Search user (name/email)</label>
              <div class="search-container">
                <input type="text" id="grant-search-user-input" class="search-user-input" placeholder="Enter user name or email">
                <div class="user-dropdown" id="grant-user-dropdown" style="display: none;"></div>
              </div>
            </div>
            <div class="selected-user" id="grant-selected-user" style="display: none;">
              <p><strong>Selected user:</strong> <span class="user-name"></span> (<span class="user-email"></span>)</p>
            </div>
            <p class="modal-description">Are you sure you want to grant writer access to this user for the selected inventories?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-success" id="confirm-grant-access">Grant Access</button>
            <button class="btn btn-danger" id="cancel-grant-access">Cancel</button>
          </div>
        </div>
      </div>

      <div id="modal-remove-inventory-access" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Remove Writer Access from Selected Inventories</h2>
            <span class="close-button" id="close-remove-modal">&times;</span>
          </div>
          <div class="modal-body">
            <div class="selected-inventories-info">
              <p><strong>Selected inventories:</strong> <span id="remove-selected-count">0</span></p>
            </div>
            <div class="form-group">
              <label for="remove-search-user-input">Search user (name/email)</label>
              <div class="search-container">
                <input type="text" id="remove-search-user-input" class="search-user-input" placeholder="Enter user name or email">
                <div class="user-dropdown" id="remove-user-dropdown" style="display: none;"></div>
              </div>
            </div>
            <div class="selected-user" id="remove-selected-user" style="display: none;">
              <p><strong>Selected user:</strong> <span class="user-name"></span> (<span class="user-email"></span>)</p>
            </div>
            <p class="modal-description">Are you sure you want to remove writer access from this user for the selected inventories?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-warning" id="confirm-remove-access">Remove Access</button>
            <button class="btn btn-danger" id="cancel-remove-access">Cancel</button>
          </div>
        </div>
      </div>
    </div>
    `
}

const users: User[] = [];
let selectedUser: User | null = null;
let selectedInventoryIds: string[] = [];

export function initOwnInventory() {
    ownInventory();
    loadUserInventories();
    loadTableOfInventories();
    setupModalEventListeners();
}

function setupModalEventListeners() {
    const grantSelectedBtn = document.getElementById('inventory-grant-selected-btn');
    const removeSelectedBtn = document.getElementById('inventory-remove-selected-btn');
    const selectAllBtn = document.getElementById('inventory-select-all-btn');
    const clearSelectionBtn = document.getElementById('inventory-clear-selection-btn');

    grantSelectedBtn?.addEventListener('click', openGrantAccessModal);
    removeSelectedBtn?.addEventListener('click', openRemoveAccessModal);
    selectAllBtn?.addEventListener('click', toggleSelectAllInventories);
    clearSelectionBtn?.addEventListener('click', clearInventorySelection);

    setupGrantModalEventListeners();
    setupRemoveModalEventListeners();
    setupUserSearchForModals();
}

function setupGrantModalEventListeners() {
    const modal = document.getElementById('modal-grant-inventory-access');
    const closeButton = document.getElementById('close-grant-modal');
    const confirmButton = document.getElementById('confirm-grant-access');
    const cancelButton = document.getElementById('cancel-grant-access');

    closeButton?.addEventListener('click', closeGrantAccessModal);
    cancelButton?.addEventListener('click', closeGrantAccessModal);
    confirmButton?.addEventListener('click', handleGrantAccess);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeGrantAccessModal();
        }
    });
}

function setupRemoveModalEventListeners() {
    const modal = document.getElementById('modal-remove-inventory-access');
    const closeButton = document.getElementById('close-remove-modal');
    const confirmButton = document.getElementById('confirm-remove-access');
    const cancelButton = document.getElementById('cancel-remove-access');

    closeButton?.addEventListener('click', closeRemoveAccessModal);
    cancelButton?.addEventListener('click', closeRemoveAccessModal);
    confirmButton?.addEventListener('click', handleRemoveAccess);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeRemoveAccessModal();
        }
    });
}

function setupUserSearchForModals() {
    // Setup para modal de grant
    setTimeout(() => {
        const grantModal = document.getElementById('modal-grant-inventory-access');
        const grantSearchInput = grantModal?.querySelector('#grant-search-user-input') as HTMLInputElement;
        const grantDropdown = grantModal?.querySelector('#grant-user-dropdown') as HTMLElement;

        if (grantSearchInput && grantDropdown) {
            grantSearchInput.addEventListener('input', (event) => {
                const target = event.target as HTMLInputElement;
                handleUserSearchInModal(target.value, grantDropdown, 'grant');
            });
        }

        // Setup para modal de remove
        const removeModal = document.getElementById('modal-remove-inventory-access');
        const removeSearchInput = removeModal?.querySelector('#remove-search-user-input') as HTMLInputElement;
        const removeDropdown = removeModal?.querySelector('#remove-user-dropdown') as HTMLElement;

        if (removeSearchInput && removeDropdown) {
            removeSearchInput.addEventListener('input', (event) => {
                const target = event.target as HTMLInputElement;
                handleUserSearchInModal(target.value, removeDropdown, 'remove');
            });
        }
    }, 100);
}

function handleUserSearchInModal(query: string, dropdown: HTMLElement, modalType: 'grant' | 'remove') {
    if (query.length < 2) {
        dropdown.style.display = 'none';
        return;
    }

    const filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredUsers.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-item no-results">No users found</div>';
        dropdown.style.display = 'block';
        return;
    }

    const dropdownHTML = filteredUsers.map(user => `
        <div class="dropdown-item" data-user-id="${user.id}" data-user-email="${user.email}" data-user-name="${user.fullName}" data-modal-type="${modalType}">
            <div class="user-info">
                <span class="user-name">${user.fullName}</span>
                <span class="user-email">${user.email}</span>
            </div>
        </div>
    `).join('');

    dropdown.innerHTML = dropdownHTML;
    dropdown.style.display = 'block';

    // Agregar event listeners a los items del dropdown
    dropdown.querySelectorAll('.dropdown-item:not(.no-results)').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.getAttribute('data-user-id');
            const userEmail = item.getAttribute('data-user-email');
            const userName = item.getAttribute('data-user-name');
            const modalType = item.getAttribute('data-modal-type') as 'grant' | 'remove';
            
            selectUserInModal(userId!, userEmail!, userName!, modalType);
            dropdown.style.display = 'none';
        });
    });
}

function selectUserInModal(userId: string, userEmail: string, userName: string, modalType: 'grant' | 'remove') {
    const modalId = modalType === 'grant' ? 'modal-grant-inventory-access' : 'modal-remove-inventory-access';
    const inputId = modalType === 'grant' ? 'grant-search-user-input' : 'remove-search-user-input';
    const selectedUserId = modalType === 'grant' ? 'grant-selected-user' : 'remove-selected-user';

    const modal = document.getElementById(modalId);
    const searchInput = modal?.querySelector(`#${inputId}`) as HTMLInputElement;
    const selectedUserDiv = modal?.querySelector(`#${selectedUserId}`) as HTMLElement;
    const userNameSpan = selectedUserDiv?.querySelector('.user-name') as HTMLElement;
    const userEmailSpan = selectedUserDiv?.querySelector('.user-email') as HTMLElement;

    if (searchInput && selectedUserDiv && userNameSpan && userEmailSpan) {
        searchInput.value = `${userName} (${userEmail})`;
        
        userNameSpan.textContent = userName;
        userEmailSpan.textContent = userEmail;
        selectedUserDiv.style.display = 'block';

        // Guardar el usuario seleccionado
        selectedUser = users.find(u => u.id === userId) || null;
    }
}

// Funciones para manejar la selección de inventarios
function toggleSelectAllInventories() {
    const selectAllCheckbox = document.getElementById("inventory-select-all") as HTMLInputElement;
    const inventoryCheckboxes = document.querySelectorAll(".inventory-checkbox") as NodeListOf<HTMLInputElement>;
    
    if (selectAllCheckbox) {
        const shouldSelectAll = !selectAllCheckbox.checked;
        selectAllCheckbox.checked = shouldSelectAll;
        inventoryCheckboxes.forEach((checkbox) => {
            checkbox.checked = shouldSelectAll;
        });
        updateInventoryToolBar();
    }
}

function clearInventorySelection() {
    const inventoryCheckboxes = document.querySelectorAll(".inventory-checkbox") as NodeListOf<HTMLInputElement>;
    const selectAllCheckbox = document.getElementById("inventory-select-all") as HTMLInputElement;
    
    inventoryCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    
    updateInventoryToolBar();
}

function updateInventoryToolBar() {
    const checkedBoxes = document.querySelectorAll(".inventory-checkbox:checked") as NodeListOf<HTMLInputElement>;
    const hasSelection = checkedBoxes.length > 0;

    const grantButton = document.getElementById("inventory-grant-selected-btn") as HTMLButtonElement;
    const removeButton = document.getElementById("inventory-remove-selected-btn") as HTMLButtonElement;
    const grantCountSpan = document.getElementById("inventory-selected-count");
    const removeCountSpan = document.getElementById("inventory-selected-count-remove");

    if (grantButton) grantButton.disabled = !hasSelection;
    if (removeButton) removeButton.disabled = !hasSelection;
    if (grantCountSpan) grantCountSpan.textContent = checkedBoxes.length.toString();
    if (removeCountSpan) removeCountSpan.textContent = checkedBoxes.length.toString();

    // Actualizar array de IDs seleccionados
    selectedInventoryIds = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-inventory-id') || '');

    // Actualizar checkbox select all
    const inventoryCheckboxes = document.querySelectorAll(".inventory-checkbox") as NodeListOf<HTMLInputElement>;
    const allChecked = Array.from(inventoryCheckboxes).every(checkbox => checkbox.checked);
    const selectAllCheckbox = document.getElementById("inventory-select-all") as HTMLInputElement;
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked && inventoryCheckboxes.length > 0;
    }
}

// Funciones para abrir/cerrar modales
function openGrantAccessModal() {
    if (selectedInventoryIds.length === 0) {
        UIUtils.showModalForMessages('Please select at least one inventory');
        return;
    }

    const modal = document.getElementById('modal-grant-inventory-access');
    const searchInput = modal?.querySelector('#grant-search-user-input') as HTMLInputElement;
    const selectedUserDiv = modal?.querySelector('#grant-selected-user') as HTMLElement;
    const dropdown = modal?.querySelector('#grant-user-dropdown') as HTMLElement;
    const countSpan = modal?.querySelector('#grant-selected-count') as HTMLElement;

    if (modal) {
        modal.style.display = 'block';
        
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        if (selectedUserDiv) selectedUserDiv.style.display = 'none';
        if (dropdown) dropdown.style.display = 'none';
        if (countSpan) countSpan.textContent = selectedInventoryIds.length.toString();
        
        selectedUser = null;
    }
}

function closeGrantAccessModal() {
    const modal = document.getElementById('modal-grant-inventory-access');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openRemoveAccessModal() {
    if (selectedInventoryIds.length === 0) {
        UIUtils.showModalForMessages('Please select at least one inventory');
        return;
    }

    const modal = document.getElementById('modal-remove-inventory-access');
    const searchInput = modal?.querySelector('#remove-search-user-input') as HTMLInputElement;
    const selectedUserDiv = modal?.querySelector('#remove-selected-user') as HTMLElement;
    const dropdown = modal?.querySelector('#remove-user-dropdown') as HTMLElement;
    const countSpan = modal?.querySelector('#remove-selected-count') as HTMLElement;

    if (modal) {
        modal.style.display = 'block';
        
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        if (selectedUserDiv) selectedUserDiv.style.display = 'none';
        if (dropdown) dropdown.style.display = 'none';
        if (countSpan) countSpan.textContent = selectedInventoryIds.length.toString();
        
        selectedUser = null;
    }
}

function closeRemoveAccessModal() {
    const modal = document.getElementById('modal-remove-inventory-access');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Funciones para manejar los permisos
async function handleGrantAccess() {
    if (!selectedUser) {
        UIUtils.showModalForMessages('Please select a user from the search results');
        return;
    }

    if (selectedInventoryIds.length === 0) {
        UIUtils.showModalForMessages('No inventories selected');
        return;
    }

    try {
        for (const inventoryId of selectedInventoryIds) {
            const grantAccess: GrantAccess = {
                userId: selectedUser.id,
                accessLevel: AccessLevel.Write
            };
            await grantWriterAccess(parseInt(inventoryId), grantAccess);
        }
        UIUtils.showModalForMessages('Access granted successfully!');
        closeGrantAccessModal();
        clearInventorySelection();
        loadTableOfInventories();
    } catch (error) {
        UIUtils.showModalForMessages('Error granting access. Please try again.');
    }
}

async function handleRemoveAccess() {
    if (!selectedUser) {
        UIUtils.showModalForMessages('Please select a user from the search results');
        return;
    }

    if (selectedInventoryIds.length === 0) {
        UIUtils.showModalForMessages('No inventories selected');
        return;
    }

    try {
        for (const inventoryId of selectedInventoryIds) {
            await revokeWriterAccess(parseInt(inventoryId), selectedUser.id);
        }
        UIUtils.showModalForMessages(`Access removed successfully from ${selectedUser.fullName} for ${selectedInventoryIds.length} inventory(ies)!`);
        closeRemoveAccessModal();
        clearInventorySelection();
        loadTableOfInventories();
    } catch (error) {
        UIUtils.showModalForMessages('Error removing access. Please try again.');
    }
}

async function loadUserInventories() {
    const user = AuthService.getInstance().getUser();
    const inventories = await getUserInventories(user?.id || '');
    const allUsers = await getUsers();
    users.length = 0;
    users.push(...allUsers);
    return inventories;
}

export function loadTableOfInventories(){
  const inventoryItemsContainer = document.querySelector('.inventories-list');
  if (!inventoryItemsContainer) return;

  inventoryItemsContainer.innerHTML = '';

  loadUserInventories().then(InventoryDto => {
      const tableElement = document.createElement('table');
      tableElement.classList.add('table-inventories');
      tableElement.innerHTML = `
      <thead>
        <tr>
          <th>
            <input type="checkbox" id="inventory-select-all" onchange="toggleSelectAll()">
          </th>
          <th>Inventory</th>
          <th>Description</th>
          <th>Category</th>
          <th>Total Custom Fields</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
      `;

      const tbody = tableElement.querySelector('tbody');
      if (tbody) {
        InventoryDto.forEach(tory => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><input type="checkbox" class="inventory-checkbox" data-inventory-id="${tory.id}" onchange="updateInventoryToolBar()"></td>
            <td>${tory.title}</td>
            <td>${tory.description}</td>
            <td>${tory.category}</td>
            <td>${tory.customFields.length}</td>
          `;
          tbody.appendChild(row);
        });
      }
      inventoryItemsContainer.appendChild(tableElement);
      (window as any).updateInventoryToolBar = updateInventoryToolBar;
      (window as any).toggleSelectAll = toggleSelectAll;
  });
}

export function inventoryToolBar(){
    return `
    <div class="inventory-btn-toolbar">
      <div class="inventory-btn-group">
        <button class="buttonn-grant" id="inventory-grant-selected-btn" disabled>
          Grant Writer Access (<span class="inventory-selected-count" id="inventory-selected-count">0</span>)
        </button>
        <button class="buttonn-revoke" id="inventory-remove-selected-btn" disabled>
          Remove Writer Access (<span class="inventory-selected-count" id="inventory-selected-count-remove">0</span>)
        </button>
      </div>
      <div class="inventory-btn-group">
        <button class="btn btn-outline-secondary" id="inventory-select-all-btn">
          Select All
        </button>
        <button class="btn btn-outline-secondary" id="inventory-clear-selection-btn">
          Clear Selection
        </button>
      </div>
    </div>
  `;
}

export function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById("inventory-select-all") as HTMLInputElement;
  const inventoryCheckboxes = document.querySelectorAll(".inventory-checkbox") as NodeListOf<HTMLInputElement>;

  if (selectAllCheckbox) {
    const isChecked = selectAllCheckbox.checked;
    inventoryCheckboxes.forEach((inventoryCheckbox) => {
      inventoryCheckbox.checked = isChecked;
    });
    updateInventoryToolBar();
  }
}