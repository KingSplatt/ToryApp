import { getInventory, updateInventory } from "../services/inventoryServices";
import { InventoryDto } from "../interfaces/InventoryDtoInterface";
import { UpdateInventoryDto } from "../interfaces/UpdateInventoryDto";
import { createLayout } from "../../layout/layout";
import "./inventoryPage.css"
import { UIUtils } from "../../utils/ui";
import { uint32 } from "zod";
import { getItemsForInventory } from "../../items/services/itemServices";
import { getCategories,createCategory } from "../services/categoryServices";
import { Router } from "../../router/router";

const router = Router.getInstance();

export function inventoryPage(){
    const isAuthenticated = UIUtils.isUserAuthenticated();
    const User = UIUtils.getCurrentUser();
    const isAdmin = UIUtils.isAdmin();
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
    
    const inventory = await takeInventory(idInventory);
    attachButtons();
    // Load items by default
    await loadItemsTable(idInventory);
};

async function takeInventory(idInventory: string): Promise<InventoryDto> {
  const inventory = await getInventory(parseInt(idInventory));
  const categories = await getCategories();
  
  const inventoryDetails = document.getElementById('inventory-details');
  if (inventoryDetails) {
    inventoryDetails.innerHTML = `
    <section class="inventory-info">
        <section class="inventory-header">
            <section class="inventory-cards">
                <h2>${inventory.title || 'Untitled Inventory'}</h2>
                <hr>
                <h3>${inventory.description || 'No description available'}</h3>
                <hr>
                <section class="inventory-meta">
                    <section class="inventory-meta-owner">
                        <table class="inventory-meta-table">
                            <thead>
                                <tr>
                                    <th>Owner:</th>
                                    <td>${inventory.owner}</td>
                                </tr>
                                <tr>
                                    <th>Description:</th>
                                    <td>${inventory.description || 'No description available'}</td>
                                </tr>
                                <tr>
                                    <th>Category:</th>
                                    <td>${inventory.category || 'Uncategorized'}</td>
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
                                    <td>${inventory.tags.length > 0 ? inventory.tags.map(tag => `<span class="list-tag">${tag}</span>`).join(', ') : '<span>No tags</span>'}</td>
                                </tr>
                            </thead>
                        </table>
                    </section>
                    
                    <section class="inventory-meta-img">
                        <section class="inventory-image">
                            <img src="${inventory.imageUrl || 'placeholder.jpg'}" alt="${inventory.title || 'Untitled Inventory'}">
                        </section>
                    </section>
                </section>
            </section>
        </section>
        <section class="inventory-control">
            <section class="inventory-actions">
                <button class="btn btn-secondary" id="edit-inventory-${inventory.id}">Edit</button>
                <button class="btn btn-primary" id="discuss-inventory-${inventory.id}">Discussion post</button>
                <button class="btn btn-secondary" id="items-inventory-${inventory.id}">Hide Items</button>
            </section>
            </section>
        <section class="inventory-meta-actions">
        </section>
    </table>
    </section>
    <section class="inventory-items-section" id="inventory-items-section" style="display: block;">
        <h3>Items in this Inventory</h3>
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
                            <option value="Select a category">Select a category</option>
                            ${categories.map(category => `<option value="${category.id}">${category.name}</option>`).join("")}
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
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-edit">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
  }
  return inventory;
}

export function loadToolBarItems(){
    
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

    const discussButtons = document.querySelectorAll('[id^="discuss-inventory-"]');
    discussButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inventoryId = button.id.split('-')[2];
    
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

        
        const tableContainer = document.getElementById('items-table-container');
        if (tableContainer) {
            if (items && items.length > 0) {
                const tableHTML = `
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Custom ID</th>
                                <th>Description</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((item: any) => `
                                <tr>
                                    <td>${item.id || 'N/A'}</td>
                                    <td>${item.customid || 'N/A'}</td>
                                    <td>${item.description || 'No description'}</td>
                                    <td>${item.createdat ? new Date(item.createdat).toLocaleDateString() : 'N/A'}</td>
                                    <td>${item.updatedat ? new Date(item.updatedat).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary edit-item-btn" data-item-id="${item.id}">Edit</button>
                                        <button class="btn btn-sm btn-danger delete-item-btn" data-item-id="${item.id}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                tableContainer.innerHTML = tableHTML;
                
                // Attach event listeners for item actions
                attachItemButtonEvents();
            } else {
                tableContainer.innerHTML = `
                    <div class="no-items-message">
                        <p>No items found in this inventory.</p>
                        <button class="btn btn-primary" id="add-item-btn">Add First Item</button>
                    </div>
                `;
                
                // Attach event listener for add item button
                const addItemBtn = document.getElementById('add-item-btn');
                if (addItemBtn) {
                    addItemBtn.addEventListener('click', () => {
                
                        // TODO: Implement add item functionality
                    });
                }
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

function attachItemButtonEvents() {
    // Edit item buttons
    const editButtons = document.querySelectorAll('.edit-item-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-item-id');
    
            // TODO: Implement edit item functionality
        });
    });

    // Delete item buttons
    const deleteButtons = document.querySelectorAll('.delete-item-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-item-id');
    
            // TODO: Implement delete item functionality
        });
    });
}

// Modal functions
export async function openEditModal(inventoryId: number) {
    try {
        // Get current inventory data
        const inventory = await getInventory(inventoryId);

        
        // Populate form fields
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


        // Show modal
        const modal = document.getElementById('edit-inventory-modal');
        if (modal) {
            modal.style.display = 'block';
        }

        // Attach modal event listeners
        attachModalEventListeners(inventoryId);
    } catch (error) {
        console.error('Error opening edit modal:', error);
        UIUtils.showModalForMessages('Error loading inventory data for editing: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

function attachModalEventListeners(inventoryId: number) {
    // Close modal events
    const closeBtn = document.getElementById('close-edit-modal');
    const cancelBtn = document.getElementById('cancel-edit');
    const modal = document.getElementById('edit-inventory-modal');

    const closeModal = () => {
        if (modal) modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    
    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };

    // Form submission
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

        const imageUrl = (formData.get('imageUrl') as string)?.trim();

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



        // Show loading state
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
        console.error('Error updating inventory:', error);
        UIUtils.showModalForMessages('Error updating inventory: ' + (error instanceof Error ? error.message : 'Unknown error'));

        // Reset button state
        const submitBtn = document.querySelector('#inventory-edit-form button[type="submit"]') as HTMLButtonElement;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    }
}