import { UIUtils } from '../utils/ui';
import { getPopularTags } from '../../services/inventoryServices';
import { Tag } from '../../interfaces/TagInterface';
import { getInventories } from '../../services/inventoryServices';
import { InventoryDto } from '../../interfaces/InventoryDtoInterface';
import { AuthService } from '../../services/auth';
import { Router } from '../router/router';

const router = Router.getInstance();

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
        <div class="scroll-container">
          <div class="scroll-track" id="recent-inventories">
            <!-- Dynamic content will be loaded here -->
          </div>
        </div>
      </section>
      
      <section class="featured-section">
        <div class="section-header">
          <h2>Popular Inventories</h2>
          <a href="/inventories?sort=popular" data-navigate="/inventories">View All</a>
        </div>
        <div class="scroll-container">
          <div class="scroll-track" id="popular-inventories">
            <!-- Dynamic content will be loaded here -->
          </div>
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
  loadPopularInventories();
  loadTagCloud();
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
    loadRecentInventories();
  });
}

async function loadRecentInventories() {
  const container = document.getElementById('recent-inventories');
  if (!container) return;
  
  const inventories = await getInventories();
  inventories.length = 5; // Limit to 5 inventories
  inventories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  container.innerHTML = inventories.map((inv: InventoryDto, index: number) => `
    <div class="scroll-item" data-index="${index}">
      <div class="inventory-card" data-inventory-id="${inv.id}">
        <div class="inventory-image">
          ${inv.imageUrl ? `<img src="${inv.imageUrl}" alt="${inv.title}">` : '<div class="image-placeholder">📦 </div>'}
        </div>
        <div class="inventory-info">
          <h3 class="navegar"><a href="/inventories/${inv.id}" data-navigate="/inventory/${inv.id}">${inv.title}</a></h3>
          <p class="inventory-category">${inv.category}</p>
          <p class="inventory-count">${inv.itemCount} Items</p>
          <p class="inventory-owner">Created by: ${inv.owner}</p>
        </div>
      </div>
    </div>
  `).join('');
  setTimeout(() => loadCardNavigation(), 100);
}

async function loadPopularInventories() {
  const container = document.getElementById('popular-inventories');
  if (!container) return;

  const inventories = await getInventories();
  inventories.sort((a, b) => b.itemCount - a.itemCount);
  inventories.length = 5; // Limit to 5 inventories

  container.innerHTML = inventories.map((inv, index) => `
    <div class="scroll-item" data-index="${index}">
      <div class="inventory-card" data-inventory-id="${inv.id}">
        <div class="inventory-image">
          ${inv.imageUrl ? `<img src="${inv.imageUrl}" alt="${inv.title}">` : '<div class="image-placeholder">📦</div>'}
        </div>
        <div class="inventory-info">
          <h3 class="navegar"><a href="/inventories/${inv.id}" data-navigate="/inventory/${inv.id}">${inv.title}</a></h3>
          <p class="inventory-category">${inv.category}</p>
          <p class="inventory-count">${inv.itemCount} Items</p>
          <p class="inventory-owner">Created by: ${inv.owner}</p>
          <div class="popularity-indicator">
            <span class="popularity-label">Popularity: ${inv.itemCount} items</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  setTimeout(() => loadCardNavigation(), 100);
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

function loadCardNavigation() {
  const cards = document.querySelectorAll('.inventory-card');
  cards.forEach(card => {
    card.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        return;
      }
      
      const inventoryId = card.getAttribute('data-inventory-id');
      if (inventoryId) {
        router.navigate(`/inventories/${inventoryId}`);
      }
    });
  });
}