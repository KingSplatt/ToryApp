import { getInventory, updateInventory, getUserInventoryPermissions } from "../../../services/inventoryServices";
import { InventoryDto } from "../../../interfaces/InventoryDtoInterface";
import { UpdateInventoryDto } from "../../../interfaces/UpdateInventoryDto";
import "../styles/inventoryPage.css";
import { UIUtils } from "../../utils/ui";
import { getItemsForInventory, createItem,deleteItems,updateItem } from "../../../services/itemServices";
import { CreateItemDto, CustomFieldValueDto } from "../../../interfaces/CreateItemDto";
import { getCategories, createCategory } from "../../../services/categoryServices";
import { Router } from "../../router/router";
import { UserInventoryPermissionsDto } from "../../../interfaces/PermissionInterface";
import { uploadImageToCloudinary } from "../../../services/cloudinaryService";

const router = Router.getInstance();
// Global variables for toolbar functionality
let currentInventoryPermissions: UserInventoryPermissionsDto | null = null;
let currentInventory: InventoryDto | null = null;
let selectedItemIds: Set<number> = new Set();
let inventoryItems: any[] = [];

export function inventoryPage(){
    const isAuthenticated = UIUtils.isUserAuthenticated();
    const User = UIUtils.getCurrentUser();
    const isAdmin = UIUtils.isAdmin();
    console.log("User in inventoryPage:", User);
  return `
    <div class="inventory-details-page" id="inventory-details">
        <h2></h2>
    </div>
  `;
}

export const initInventoryPage = async (idInventory: string) => {
    const parsedId = parseInt(idInventory);
    
    if (isNaN(parsedId)) {
        console.error('Invalid inventory ID provided:', idInventory);
        UIUtils.showModalForMessages('Invalid inventory ID: ' + idInventory);
        return;
    }
    // Check if user is authenticated and admin first
    const isAuthenticated = UIUtils.isUserAuthenticated();
    const isAdmin = UIUtils.isAdmin();
    
    let permissions = null;
    let hasInventoryAccess = false;
    let hasWriteAccess = false; // New variable for write permissions
    
    // Only try to get permissions if user is authenticated
    if (isAuthenticated) {
        try {
            permissions = await getUserInventoryPermissions(parsedId);
            currentInventoryPermissions = permissions;
            console.log("Permissions in initInventoryPage:", permissions);
            
            // User has access to management actions
            hasInventoryAccess = (permissions && (
                permissions.canManageInventory || 
                permissions.isOwner ||
                permissions.accessLevel === "Creator" ||
                permissions.accessLevel === "Admin"
            )) || isAdmin;
            
            // User has write access (for discussions and item creation)
            hasWriteAccess = (permissions && (
                permissions.canWrite ||
                permissions.canCreateItems ||
                permissions.canEditItems ||
                permissions.canManageInventory ||
                permissions.isOwner ||
                permissions.accessLevel === "Creator" ||
                permissions.accessLevel === "Admin"
            )) || isAdmin;
            
        } catch (error) {
            console.log("No permissions found for user, treating as guest");
            hasInventoryAccess = isAdmin;
            hasWriteAccess = isAdmin;
        }
    } else {
        // For unauthenticated users, no access to management or write actions
        hasInventoryAccess = false;
        hasWriteAccess = false;
    }
    
    const inventory = await takeInventory(idInventory, hasInventoryAccess, hasWriteAccess);
    
    // Attach button event listeners if user has any access
    if (hasInventoryAccess || hasWriteAccess) {
        attachButtons();
    }
    
    // Check user permissions and initialize toolbars
    await initializeToolbarsWithPermissions(parsedId);
    
    // Load items by default
    await loadItemsTable(idInventory);
};

