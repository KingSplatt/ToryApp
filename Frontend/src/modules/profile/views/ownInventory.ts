import { getUserInventories } from "../../inventories/services/inventoryServices";
import { AuthService } from "../../login/services/auth";
import { Router } from "../../router/router";
import { InventoryDto } from "../../inventories/interfaces/InventoryDtoInterface";

export function ownInventory(){
    return `
    <div class="inventory-container">
      <h1>Your Inventory</h1>
      <div class="inventory-items">
        <!-- Inventory items will be dynamically loaded here -->
      </div>
    </div>
    `
}

export function initOwnInventory() {
    ownInventory();
    loadUserInventories();
    loadTableOfInventories();
}

export function loadTableOfInventories(){
  const inventoryItemsContainer = document.querySelector('.inventory-items');
  if (!inventoryItemsContainer) return;

  inventoryItemsContainer.innerHTML = '';

  loadUserInventories().then(InventoryDto => {
    InventoryDto.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('inventory-item');
      itemElement.innerHTML = `
        <h2>${item.title}</h2>
        <p>${item.description}</p>
      `;
      inventoryItemsContainer.appendChild(itemElement);
    });
  });
}

async function loadUserInventories() {
    const user = AuthService.getInstance().getUser();
    const inventories = await getUserInventories(user?.id || '');
    console.log(inventories);
    return inventories;
}