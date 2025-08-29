import { getUserInventories } from "../../inventories/services/inventoryServices";
import { AuthService } from "../../login/services/auth";
import { Router } from "../../router/router";
import { InventoryDto } from "../../inventories/interfaces/InventoryDtoInterface";
import "./ownInventory.css"

export function ownInventory(){
    return `
    <div class="inventory-container">
      <h1>Your Inventories</h1>
      <div class="inventories-list">

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
  const inventoryItemsContainer = document.querySelector('.inventories-list');
  if (!inventoryItemsContainer) return;

  inventoryItemsContainer.innerHTML = '';

  loadUserInventories().then(InventoryDto => {
    InventoryDto.forEach(tory => {
      const tableElement = document.createElement('table');
      tableElement.classList.add('table-inventories');
      tableElement.innerHTML = `
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Category</th>
          <th>Total Custom Fields</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${tory.title}</td>
          <td>${tory.description}</td>
          <td>${tory.category}</td>
          <td>${tory.customFields.length}</td>
        </tr>
      </tbody>
      `;
      inventoryItemsContainer.appendChild(tableElement);
    });
  });
}

async function loadUserInventories() {
    const user = AuthService.getInstance().getUser();
    const inventories = await getUserInventories(user?.id || '');
    console.log(inventories);
    return inventories;
}