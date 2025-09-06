import { getUserInventoriesWithWriteAccess } from "../../../services/inventoryServices";
import { AuthService } from "../../../services/auth";
import { InventoryDto } from "../../../interfaces/InventoryDtoInterface";
import { UIUtils } from "../../utils/ui";
import "../styles/sharedInventory.css";
import { Router } from "../../router/router";


const router = Router.getInstance();
export function sharedInventory() {
  return `
    <div class="inventory-container">
      <h1>Shared Inventories</h1>
      <div class="inventory-items">
        <!-- Shared inventory items will be dynamically loaded here -->
      </div>
    </div>
  `;
}

export function initSharedInventory() {
    sharedInventory();
    const user = loadUser();
    if (user?.id) {
        loadSharedInventories(user.id);
    }
    loadTableSharedInventories();
}

function loadUser(){
  const authService = AuthService.getInstance();
  const user = authService.getUser();
  return user;
}

async function loadSharedInventories(userId: string) {
  try {
    const inventories = await getUserInventoriesWithWriteAccess(userId);
    return inventories;
  } catch (error) {
    UIUtils.showModalForMessages("Error loading shared inventories. Please try again.");
  }
}

function loadTableSharedInventories(){
  const inventoryItemsShared = document.querySelector('.inventory-items');
  if(!inventoryItemsShared){
    return;
  }
  inventoryItemsShared.innerHTML = ``;
  const user = loadUser();
  if (!user?.id) {
    return;
  }
  loadSharedInventories(user.id).then(InventoryDto => {
    const tableElement = document.createElement('table');
    tableElement.classList.add('table-inventories');
    tableElement.innerHTML = `
    <thead>
      <tr>
        <th>Inventory Name</th>
        <th>Description</th>
        <th>Category</th>
        <th>Total Custom Fields</th>
      </tr>
    </thead>
    <tbody></tbody>
    `;

    const tbody = tableElement.querySelector('tbody');
    if(tbody && InventoryDto){
      InventoryDto.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('inventory-row-clickable');
        row.innerHTML = `
          <td>${item.title}</td>
          <td>${item.description}</td>
          <td>${item.category}</td>
          <td>${item.customFields.length}</td>
        `;

        row.addEventListener('click', () => {
          router.navigate(`/inventories/${item.id}`);
        });
        tbody.appendChild(row);
      });
    }
    inventoryItemsShared.appendChild(tableElement);
    inventoryItemsShared.classList.add('table-inventories');
  });

}
