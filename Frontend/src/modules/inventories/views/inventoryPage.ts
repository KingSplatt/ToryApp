import { getInventory } from "../services/inventoryServices";
import { InventoryDto } from "../interfaces/InventoryDtoInterface";
import { createLayout } from "../../layout/layout";
import "./inventoryPage.css"
import { UIUtils } from "../../utils/ui";
import { uint32 } from "zod";
import { getItemsForInventory } from "../../items/services/itemServices";

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
    const inventory = await takeInventory(idInventory);
    attachButtons();
    // Load items by default
    await loadItemsTable(idInventory);
};

async function takeInventory(idInventory: string): Promise<InventoryDto> {
  const inventory = await getInventory(parseInt(idInventory));
  console.log('Inventory loaded:', inventory);
  const inventoryDetails = document.getElementById('inventory-details');
  if (inventoryDetails) {
    inventoryDetails.innerHTML = `
    <section class="inventory-info">
        <section class="inventory-header">
            <section class="inventory-card">
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
    `;
  }
  return inventory;
}

export function loadToolBarItems(){
    
}

export function attachButtons(){
    const editButtons = document.querySelectorAll('[id^="edit-inventory-"]');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inventoryId = button.id.split('-')[2];
            console.log('Edit inventory:', inventoryId);
        });
    });

    const discussButtons = document.querySelectorAll('[id^="discuss-inventory-"]');
    discussButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inventoryId = button.id.split('-')[2];
            console.log('Discuss inventory:', inventoryId);
        });
    });

    const itemsButtons = document.querySelectorAll('[id^="items-inventory-"]');
    itemsButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const inventoryId = button.id.split('-')[2];
            console.log('Toggle items visibility for inventory:', inventoryId);
            
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
    console.log('Items loaded:', items);
}

export async function loadItemsTable(inventoryId: string) {
    try {
        const items = await getItemsForInventory(parseInt(inventoryId));
        console.log('Items loaded for table:', items);
        
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
                        console.log('Add new item to inventory:', inventoryId);
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
            console.log('Edit item:', itemId);
            // TODO: Implement edit item functionality
        });
    });

    // Delete item buttons
    const deleteButtons = document.querySelectorAll('.delete-item-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-item-id');
            console.log('Delete item:', itemId);
            // TODO: Implement delete item functionality
        });
    });
}