async function takeInventory(idInventory: string, hasInventoryAccess: boolean = false, hasWriteAccess: boolean = false): Promise<InventoryDto> {
  const inventory = await getInventory(parseInt(idInventory));
  currentInventory = inventory; // Store current inventory globally
  
  const categories = await getCategories();
  
  const inventoryDetails = document.getElementById('inventory-details');
  if (inventoryDetails) {
    inventoryDetails.innerHTML = `
    <section class="inventory-info">
        <section class="inventory-header">
            <section class="inventory-cards">
                <h2>${escapeHtml(inventory.title || 'Untitled Inventory')}</h2>
                <hr>
                <h3>${escapeHtml(inventory.description || 'No description available')}</h3>
                <hr>
                <section class="inventory-meta">
                    <section class="inventory-meta-owner">
                        <table class="inventory-meta-table">
                            <thead>
                                <tr>
                                    <th>Owner:</th>
                                    <td>${escapeHtml(inventory.owner)}</td>
                                </tr>
                                <tr>
                                    <th>Description:</th>
                                    <td>${escapeHtml(inventory.description || 'No description available')}</td>
                                </tr>
                                <tr>
                                    <th>Category:</th>
                                    <td>${escapeHtml(inventory.category || 'Uncategorized')}</td>
                                </tr>
                                <tr>
                                    <th>Is Public:</th>
                                    <td>${inventory.isPublic ? 'Yes' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Items:</th>
                                    <td>${inventory.itemCount}</td>
                                </tr>
                                <tr>
                                    <th>Last Updated:</th>
                                    <td>${new Date(inventory.lastUpdated).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <th>Tags:</th>
                                    <td>${inventory.tags.length > 0 ? inventory.tags.map(tag => `<span class="list-tag">${escapeHtml(tag)}</span>`).join(', ') : '<span>No tags</span>'}</td>
                                </tr>
                            </thead>
                        </table>
                    </section>
                    
                    <section class="inventory-meta-img">
                        <section class="inventory-image">
                            <img src="${escapeHtml(inventory.imageUrl || 'placeholder.jpg')}" 
                                 alt="${escapeHtml(inventory.title || 'Untitled Inventory')}"
                            
                                 onerror="console.error('Image failed to load:', this.src); this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 viewBox=%220 0 300 200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%22150%22 y=%22100%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'; this.onerror=null;"
                                 loading="lazy"
                                 class="inventory-main-image">
                        </section>
                    </section>
                </section>
            </section>
        </section>
        ${hasInventoryAccess ? `
        <section class="inventory-control">
            <section class="inventory-actions">
                <button class="btn btn-primary" id="edit-inventory-${inventory.id}">Edit</button>
                <button class="btn btn-primary" id="custom-id-inventory-${inventory.id}">Custom ID</button>
                ${hasWriteAccess ? `<button class="btn btn-primary" id="discuss-inventory-${inventory.id}">Discussion post</button>` : ''}
                <button class="btn btn-primary" id="items-inventory-${inventory.id}">Hide Items</button>
            </section>
        </section>
        ` : hasWriteAccess ? `
        <section class="inventory-control">
            <section class="inventory-actions">
                <button class="btn btn-primary" id="discuss-inventory-${inventory.id}">Discussion post</button>
            </section>
        </section>
        ` : ''}
        <section class="inventory-meta-actions">
          <div class="items-action-toolbar" id="items-action-toolbar" style="display: none;">
            <div class="toolbar-actions">
              <div class="bulk-selection">
                <label class="select-all-label">
                  <input type="checkbox" id="select-all-items">
                  Select All
                </label>
                <span id="selected-count">0 items selected</span>
              </div>
              <div class="action-buttons">
                <button class="btn btn-warning" id="edit-selected-items" disabled>
                  <i class="fas fa-edit"></i> Edit Selected
                </button>
                <button class="btn btn-danger" id="delete-selected-items" disabled>
                  <i class="fas fa-trash"></i> Delete Selected
                  </button>
                <button class="btn btn-primary" id="add-item-${inventory.id}">Add Item</button>
              </div>
            </div>
          </div>
          <hr>
          
          <div class="fields-action-toolbar" id="fields-action-toolbar" style="display: none;">
            <div class="toolbar-actions">
              <div class="field-selection">
                <label>Field to modify:</label>
                <select id="field-selector">
                  <option value="">Select a field...</option>
                </select>
              </div>
              <div class="field-operation">
                <label>Operation:</label>
                <select id="operation-selector">
                  <option value="">Select operation...</option>
                  <option value="clear">Clear Field</option>
                  <option value="replace">Replace Value</option>
                  <option value="append">Append to Value</option>
                </select>
              </div>
              <div class="new-value-input" id="new-value-input" style="display: none;">
                <label>New Value:</label>
                <input type="text" id="new-field-value" placeholder="Enter new value">
              </div>
            </div>
          </div>
        </section>
    </table>
    </section>
    <section class="inventory-items-section" id="inventory-items-section" style="display: block;">
        <h3>Items</h3>
        <div id="items-table-container">
            <!-- Items table will be inserted here -->
        </div>
    </section>

    <!-- Edit Inventory Modal -->
    <div id="edit-inventory-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Inventory</h3>
                <span class="close" id="close-edit-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="inventory-edit-form">
                    <div class="form-group">
                        <label for="edit-title" id="edit-title-label">Title:</label>
                        <input type="text" id="edit-title" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-description" id="edit-description-label">Description:</label>
                        <textarea id="edit-description" name="description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-category" id="edit-category-label">Category:</label>
                        <select id="edit-category" name="categoryId" required>
                            <option value="">Select a category</option>
                            ${categories.map(category => `<option value="${escapeHtml(category.id.toString())}">${escapeHtml(category.name)}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-tags" id="edit-tags-label">Tags (comma separated):</label>
                        <input type="text" id="edit-tags" name="tags" placeholder="tag1, tag2, tag3">
                    </div>
                    <div class="form-group">
                        <label for="edit-imageUrl" id="edit-imageUrl-label">Image URL:</label>
                        <input type="url" id="edit-imageUrl" name="imageUrl">
                    </div>
                    <div class="form-group checkbox-group">
                        <label for="edit-isPublic" id="edit-isPublic-label">
                            <input type="checkbox" id="edit-isPublic" name="isPublic">
                            Public Inventory
                        </label>
                    </div>
                    <div class="attach-image-group">
                        <label for="edit-attachImage" id="edit-attachImage-label">Attach Image:</label>
                        <input type="file" id="edit-attachImage" name="attachImage" accept="image/*">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-edit">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Add Item Modal -->
    <div id="add-item-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Item</h3>
                <span class="close" id="close-add-item-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="add-item-form">
                    <div class="form-group">
                        <label for="add-item-name" id="add-item-name-label">Name *:</label>
                        <input type="text" id="add-item-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="add-item-customId" id="add-item-customId-label">Custom ID:</label>
                        <input type="text" id="add-item-customId" name="customId" placeholder="Optional custom identifier">
                    </div>
                    <div class="form-group">
                        <label for="add-item-description" id="add-item-description-label">Description:</label>
                        <textarea id="add-item-description" name="description" rows="3" placeholder="Describe this item..."></textarea>
                    </div>
                    
                    <!-- Dynamic custom fields will be added here -->
                    <div id="custom-fields-container">
                        <!-- Custom fields will be dynamically generated -->
                    </div>

                    <div class="img-attach">
                        <label for="add-item-image" id="add-item-image-label">Attach Image:</label>
                        <input type="file" id="add-item-image" name="itemImage" accept="image/*">
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-add-item">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Item</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
  }
  return inventory;
}

