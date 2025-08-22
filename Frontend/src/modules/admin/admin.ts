import { Route } from "../router/router";

export function adminPage(){
    return `
    <div class="admin-container">
      <h1>Admin Panel</h1>
      <p>Manage users, view system statistics, and perform administrative tasks.</p>
      
      <section class="admin-actions">
        <button class="btn btn-primary" onclick="showUserManagement()">Manage Users</button>
        <button class="btn btn-secondary" onclick="showSystemStats()">View System Statistics</button>
      </section>
      
      <section class="user-management" id="user-management">
        <!-- User management content will be loaded here -->
      </section>
      
      <section class="system-stats" id="system-stats">
        <!-- System statistics content will be loaded here -->
      </section>
    `
}