import { User } from "../../login/interfaces/UserInterface";
import { Route } from "../../router/router";
import { getUsers, deleteUsers, blockUsers, unblockUsers,assignRoles,removeRoles } from "../services/UserServices";
import "./admin.css";

export function adminPage(){
    return `
    <div class="admin-container">
      <h1>Admin Panel</h1>
      <p>Manage users, view system statistics, and perform administrative tasks.</p>

      <section class="admin-actions">
        ${toolBar()}
      </section>

      <section class="admin-user-management-section" id="user-management">
        
      </section>
      
      <section class="admin-system-stats" id="system-stats">
        <!-- System statistics content will be loaded here -->
      </section>
    </div>
    `
}

export async function showUserManagement() {
  const userManagementSection = document.getElementById("user-management");
  if (!userManagementSection){
    console.error("User management section not found");
    return;
  }
  try {
    const users = await getUsers();
    console.log(users);
      userManagementSection.innerHTML = `
      <div class="admin-user-management">
        <h2>User Management</h2>
        <table class="admin-user-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" id="select-all" class="admin-select-all-checkbox" onchange="toggleSelectAll()">
              </th>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr class="${user.isBlocked ? 'blocked-user' : ''}">
                <td>
                  <input type="checkbox" class="admin-user-checkbox" value="${user.id}" onchange="updateToolBar()">
                </td>
                <td>${user.id}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>
                  <span class="status-badge ${user.isBlocked ? 'status-blocked' : 'status-active'}">
                    ${user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td>${user.roles ? user.roles.join(", ") : "No roles"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      `;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

export function toolBar() {
  return `
    <div class="admin-btn-toolbar">
      <div class="admin-btn-group">
        <button class="admin-btn admin-btn-secondary" id="delete-selected-btn" onclick="deleteSelectedUsers()" disabled>
          Delete Selected (<span class="admin-selected-count" id="selected-count">0</span>)
        </button>
        <button class="admin-btn admin-btn-warning" id="block-selected-btn" onclick="blockSelectedUsers()" disabled>
          🚫🔒
        </button>
        <button class="admin-btn admin-btn-success" id="unblock-selected-btn" onclick="unblockSelectedUsers()" disabled>
          🔐
        </button>
        <button class="admin-btn admin-btn-info" id="assign-role-btn" onclick="assignRolesToUser()" disabled>
          🔧
        </button>
        <button class="admin-btn admin-btn-danger" id="remove-role-btn" onclick="removeRolesFromUser()" disabled>
          🔧❌
        </button>
      </div>
      <div class="admin-btn-group">
        <button class="admin-btn admin-btn-outline-secondary" id="select-all-btn" onclick="toggleSelectAllUsers()">
          Select All
        </button>
        <button class="admin-btn admin-btn-outline-secondary" id="clear-selection-btn" onclick="clearSelection()">
          Clear Selection
        </button>
      </div>
    </div>
  `;
}

export function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById("select-all") as HTMLInputElement;
  const userCheckboxes = document.querySelectorAll(".admin-user-checkbox") as NodeListOf<HTMLInputElement>;
  
  if (selectAllCheckbox) {
    userCheckboxes.forEach((userCheckbox) => {
      userCheckbox.checked = selectAllCheckbox.checked;
    });
    updateToolBar();
  }
}

export function updateToolBar() {
  const checkedBoxes = document.querySelectorAll(".admin-user-checkbox:checked") as NodeListOf<HTMLInputElement>;
  const hasSelection = checkedBoxes.length > 0;
  
  const deleteSelectedBtn = document.getElementById("delete-selected-btn") as HTMLButtonElement;
  const blockSelectedBtn = document.getElementById("block-selected-btn") as HTMLButtonElement;
  const unblockSelectedBtn = document.getElementById("unblock-selected-btn") as HTMLButtonElement;
  const assignRoleBtn = document.getElementById("assign-role-btn") as HTMLButtonElement;
  const removeRoleBtn = document.getElementById("remove-role-btn") as HTMLButtonElement;
  const selectedCountSpan = document.getElementById("selected-count");

  if (deleteSelectedBtn) {
    deleteSelectedBtn.disabled = !hasSelection;
    if (hasSelection) {
      deleteSelectedBtn.classList.remove("admin-btn-secondary");
      deleteSelectedBtn.classList.add("admin-btn-danger");
    } else {
      deleteSelectedBtn.classList.remove("admin-btn-danger");
      deleteSelectedBtn.classList.add("admin-btn-secondary");
    }
  }

  if (blockSelectedBtn) {
    blockSelectedBtn.disabled = !hasSelection;
  }
  if (unblockSelectedBtn) {
    unblockSelectedBtn.disabled = !hasSelection;
  }
  if (selectedCountSpan) {
    selectedCountSpan.textContent = checkedBoxes.length.toString();
  }

  if (assignRoleBtn) {
    assignRoleBtn.disabled = !hasSelection;
  }

  if (removeRoleBtn) {
    removeRoleBtn.disabled = !hasSelection;
  }

  const userCheckboxes = document.querySelectorAll(".admin-user-checkbox") as NodeListOf<HTMLInputElement>;
  const allChecked = Array.from(userCheckboxes).every(checkbox => checkbox.checked);
  const selectAllCheckbox = document.getElementById("select-all") as HTMLInputElement;
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = allChecked && userCheckboxes.length > 0;
  }
}

