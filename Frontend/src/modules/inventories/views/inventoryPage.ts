import { getInventory } from "../services/inventoryServices";
import { InventoryDto } from "../interfaces/InventoryDtoInterface";
import { createLayout } from "../../layout/layout";
import "./inventoryPage.css"
import { UIUtils } from "../../utils/ui";
import { uint32 } from "zod";

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
    takeInventory(idInventory);
};

async function takeInventory(idInventory: string): Promise<InventoryDto> {
  const inventory = await getInventory(parseInt(idInventory));
  console.log('Inventory loaded:', inventory);
  const inventoryDetails = document.getElementById('inventory-details');
  if (inventoryDetails) {
    inventoryDetails.innerHTML = `
      <h2>${inventory.title || 'Untitled Inventory'}</h2>
      <h3>${inventory.description || 'No description available'}</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Category</th>
            <th>Is Public</th>
            <th>Owner</th>
            <th>Items</th>
            <th>Last Updated</th>
            <th>Tags</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${inventory.title || 'Untitled Inventory'}</td>
          <td>${inventory.description || 'No description available'}</td>
          <td>${inventory.category || 'Uncategorized'}</td>
          <td>${inventory.isPublic ? 'Yes' : 'No'}</td>
          <td>${inventory.owner}</td>
          <td>${inventory.itemCount}</td>
          <td>${new Date(inventory.lastUpdated).toLocaleDateString()}</td>
          <td>
            ${inventory.tags.length > 0 ? inventory.tags.map(tag => `<span class="list-tag">${tag}</span>`).join(', ') : '<span>No tags</span>'}
          </td>
        </tr>
      </tbody>
    </table>
    `;
  }
  return inventory;
}

export function loadToolBar(){
    
}