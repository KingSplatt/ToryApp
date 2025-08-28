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
}