export function toggleSelectAllUsers() {
  const selectAllCheckbox = document.getElementById("select-all") as HTMLInputElement;
  const userCheckboxes = document.querySelectorAll(".admin-user-checkbox") as NodeListOf<HTMLInputElement>;
  
  if (selectAllCheckbox) {
    const shouldSelectAll = !selectAllCheckbox.checked;
    selectAllCheckbox.checked = shouldSelectAll;
    userCheckboxes.forEach((checkbox) => {
      checkbox.checked = shouldSelectAll;
    });
    updateToolBar();
  }
}

export function clearSelection() {
  const userCheckboxes = document.querySelectorAll(".admin-user-checkbox") as NodeListOf<HTMLInputElement>;
  const selectAllCheckbox = document.getElementById("select-all") as HTMLInputElement;
  
  userCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = false;
  }
  
  updateToolBar();
}

export async function deleteSelectedUsers() {
  const checkedBoxes = document.querySelectorAll(".admin-user-checkbox:checked") as NodeListOf<HTMLInputElement>;
  const selectedUserIds = Array.from(checkedBoxes).map(checkbox => checkbox.value);
  
  if (selectedUserIds.length === 0) {
    alert("No users selected for deletion.");
    return;
  }
  
  const confirmMessage = `Are you sure you want to delete ${selectedUserIds.length} user(s)? This action cannot be undone.`;
  if (!confirm(confirmMessage)) {
    return;
  }
  
  try {
    console.log("Deleting users with IDs:", selectedUserIds);
    
    // Call the actual API to delete users
    await deleteUsers(selectedUserIds);
    
    alert(`Successfully deleted ${selectedUserIds.length} user(s).`);
    
    // Refresh the user list
    await showUserManagement();
    updateToolBar();
  } catch (error) {
    console.error("Error deleting users:", error);
    alert("Failed to delete users. Please try again.");
  }
}

// Helper function to get selected user IDs
export function getSelectedUserIds(): string[] {
  const checkedBoxes = document.querySelectorAll(".admin-user-checkbox:checked") as NodeListOf<HTMLInputElement>;
  return Array.from(checkedBoxes).map(checkbox => checkbox.value);
}
  
export async function blockSelectedUsers() {
  const selectedUserIds = getSelectedUserIds();
  
  if (selectedUserIds.length === 0) {
    alert("No users selected for blocking.");
    return;
  }
  
  try {
    await blockUsers(selectedUserIds);
    alert(`Successfully blocked ${selectedUserIds.length} user(s).`);
    await showUserManagement();
    updateToolBar();
  } catch (error) {
    console.error("Error blocking users:", error);
    alert("Failed to block users. Please try again.");
  }
}

export async function unblockSelectedUsers() {
  const selectedUserIds = getSelectedUserIds();
  
  if (selectedUserIds.length === 0) {
    alert("No users selected for unblocking.");
    return;
  }
  
  const confirmMessage = `Are you sure you want to unblock ${selectedUserIds.length} user(s)?`;
  if (!confirm(confirmMessage)) {
    return;
  }
  
  try {
    await unblockUsers(selectedUserIds);
    alert(`Successfully unblocked ${selectedUserIds.length} user(s).`);
    await showUserManagement();
    updateToolBar();
  } catch (error) {
    console.error("Error unblocking users:", error);
    alert("Failed to unblock users. Please try again.");
  }
}

export async function assignRolesToUser() {
  const selectedUser = getSelectedUserIds();
  const roleAdmin = ["Admin"];
  if (selectedUser.length === 0) {
    alert("No users selected for role assignment.");
    return;
  }

  try {
    await assignRoles(selectedUser, roleAdmin);
    alert(`Successfully assigned role ${roleAdmin.join(", ")} to user ${selectedUser.join(", ")}`);
    await showUserManagement();
  } catch (error) {
    console.error("Error assigning roles to user:", error);
    alert("Failed to assign roles to user. Please try again.");
  }
}

export async function removeRolesFromUser() {
  const selectedUserIds = getSelectedUserIds();
  const roleAdmin = ["Admin"];
  if (selectedUserIds.length === 0) {
    alert("No users selected for role removal.");
    return;
  }

  try {
    await removeRoles(selectedUserIds, roleAdmin);
    alert(`Successfully removed roles ${roleAdmin.join(", ")} from users ${selectedUserIds.join(", ")}`);
    await showUserManagement();
  } catch (error) {
    console.error("Error removing roles from user:", error);
    alert("Failed to remove roles from user. Please try again.");
  }
}

export function initAdminPage(){
    showUserManagement();
    
    // Make functions available globally for HTML onclick handlers
    (window as any).toggleSelectAll = toggleSelectAll;
    (window as any).updateToolBar = updateToolBar;
    (window as any).toggleSelectAllUsers = toggleSelectAllUsers;
    (window as any).clearSelection = clearSelection;
    (window as any).deleteSelectedUsers = deleteSelectedUsers;
    (window as any).blockSelectedUsers = blockSelectedUsers;
    (window as any).unblockSelectedUsers = unblockSelectedUsers;
    (window as any).assignRolesToUser = assignRolesToUser;
    (window as any).removeRolesFromUser = removeRolesFromUser;
}