export function attachButtons(){
    // Select buttons that start with "edit-inventory-" but exclude the form
    const editButtons = document.querySelectorAll('button[id^="edit-inventory-"]');
    editButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const inventoryId = button.id.split('-')[2];
            const parsedInventory = parseInt(inventoryId);
            const parsedId = parseInt(inventoryId);
            if (isNaN(parsedId)) {
                UIUtils.showModalForMessages('Invalid inventory ID: ' + inventoryId);
                return;
            }
            
            try {
                await openEditModal(parsedId);
            } catch (error) {
                console.error('Error opening edit modal:', error);
                UIUtils.showModalForMessages('Error opening edit modal: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
        });
    });
    
    //Custom ID buttons
    const customIdButtons = document.querySelectorAll('[id^="custom-id-inventory-"]');
    customIdButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inventoryId = button.id.split('-')[3];
            router.navigate(`/inventories/${inventoryId}/custom-id`);
        });
    });
    
    //PENDIENTE
    const discussButtons = document.querySelectorAll('[id^="discuss-inventory-"]');
    discussButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inventoryId = button.id.split('-')[2];
            router.navigate(`/inventories/${inventoryId}/discusspost`);
        });
    });

    const itemsButtons = document.querySelectorAll('[id^="items-inventory-"]');
    itemsButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const inventoryId = button.id.split('-')[2];
    
            
            const itemsSection = document.getElementById('inventory-items-section');
            if (itemsSection) {
                if (itemsSection.style.display === 'block') {
                    // Hide items section
                    itemsSection.style.display = 'none';
                    button.textContent = 'Show Items';
                } else {
                    // Show items section and reload items
                    itemsSection.style.display = 'block';
                    await loadItemsTable(inventoryId);
                    button.textContent = 'Hide Items';
                }
            }
        });
    }); 
}

export async function loadItems(inventoryId: string){
    const items = await getItemsForInventory(parseInt(inventoryId));
}

