import { getDiscussionPosts,createDiscussionPost, updateDiscussionPost,deleteDiscussionPost,toggleLikeDiscussionPost } from "../../../services/discussionService";
import { DiscussionPost,CreateDiscussionPostDto,LikeResponse,UpdateDiscussionPostDto } from "../../../interfaces/DiscussionPostInterface";
import "../styles/discusspost.css"

let currentInventoryId: number | null = null;
let discussionPosts: DiscussionPost[] = [];


export function discusspost() {
  return `
    <div class="discusspost-container">
      <div class="discussion-header">
        <h1>Inventory Discuss</h1>
        <button id="new-post-btn" class="btn btn-primary">New Post</button>
      </div>
      
      <div id="new-post-form" class="new-post-form hidden">
        <div class="form-group">
          <label for="post-content">Content of post:</label>
          <textarea id="post-content" class="form-control" rows="4" placeholder="Write your comment..."></textarea>
        </div>
        <div class="form-actions">
          <button id="submit-post" class="btn btn-success">Publish</button>
          <button id="cancel-post" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
      
      <div id="discussion-posts" class="discussion-posts">
        
      </div>
    </div>
  `;
}

export function initDiscusspost(InventoryId: string) {
  currentInventoryId = parseInt(InventoryId);
  setupEventListeners();
  loadDiscussionPosts();
  renderDiscussionPosts();
}

function setupEventListeners() {
  // New post button
  const newPostBtn = document.getElementById('new-post-btn');
  if (newPostBtn) {
    newPostBtn.addEventListener('click', showNewPostForm);
  }
  
  // Cancel post button
  const cancelBtn = document.getElementById('cancel-post');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', hideNewPostForm);
  }
  
  // Submit post button
  const submitBtn = document.getElementById('submit-post');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitNewPost);
  }
}

function showNewPostForm() {
  const form = document.getElementById('new-post-form');
  if (form) {
    form.classList.remove('hidden');
  }
}

function hideNewPostForm() {
  const form = document.getElementById('new-post-form');
  const textArea = document.getElementById('post-content') as HTMLTextAreaElement;
  
  if (form) {
    form.classList.add('hidden');
  }
  if (textArea) {
    textArea.value = '';
  }
}

async function submitNewPost() {
  if (!currentInventoryId) {
    alert('No se ha seleccionado un inventario');
    return;
  }
  
  const textArea = document.getElementById('post-content') as HTMLTextAreaElement;
  const content = textArea.value.trim();
  
  if (!content) {
    alert('Por favor, escribe un contenido para el post');
    return;
  }
  
  try {
    const newPostData: CreateDiscussionPostDto = {
      inventoryId: currentInventoryId,
      content: content
    };

    await createDiscussionPost(newPostData);
    hideNewPostForm();
    await loadDiscussionPosts(); // Reload posts
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Error al crear el post. Por favor, inténtalo de nuevo.');
  }
}

async function loadDiscussionPosts() {
  if (!currentInventoryId) return;
  
  try {
    discussionPosts = await getDiscussionPosts(currentInventoryId);

    renderDiscussionPosts();
  } catch (error) {
    console.error('Error loading discussion posts:', error);
    const postsContainer = document.getElementById('discussion-posts');
    if (postsContainer) {
      postsContainer.innerHTML = '<div class="error">Error al cargar las discusiones</div>';
    }
  }
}

function renderDiscussionPosts() {
  const postsContainer = document.getElementById('discussion-posts');
  if (!postsContainer) return;
  
  if (discussionPosts.length === 0) {
    postsContainer.innerHTML = '<div class="no-posts">No hay discusiones aún. ¡Sé el primero en comentar!</div>';
    return;
  }
  
  const postsHTML = discussionPosts.map(post => `
    <div class="discussion-post" data-post-id="${post.id}">
      <div class="post-header">
        <div class="author-info">
          <strong>${post.author.userName}</strong>
          <span class="post-date">${formatDate(post.createdAt)}</span>
        </div>
      </div>
      <div class="post-content">
        <p>${escapeHtml(post.content)}</p>
      </div>
      <div class="post-actions">
        <button class="like-btn ${post.isLikedByCurrentUser ? 'liked' : ''}" 
                data-post-id="${post.id}">
          <span class="like-icon">❤️</span>
          <span class="like-count">${post.likesCount}</span>
        </button>
      </div>
    </div>
  `).join('');
  
  postsContainer.innerHTML = postsHTML;
  
  // Add event listeners for like buttons
  const likeButtons = postsContainer.querySelectorAll('.like-btn');
  likeButtons.forEach(btn => {
    btn.addEventListener('click', handleLikeToggle);
  });
}

async function handleLikeToggle(event: Event) {
  const button = event.currentTarget as HTMLButtonElement;
  const postId = parseInt(button.dataset.postId || '0');
  
  if (!postId) return;
  
  try {
    const result = await toggleLikeDiscussionPost(postId);
    
    // Update the button display
    const likeCount = button.querySelector('.like-count');
    if (likeCount) {
      likeCount.textContent = result.likesCount.toString();
    }
    
    if (result.isLiked) {
      button.classList.add('liked');
    } else {
      button.classList.remove('liked');
    }
    
  } catch (error) {
    console.error('Error toggling like:', error);
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}