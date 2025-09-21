// Search page component
import { loadTagCloud } from "../home/home";
import { getTags } from "../../services/inventoryServices";
import { getPopularTags } from "../../services/inventoryServices";
import { getInventories } from "../../services/inventoryServices";
import "./search.css"

export function searchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialTag = urlParams.get('tag') || '';
  
  return `
    <div class="search-container">
      <div class="page-header">
        <h1>Search</h1>
        <p>Find inventories and items</p>
      </div>
      
      <div class="search-form">
        <div class="search-input-group">
          <input type="search" id="search-query" placeholder="Search inventories, items, tags..." value="${initialTag}">
          <button class="btn btn-primary" id="search-button">🔍</button>
        </div>
        
        <div class="search-filters">
          <div class="filter-row">
            <div class="filter-group">
              <label for="search-type">Search in:</label>
              <select id="search-type">
                <option value="all">All</option>
                <option value="inventories">Only Inventories</option>
                <option value="items">Only Items</option>
                <option value="tags">Only Tags</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label for="search-category">Category:</label>
              <select id="search-category">
                <option value="">All</option>
                <option value="electronica">Electronics</option>
                <option value="herramientas">Tools</option>
                <option value="libros">Books</option>
                <option value="hogar">Home</option>
                <option value="coleccion">Collection</option>
              </select>
            </div>
            
            <div class="filter-group">
                <label>Only Public</label>
                <input type="checkbox" id="public-only"> 
            </div>
          </div>
        </div>
      </div>

      <div class="card-inventories" id="card-inventoriess">
        <p>🔍 Searching for inventories...</p>
      </div>
      
      <div class="search-results" id="search-results">
        <div class="search-placeholder">
          <p>Or explore popular tags:</p>
          <div class="popular-tags" id="popular-search-tags">
            <!-- Popular tags will be loaded here -->
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initializeSearch() {
  setupSearchForm();
  loadPopularTags();
  loadCardInventories();

  // If there's an initial search query, perform the search
  const urlParams = new URLSearchParams(window.location.search);
  const initialTag = urlParams.get('tag');
  if (initialTag) {
    performSearch(initialTag);
  }
}

function setupSearchForm() {
  const searchInput = document.getElementById('search-query') as HTMLInputElement;
  const searchButton = document.getElementById('search-button');
  const searchType = document.getElementById('search-type') as HTMLSelectElement;
  const searchCategory = document.getElementById('search-category') as HTMLSelectElement;
  const publicOnly = document.getElementById('public-only') as HTMLInputElement;
  
  const doSearch = () => {
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
    }
  };
  
  searchButton?.addEventListener('click', doSearch);
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      doSearch();
    }
  });
  
  // Re-search when filters change
  [searchType, searchCategory, publicOnly].forEach(element => {
    element?.addEventListener('change', () => {
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query);
      }
    });
  });
}

async function performSearch(query: string) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;
  
  // Show loading state
  resultsContainer.innerHTML = '<div class="search-loading">🔍 Buscando...</div>';
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock search results
  const mockResults = {
    inventories: [
      {
        id: 1,
        title: 'Libros de Programación',
        description: 'Colección de libros técnicos y manuales de programación',
        category: 'Educación',
        itemCount: 25,
        tags: ['programación', 'libros', 'técnico'],
        relevance: 0.95
      }
    ],
    items: [
      {
        id: 101,
        name: 'Clean Code',
        inventoryId: 1,
        inventoryTitle: 'Libros de Programación',
        description: 'Libro sobre mejores prácticas en programación',
        relevance: 0.88
      }
    ],
    tags: [
      { name: 'programación', count: 15, relevance: 1.0 },
      { name: 'libros', count: 8, relevance: 0.75 }
    ]
  };
  
  const totalResults = mockResults.inventories.length + mockResults.items.length + mockResults.tags.length;
  
  resultsContainer.innerHTML = `
    <div class="search-summary">
      <h2>Resultados para "${query}"</h2>
      <p>${totalResults} resultados encontrados</p>
    </div>
    
    ${mockResults.inventories.length > 0 ? `
    <section class="results-section">
      <h3>Inventarios (${mockResults.inventories.length})</h3>
      <div class="results-list">
        ${mockResults.inventories.map(inv => `
          <div class="search-result-item">
            <h4><a href="/inventory/${inv.id}" data-navigate="/inventory/${inv.id}">${inv.title}</a></h4>
            <p>${inv.description}</p>
            <div class="result-meta">
              <span>📦 ${inv.itemCount} elementos</span>
              <span>📂 ${inv.category}</span>
              <div class="result-tags">
                ${inv.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}
    
    ${mockResults.items.length > 0 ? `
    <section class="results-section">
      <h3>Elementos (${mockResults.items.length})</h3>
      <div class="results-list">
        ${mockResults.items.map(item => `
          <div class="search-result-item">
            <h4><a href="/inventory/${item.inventoryId}/item/${item.id}" data-navigate="/inventory/${item.inventoryId}/item/${item.id}">${item.name}</a></h4>
            <p>${item.description}</p>
            <div class="result-meta">
              <span>📂 En: <a href="/inventory/${item.inventoryId}" data-navigate="/inventory/${item.inventoryId}">${item.inventoryTitle}</a></span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}
    
    ${mockResults.tags.length > 0 ? `
    <section class="results-section">
      <h3>Tags (${mockResults.tags.length})</h3>
      <div class="tag-results">
        ${mockResults.tags.map(tag => `
          <a href="/search?tag=${tag.name}" data-navigate="/search?tag=${tag.name}" class="tag-result">
            ${tag.name} (${tag.count})
          </a>
        `).join('')}
      </div>
    </section>
    ` : ''}
    
    ${totalResults === 0 ? `
    <div class="no-results">
      <p>No se encontraron resultados para "${query}"</p>
      <p>Intenta con otros términos o explora por categorías</p>
    </div>
    ` : ''}
  `;
}
function loadPopularTags() {
  const tagsContainer = document.getElementById('popular-search-tags');
  if (!tagsContainer) return;

  getPopularTags().then(tags => {
    tagsContainer.innerHTML = tags.map(tag => `
      <a href="/search?tag=${tag.id}" data-navigate="/search?tag=${tag.name}" class="tag-item">
        ${tag.name} (${tag.usageCount})
      </a>
    `).join('');
  }).catch(error => {
    console.error("Error loading popular tags:", error);
  });
}

async function loadCardInventories() {
  const inventoriesContainer = document.getElementById('card-inventoriess');
  if (!inventoriesContainer) return;

  try {
    const inventories = await getInventories();
    inventoriesContainer.innerHTML = inventories.map(inv => `
      <div class="inventory-card-search">
      <div class="inventory-info-search">
        <h3><a href="/inventory/${inv.id}" data-navigate="/inventory/${inv.id}">${inv.title}</a></h3>
        <p class="inventory-category">${inv.category}</p>
        <p class="inventory-count">${inv.itemCount} elementos</p>
      </div>
      <div class="inventory-image-search">
        ${inv.imageUrl ? `<img src="${inv.imageUrl}" alt="${inv.title}">` : '<div class="image-placeholder">📦</div>'}
      </div>
      </div>
    `).join('');
  } catch (error) {
    console.error("Error loading card inventories:", error);
  }
}