export async function loadItemsTable(inventoryId: string) {
    try {
        const items = await getItemsForInventory(parseInt(inventoryId));
        inventoryItems = items; // Store for global access

        const tableContainer = document.getElementById('items-table-container');
        if (tableContainer) {
            if (items && items.length > 0) {
                // Check if user has permissions for checkboxes or if it's a public inventory
                const isAuthenticated = UIUtils.isUserAuthenticated();
                const showCheckboxes = isAuthenticated && (currentInventoryPermissions?.canEditItems || currentInventoryPermissions?.canDeleteItems);
                
                const tableHTML = `
                    <table class="items-table">
                        <thead>
                            <tr>
                                ${showCheckboxes ? '<th><input type="checkbox" id="select-all-items-table"></th>' : ''}
                                <th>ID</th>
                                <th>Name</th>
                                <th>Custom ID</th>
                                <th>Description</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((item: any) => `
                                <tr data-item-id="${item.id}">
                                    ${showCheckboxes ? `<td><input type="checkbox" class="item-checkbox" value="${item.id}"></td>` : ''}
                                    <td>${item.id || 'N/A'}</td>
                                    <td>${item.name || 'N/A'}</td>
                                    <td>${item.customId || 'N/A'}</td>
                                    <td>${item.description || 'No description'}</td>
                                    <td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td>${item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                
                tableContainer.innerHTML = tableHTML;
                
                // Add click event listeners to table rows for navigation
                attachRowClickEvents(inventoryId);
                attachItemButtonEvents();
                if (showCheckboxes) {
                    attachCheckboxEventListeners();
                }
            } else {
                // Show "Add Item" button even for public inventories when no items exist
                const showAddButton = currentInventory?.isPublic || currentInventoryPermissions?.canEditItems;
                tableContainer.innerHTML = `
                    <div class="no-items-message">
                        <p>No items here yet!.</p>
                        ${showAddButton ? '<button class="btn btn-primary" id="add-item-btn">Add First Item</button>' : ''}
                    </div>
                `;
                
                const addItemBtn = document.getElementById('add-item-btn');
                if (addItemBtn) {
                    addItemBtn.addEventListener('click', () => {
                        openAddItemModal();
                    });
                }
                selectedItemIds.clear();
                updateToolbarState();
            }
        }
    } catch (error) {
        console.error('Error loading items table:', error);
        const tableContainer = document.getElementById('items-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading items. Please try again.</p>
                </div>
            `;
        }
    }
}

// Attach checkbox event listeners for bulk operations
function attachCheckboxEventListeners() {
    const itemCheckboxes = document.querySelectorAll('.item-checkbox') as NodeListOf<HTMLInputElement>;
    itemCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const itemId = parseInt(target.value);
            
            if (target.checked) {
                selectedItemIds.add(itemId);
            } else {
                selectedItemIds.delete(itemId);
            }
            
            updateToolbarState();
            updateSelectAllState();
        });
    });

    // Handle table header select all checkbox
    const selectAllTableCheckbox = document.getElementById('select-all-items-table') as HTMLInputElement;
    selectAllTableCheckbox?.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = target.checked;
            const itemId = parseInt(checkbox.value);
            if (target.checked) {
                selectedItemIds.add(itemId);
            } else {
                selectedItemIds.delete(itemId);
            }
        });
        
        updateToolbarState();
    });
}

// Update the state of the select all checkbox based on individual selections
function updateSelectAllState() {
    const selectAllTableCheckbox = document.getElementById('select-all-items-table') as HTMLInputElement;
    const selectAllToolbarCheckbox = document.getElementById('select-all-items') as HTMLInputElement;
    const itemCheckboxes = document.querySelectorAll('.item-checkbox') as NodeListOf<HTMLInputElement>;
    
    if (itemCheckboxes.length === 0) return;
    const checkedCount = selectedItemIds.size;
    const totalCount = itemCheckboxes.length;

    if (selectAllTableCheckbox) {
        selectAllTableCheckbox.checked = checkedCount === totalCount;
        selectAllTableCheckbox.indeterminate = checkedCount > 0 && checkedCount < totalCount;
    }
    if (selectAllToolbarCheckbox) {
        selectAllToolbarCheckbox.checked = checkedCount === totalCount;
        selectAllToolbarCheckbox.indeterminate = checkedCount > 0 && checkedCount < totalCount;
    }
}

function attachItemButtonEvents() {
    const editButtons = document.querySelectorAll('.edit-item-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-item-id');
            // TODO: Implement edit item functionality
        });
    });
    const deleteButtons = document.querySelectorAll('.delete-item-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-item-id');
            // TODO: Implement delete item functionality
        });
    });
}

// Attach click events to table rows for navigation
function attachRowClickEvents(inventoryId: string) {
    const tableRows = document.querySelectorAll('.items-table tbody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if ((target as HTMLInputElement).type === 'checkbox' || target.closest('input[type="checkbox"]')) {
                return;
            }
            const itemId = (row as HTMLElement).getAttribute('data-item-id');
            if (itemId && itemId !== 'N/A') {
                router.navigate(`/inventories/${inventoryId}/item/${itemId}`);
            }
        });
    });
}

// Modal functions
export async function openEditModal(inventoryId: number) {
    try {
        const inventory = await getInventory(inventoryId);
        const titleInput = document.getElementById('edit-title') as HTMLInputElement;
        const descriptionInput = document.getElementById('edit-description') as HTMLTextAreaElement;
        const categoryInput = document.getElementById('edit-category') as HTMLInputElement;
        const tagsInput = document.getElementById('edit-tags') as HTMLInputElement;
        const imageUrlInput = document.getElementById('edit-imageUrl') as HTMLInputElement;
        const isPublicInput = document.getElementById('edit-isPublic') as HTMLInputElement;

        if (titleInput) titleInput.value = inventory.title || '';
        if (descriptionInput) descriptionInput.value = inventory.description || '';
        if (categoryInput) categoryInput.value = inventory.category || '';
        if (tagsInput) tagsInput.value = inventory.tags?.join(', ') || '';
        if (imageUrlInput) imageUrlInput.value = inventory.imageUrl || '';
        if (isPublicInput) isPublicInput.checked = inventory.isPublic;

        const modal = document.getElementById('edit-inventory-modal');
        if (modal) {
            modal.style.display = 'block';
        }
        attachModalEventListeners(inventoryId);
    } catch (error) {
        UIUtils.showModalForMessages('Error loading inventory data for editing: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

function attachModalEventListeners(inventoryId: number) {
    const closeBtn = document.getElementById('close-edit-modal');
    const cancelBtn = document.getElementById('cancel-edit');
    const modal = document.getElementById('edit-inventory-modal');
    const closeModal = () => {
        if (modal) modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    const form = document.getElementById('inventory-edit-form') as HTMLFormElement;
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await handleEditFormSubmit(inventoryId);
        };
    }
}

async function handleEditFormSubmit(inventoryId: number) {
    try {
        const form = document.getElementById('inventory-edit-form') as HTMLFormElement;
        const formData = new FormData(form);
        const tagsString = formData.get('tags') as string;
        const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
        const title = (formData.get('title') as string)?.trim();
        const description = (formData.get('description') as string)?.trim();
        const categoryId = (formData.get('categoryId') as string)?.trim();

        let imageUrl = (formData.get('imageUrl') as string)?.trim();
        const imageFile = formData.get('attachImage') as File;
        
        // Handle image upload with user feedback
        if (imageFile && imageFile.size > 0) {
            const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            const originalText = submitBtn?.textContent || 'Save Changes';
            
            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Uploading image...';
                }
                
        
                imageUrl = await uploadImageToCloudinary(imageFile);
        
                
                if (submitBtn) {
                    submitBtn.textContent = 'Saving changes...';
                }
            } catch (err) {
                console.error('Error uploading image:', err);
                UIUtils.showModalForMessages('Error uploading image: ' + (err instanceof Error ? err.message : 'Unknown error'));
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
                return;
            }
        }

        if (!title) {
            UIUtils.showModalForMessages('Title is required');
            return;
        }
        if (!categoryId || categoryId === "Select a category") {
            UIUtils.showModalForMessages('Category is required');
            return;
        }

        const categories = await getCategories();
        const selectedCategory = categories.find(cat => cat.id.toString() === categoryId);
        
        if (!selectedCategory) {
            UIUtils.showModalForMessages('Invalid category selected');
            return;
        }
        
        const categoryName = selectedCategory.name;


        const updateData: UpdateInventoryDto = {
            title: title,
            categoryName: categoryName,
            isPublic: formData.get('isPublic') === 'on'
        };

        if (description) {
            updateData.description = description;
        }
        if (tags.length > 0) {
            updateData.tags = tags;
        }
        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }
        await updateInventory(inventoryId, updateData);

        const modal = document.getElementById('edit-inventory-modal');
        if (modal) modal.style.display = 'none';
        UIUtils.showModalForMessages('Inventory updated successfully!');
        Router.navigate(`/inventories/${inventoryId}`);

    } catch (error) {
        UIUtils.showModalForMessages('Error updating inventory: ' + (error instanceof Error ? error.message : 'Unknown error'));
        const submitBtn = document.querySelector('#inventory-edit-form button[type="submit"]') as HTMLButtonElement;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    }
}

// Initialize toolbars with permission checking
async function initializeToolbarsWithPermissions(inventoryId: number) {
    try {
        // Check if user is authenticated
        const isAuthenticated = UIUtils.isUserAuthenticated();
        if (!isAuthenticated) {
            // For unauthenticated users, only show "Add Item" button if inventory is public
            if (currentInventory?.isPublic) {
                const itemsToolbar = document.getElementById('items-action-toolbar');
                if (itemsToolbar) {
                    itemsToolbar.style.display = 'block';
                    initializeItemsToolbarForPublicInventory();
                }
            }
            return;
        }
        
        currentInventoryPermissions = await getUserInventoryPermissions(inventoryId);
        
        // Show toolbar if user has permissions OR if inventory is public
        if (currentInventoryPermissions.canEditItems || currentInventoryPermissions.canDeleteItems || currentInventory?.isPublic) {
            const itemsToolbar = document.getElementById('items-action-toolbar');
            if (itemsToolbar) {
                itemsToolbar.style.display = 'block';
                initializeItemsToolbar();
            }
        }

    } catch (error) {
        // In case of error, still check if inventory is public to allow adding items
        if (currentInventory?.isPublic) {
            const itemsToolbar = document.getElementById('items-action-toolbar');
            if (itemsToolbar) {
                itemsToolbar.style.display = 'block';
                initializeItemsToolbarForPublicInventory();
            }
        }
    }
}

// Initialize items action toolbar
function initializeItemsToolbar() {
    const selectAllCheckbox = document.getElementById('select-all-items') as HTMLInputElement;
    const editButton = document.getElementById('edit-selected-items') as HTMLButtonElement;
    const deleteButton = document.getElementById('delete-selected-items') as HTMLButtonElement;
    const addItemButton = document.getElementById(`add-item-${currentInventoryPermissions?.inventoryId}`) as HTMLButtonElement;
    const selectedCount = document.getElementById('selected-count');

    // Handle permissions for buttons
    if (!currentInventoryPermissions?.canEditItems) {
        editButton.style.display = 'none';
    }
    if (!currentInventoryPermissions?.canDeleteItems) {
        deleteButton.style.display = 'none';
    }

    // Select all functionality
    selectAllCheckbox?.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const itemCheckboxes = document.querySelectorAll('.item-checkbox') as NodeListOf<HTMLInputElement>;
        
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = target.checked;
            const itemId = parseInt(checkbox.value);
            if (target.checked) {
                selectedItemIds.add(itemId);
            } else {
                selectedItemIds.delete(itemId);
            }
        });
        
        updateToolbarState();
    });

    // Edit selected items
    editButton?.addEventListener('click', () => {
        if (selectedItemIds.size === 0) {
            UIUtils.showModalForMessages('Please select items to edit');
            return;
        }
        openBulkEditModal();
    });

    // Delete selected items
    deleteButton?.addEventListener('click', () => {
        if (selectedItemIds.size === 0) {
            UIUtils.showModalForMessages('Please select items to delete');
            return;
        }
        confirmBulkDelete();
    });

    // Add new item
    addItemButton?.addEventListener('click', () => {
        openAddItemModal();
    });
}

// Initialize items toolbar for public inventories (limited functionality)
function initializeItemsToolbarForPublicInventory() {
    const selectAllCheckbox = document.getElementById('select-all-items') as HTMLInputElement;
    const editButton = document.getElementById('edit-selected-items') as HTMLButtonElement;
    const deleteButton = document.getElementById('delete-selected-items') as HTMLButtonElement;
    const addItemButton = document.getElementById(`add-item-${currentInventory?.id}`) as HTMLButtonElement;
    const selectedCount = document.getElementById('selected-count');
    const label = document.querySelector('.select-all-label') as HTMLLabelElement;

    if (label) label.style.display = 'none';
    // Hide edit and delete buttons for public inventories without permissions
    if (editButton) editButton.style.display = 'none';
    if (deleteButton) deleteButton.style.display = 'none';
    if (selectAllCheckbox) selectAllCheckbox.style.display = 'none';
    if (selectedCount) selectedCount.style.display = 'none';
    // Only show "Add Item" button for public inventories
    addItemButton?.addEventListener('click', () => {
        openAddItemModal();
    });
}


// Update toolbar button states
function updateToolbarState() {
    const selectedCount = document.getElementById('selected-count');
    const editButton = document.getElementById('edit-selected-items') as HTMLButtonElement;
    const deleteButton = document.getElementById('delete-selected-items') as HTMLButtonElement;

    const count = selectedItemIds.size;
    if (selectedCount) {
        selectedCount.textContent = `${count} items selected`;
    }

    if (editButton) editButton.disabled = count === 0;
    if (deleteButton) deleteButton.disabled = count === 0;
}

// Bulk edit modal functions
function openBulkEditModal() {
    UIUtils.showModalForMessages('Edit functionality coming soon!');
}

function confirmBulkDelete() {
    UIUtils.ModalForConfirmation(
        `Are you sure you want to delete ${selectedItemIds.size} selected items? This action cannot be undone.`,
        () => executeBulkDelete(),

    );
}

async function executeBulkDelete() {
    try {
        const itemCheckboxes = document.querySelectorAll('.item-checkbox') as NodeListOf<HTMLInputElement>;
        const itemIdsToDelete = Array.from(selectedItemIds);

        await deleteItems(itemIdsToDelete);
        selectedItemIds.clear();
        updateToolbarState();
        Router.navigate(`/inventories/${currentInventoryPermissions?.inventoryId}`);
        
        UIUtils.showModalForMessages('Items deleted successfully!');
    } catch (error) {
        console.error('Error deleting items:', error);
        UIUtils.showModalForMessages('Error deleting items. Please try again.');
    }
}

function applyFieldOperation() {
    const fieldSelector = document.getElementById('field-selector') as HTMLSelectElement;
    const operationSelector = document.getElementById('operation-selector') as HTMLSelectElement;
    const newValueInput = document.getElementById('new-field-value') as HTMLInputElement;

    const field = fieldSelector.value;
    const operation = operationSelector.value;
    const newValue = newValueInput.value;

    UIUtils.showModalForMessages(`Field operation: ${operation} on ${field} for ${selectedItemIds.size} items. Implementation coming soon!`);
}

// Add Item Modal Functions
function openAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    if (modal) {
        modal.style.display = 'block';
        const form = document.getElementById('add-item-form') as HTMLFormElement;
        if (form) {
            form.reset();
        }
        populateCustomFieldsForAdd();
        attachAddItemModalEventListeners();
    }
}

function populateCustomFieldsForAdd() {
    const container = document.getElementById('custom-fields-container');
    if (!container) return;
    
    const inventory = currentInventory;
    if (!inventory || !inventory.customFields || inventory.customFields.length === 0) {

        return;
    }
    
    
    container.innerHTML = '';
    
    // Generate custom fields based on the inventory configuration
    inventory.customFields.forEach((field) => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', `custom-field-${field.id}`);
        label.textContent = `${field.name}:`;
        
        let input: HTMLElement;
        
        switch (field.type.toLowerCase()) {
            case 'text':
            case 'string':
                input = document.createElement('input');
                (input as HTMLInputElement).type = 'text';
                (input as HTMLInputElement).id = `custom-field-${field.id}`;
                (input as HTMLInputElement).name = `custom_field_${field.id}`;
                (input as HTMLInputElement).placeholder = `Enter ${field.name}`;
                break;
                
            case 'number':
            case 'integer':
                input = document.createElement('input');
                (input as HTMLInputElement).type = 'number';
                (input as HTMLInputElement).id = `custom-field-${field.id}`;
                (input as HTMLInputElement).name = `custom_field_${field.id}`;
                (input as HTMLInputElement).placeholder = `Enter ${field.name}`;
                break;
                
            case 'checkbox':
            case 'boolean':
                input = document.createElement('input');
                (input as HTMLInputElement).type = 'checkbox';
                (input as HTMLInputElement).id = `custom-field-${field.id}`;
                (input as HTMLInputElement).name = `custom_field_${field.id}`;
                break;
                
            case 'date':
            case 'datetime':
                input = document.createElement('input');
                (input as HTMLInputElement).type = 'datetime-local';
                (input as HTMLInputElement).id = `custom-field-${field.id}`;
                (input as HTMLInputElement).name = `custom_field_${field.id}`;
                break;
                
            case 'decimal':
                input = document.createElement('input');
                (input as HTMLInputElement).type = 'number';
                (input as HTMLInputElement).step = '0.0001';
                (input as HTMLInputElement).id = `custom-field-${field.id}`;
                (input as HTMLInputElement).name = `custom_field_${field.id}`;
                (input as HTMLInputElement).placeholder = `Enter ${field.name}`;
                break;
                
            default:
                input = document.createElement('input');
                (input as HTMLInputElement).type = 'text';
                (input as HTMLInputElement).id = `custom-field-${field.id}`;
                (input as HTMLInputElement).name = `custom_field_${field.id}`;
                (input as HTMLInputElement).placeholder = `Enter ${field.name}`;
                break;
        }
        
        // Store field metadata for form submission
        input.setAttribute('data-field-name', field.name);
        input.setAttribute('data-field-type', field.type);
        input.setAttribute('data-field-id', field.id.toString());
        
        fieldGroup.appendChild(label);
        fieldGroup.appendChild(input);
        container.appendChild(fieldGroup);
    });
    
}

function attachAddItemModalEventListeners() {
    const closeBtn = document.getElementById('close-add-item-modal');
    const cancelBtn = document.getElementById('cancel-add-item');
    const modal = document.getElementById('add-item-modal');
    const form = document.getElementById('add-item-form') as HTMLFormElement;

    const closeModal = () => {
        if (modal) modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await handleAddItemFormSubmit();
        };
    }
}

async function handleAddItemFormSubmit() {
    try {
        const form = document.getElementById('add-item-form') as HTMLFormElement;
        const formData = new FormData(form);
        
        const name = (formData.get('name') as string)?.trim();
        const customId = (formData.get('customId') as string)?.trim();
        const description = (formData.get('description') as string)?.trim();
        const itemImage = formData.get('itemImage') as File;
        let imageUrl: string | undefined;

        if (itemImage && itemImage.size > 0) {
            const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            const originalText = submitBtn?.textContent || 'Add Item';
            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Uploading image...';
                }
        
                imageUrl = await uploadImageToCloudinary(itemImage);
        
                if (submitBtn) {
                    submitBtn.textContent = 'Adding Item...';
                }
            } catch (err) {
                console.error('Error uploading item image:', err);
                UIUtils.showModalForMessages('Error uploading image: ' + (err instanceof Error ? err.message : 'Unknown error'));
            }
        }

        if (!name) {
            UIUtils.showModalForMessages('Item name is required');
            return;
        }

        // Get inventory ID from permissions or current inventory
        const inventoryId = currentInventoryPermissions?.inventoryId || currentInventory?.id;
        if (!inventoryId) {
            UIUtils.showModalForMessages('Invalid inventory ID');
            return;
        }

        // Collect custom field values from the form
        const customFieldValues: CustomFieldValueDto[] = [];
        const customFieldInputs = form.querySelectorAll('[data-field-name]') as NodeListOf<HTMLInputElement>;
        

        
        customFieldInputs.forEach((input) => {
            const fieldName = input.getAttribute('data-field-name');
            const fieldType = input.getAttribute('data-field-type');
            const fieldId = input.getAttribute('data-field-id');
            
    
            
            if (fieldName && fieldType && fieldId) {
                let value: string | undefined;
                
                switch (fieldType.toLowerCase()) {
                    case 'checkbox':
                    case 'boolean':
                        value = (input as HTMLInputElement).checked.toString();
                        break;
                    case 'date':
                    case 'datetime':
                        if (input.value) {
                            value = new Date(input.value).toISOString();
                        }
                        break;
                    default:
                        value = input.value.trim() || undefined;
                        break;
                }
                
                if (value && (value !== 'false' || fieldType.toLowerCase().includes('checkbox'))) {
                    customFieldValues.push({
                        fieldId: parseInt(fieldId),
                        name: fieldName,
                        type: fieldType,
                        value: value
                    });
                }
            }
        });



        const itemData: CreateItemDto = {
            inventoryId: inventoryId,
            name: name,
            description: description || undefined,
            customId: customId || undefined,
            customFieldValues: customFieldValues,
            ImgUrl: imageUrl
        };

        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
        }

        await createItem(itemData);

        const modal = document.getElementById('add-item-modal');
        if (modal) modal.style.display = 'none';
        
        UIUtils.showModalForMessages('Item added successfully!');
        
        const inventoryIdStr = inventoryId.toString();
        await loadItemsTable(inventoryIdStr);
        router.navigate(`/inventories/${inventoryIdStr}`);
    } catch (error) {
        console.error('Error adding item:', error);
        UIUtils.showModalForMessages('Error adding item: ' + (error instanceof Error ? error.message : 'Unknown error'));
        const submitBtn = document.querySelector('#add-item-form button[type="submit"]') as HTMLButtonElement;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Item';
        }
    }
}

function escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}