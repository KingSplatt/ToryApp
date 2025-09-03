import { UIUtils } from '../utils/ui';
import { getPopularTags } from '../inventories/services/inventoryServices';
import { Tag } from '../inventories/interfaces/TagInterface';
import { getInventories } from '../inventories/services/inventoryServices';
import { InventoryDto } from '../inventories/interfaces/InventoryDtoInterface';

export function homePage() {
  const isAuthenticated = UIUtils.isUserAuthenticated();
  const User = UIUtils.getCurrentUser();
  const isAdmin = UIUtils.isAdmin();
  console.log('User:', User);
  const currentUser = UIUtils.getCurrentUser();
  const displayName = UIUtils.getUserDisplayName(currentUser);
  const userId = currentUser ? currentUser.id : null;
  console.log(displayName, userId, currentUser, 'Is Admin:', isAdmin);
  
  return `
    <div class="home-container">
      <section class="hero">
        ${isAuthenticated ? `
          <h1>¡Welcome, ${displayName}!</h1>
          <p>Management your inventories easily and collaboratively</p>
          <div class="hero-actions">
          </div>
        ` : `
          
        `}
      </section>
      
      <section class="featured-section">
        <div class="section-header">
          <h2>${isAuthenticated ? 'Recent Inventories' : 'Recent Inventories'}</h2>
          <a href="/inventories" data-navigate="/inventories">View All</a>
        </div>
        <div class="inventory-grid" id="recent-inventories">
          <!-- Dynamic content will be loaded here -->
        </div>
      </section>
      
      <section class="featured-section">
        <div class="section-header">
          <h2>Inventories with more tags</h2>
          <a href="/inventories?sort=popular" data-navigate="/inventories">View All</a>
        </div>
        <div class="inventory-grid" id="tags-inventories">
          <!-- Dynamic content will be loaded here -->
        </div>
      </section>
      
      <section class="tags-section">
        <h2>Search by tags</h2>
        <div class="tag-cloud" id="tag-cloud">
          <!-- Tags will be loaded dynamically -->
        </div>
      </section>
    </div>
  `;
}

// Initialize home page functionality
export function initializeHome() {
  loadRecentInventories();
  loadTagsInventories();
  loadTagCloud();
  
  // Listen for authentication state changes
  UIUtils.listenToAuthChanges((user) => {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      const isAuthenticated = user !== null;
      const displayName = UIUtils.getUserDisplayName(user);
      
      heroSection.innerHTML = isAuthenticated ? `
        <h1>¡Welcome, ${displayName}!</h1>
        <p>Management your inventories easily and collaboratively</p>
        <div class="hero-actions">
        </div>
      ` : `
        <h1>Welcome to ToryApp</h1>
        <p>Management your inventories easily and collaboratively</p>
        <div class="hero-actions">
        </div>
      `;
    }
  });
}

async function loadRecentInventories() {
  const container = document.getElementById('recent-inventories');
  if (!container) return;
  
  const inventories = await getInventories();
  inventories.length = 3;

  container.innerHTML = inventories.map((inv: InventoryDto) => `
    <div class="inventory-card">
      <div class="inventory-image">
        ${inv.imageUrl ? `<img src="${inv.imageUrl}" alt="${inv.title}">` : '<div class="image-placeholder">📦 </div>'}
      </div>
      <div class="inventory-info">
        <h3><a href="/inventory/${inv.id}" data-navigate="/inventory/${inv.id}">${inv.title}</a></h3>
        <p class="inventory-category">${inv.category}</p>
        <p class="inventory-count">${inv.itemCount} Items</p>
      </div>
    </div>
  `).join('');
}

async function loadTagsInventories() {
  const container = document.getElementById('tags-inventories');
  if (!container) return;

  const inventories = await getInventories();
  inventories.length = 3;
  inventories.sort((a, b) => b.tags.length - a.tags.length);

  container.innerHTML = inventories.map(inv => {
    const tagsToShow = inv.tags.slice(0, 3);
    const extraTags = inv.tags.length > 3 ? `<span class="tag">+${inv.tags.length - 3}</span>` : '';
    return `
      <div class="inventory-card">
        <div class="inventory-image">
          ${inv.imageUrl ? `<img src="${inv.imageUrl}" alt="${inv.title}">` : '<div class="image-placeholder">📦</div>'}
        </div>
        <div class="inventory-info">
          <h3><a href="/inventory/${inv.id}" data-navigate="/inventory/${inv.id}">${inv.title}</a></h3>
          <p class="inventory-category">${inv.category}</p>
          <p class="inventory-count">Tags count: ${inv.tags.length}</p>
          <div class="inventory-tags">
            ${tagsToShow.map(tag => `<span class="tag">${tag}</span>`).join('')}
            ${extraTags}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export async function loadTagCloud() {
  const container = document.getElementById('tag-cloud');
  if (!container) return;

  try {
    const tags = await getPopularTags();
    container.innerHTML = tags.map(tag => `
      <a href="/search?tag=${tag.id}" data-navigate="/search?tag=${tag.name}" class="tag-item">
        ${tag.name} (${tag.usageCount})
      </a>
    `).join('');
  } catch (error) {
    console.error("Error loading tag cloud:", error);
  }
}
