import { UIUtils } from '../../utils/ui';
import { User } from '../../login/interfaces/UserInterface';
import "./profile.css"
import { Router } from '../../router/router';
import { getUserInventories } from '../../inventories/services/inventoryServices';
import { AuthService } from '../../login/services/auth';

export function profilePage() {
  const currentUser = UIUtils.getCurrentUser();
  
  if (!currentUser) {
    return `
      <div class="profile-container">
        <div class="alert alert-warning">
          <h2>Access Denied</h2>
          <p>You must Log in to access this page.</p>
          <a href="/login" data-navigate="/login" class="btn btn-primary">Log In</a>
        </div>
      </div>
    `;
  }

  return `
    <div class="profile-container">
      <div class="page-header">
        <h1>Your profile</h1>
        <section class="section-inventories">
          <button class="btn btn-primary" id="Your-Inventories-Btn">Your Inventories</button>
          <button class="btn btn-secondary" id="Shared-Inventories-Btn">Inventories with Write Access</button>
        </section>
      </div>
      
      <div class="profile-content">
        <div class="profile-info-card">
          <h2>Personal Information</h2>
          <div class="user-info">
            <div class="info-item">
              <label>Full Name:</label>
              <span>${currentUser.fullName || 'Not specified'}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span>${currentUser.email}</span>
            </div>
            <div class="info-item">
              <label>User ID:</label>
              <span>${currentUser.id}</span>
            </div>
            <div class="info-item">
              <label>Account Type:</label>
              <span>${currentUser.isOAuthUser ? 'Social Account' : 'Local Account'}</span>
            </div>
            ${currentUser.profilePictureUrl ? `
            <div class="info-item">
              <label>Profile Picture:</label>
              <img src="${currentUser.profilePictureUrl}" alt="Profile Picture" class="profile-picture">
            </div>
            ` : ''}
          </div>
          
          <div class="profile-actions">
            <button class="btn btn-primary" id="edit-profile-btn">Edit Profile</button>
            <button class="btn btn-secondary" id="change-password-btn">Change Password</button>
          </div>
        </div>
        
        
        <div class="profile-preferences-card">
          <h2>Preferences</h2>
          <div class="preferences-form">
            <div class="form-group">
              <label for="theme-preference">Theme:</label>
              <select id="theme-preference" class="form-control">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div class="form-group">
              <label for="language-preference">Language:</label>
              <select id="language-preference" class="form-control">
                <option value="es">Spanish</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initializeProfile() {
  const currentUser = UIUtils.getCurrentUser();
  const authService = AuthService.getInstance();
  const user = authService.getUser();
  const userInventories = getUserInventories(user?.id || '');
  console.log('User Inventories:', userInventories);
  const router = Router.getInstance();

  if (!currentUser) {
    return;
  }
  loadUserStatistics();
  loadUserPreferences();
  setupProfileEventListeners();
  UIUtils.listenToAuthChanges((user) => {
    if (!user) {
      router.navigate('/');
    }
  });
  const yourInventoriesBtn = document.getElementById('Your-Inventories-Btn');
  const sharedInventoriesBtn = document.getElementById('Shared-Inventories-Btn');
  yourInventoriesBtn?.addEventListener('click', () => {
    router.navigate('/your-inventories');
  });
  sharedInventoriesBtn?.addEventListener('click', () => {
    router.navigate('/shared-inventories');
  });
}

async function loadUserStatistics() {
  // Load user statistics from API
}

function loadUserPreferences() {
  // Load theme preference
  const themePreference = localStorage.getItem('theme') || 'light';
  const themeSelect = document.getElementById('theme-preference') as HTMLSelectElement;
  if (themeSelect) {
    themeSelect.value = themePreference;
  }
  
  const languagePreference = localStorage.getItem('language') || 'es';
  const languageSelect = document.getElementById('language-preference') as HTMLSelectElement;
  if (languageSelect) {
    languageSelect.value = languagePreference;
  }
  
  const emailNotifications = localStorage.getItem('emailNotifications') !== 'false';
  const emailCheckbox = document.getElementById('email-notifications') as HTMLInputElement;
  if (emailCheckbox) {
    emailCheckbox.checked = emailNotifications;
  }
}

function setupProfileEventListeners() {
  // Edit profile button - waiting
  const editProfileBtn = document.getElementById('edit-profile-btn');
  editProfileBtn?.addEventListener('click', () => {
    UIUtils.showMessage('Función de edición de perfil en desarrollo', 'info');
  });
  
  // Change password button
  const changePasswordBtn = document.getElementById('change-password-btn');
  changePasswordBtn?.addEventListener('click', () => {
    UIUtils.showMessage('Función de cambio de contraseña en desarrollo', 'info');
  });
  
  // Save preferences button
  const savePreferencesBtn = document.getElementById('save-preferences-btn');
  savePreferencesBtn?.addEventListener('click', saveUserPreferences);
  
  // Theme change handler
  const themeSelect = document.getElementById('theme-preference') as HTMLSelectElement;
  themeSelect?.addEventListener('change', (e) => {
    const newTheme = (e.target as HTMLSelectElement).value;
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  });
}

function saveUserPreferences() {
  try {
    // Save theme preference
    const themeSelect = document.getElementById('theme-preference') as HTMLSelectElement;
    if (themeSelect) {
      localStorage.setItem('theme', themeSelect.value);
    }
    
    // Save language preference
    const languageSelect = document.getElementById('language-preference') as HTMLSelectElement;
    if (languageSelect) {
      localStorage.setItem('language', languageSelect.value);
    }
    
    // Save notification preference
    const emailCheckbox = document.getElementById('email-notifications') as HTMLInputElement;
    if (emailCheckbox) {
      localStorage.setItem('emailNotifications', emailCheckbox.checked.toString());
    }
    
    UIUtils.showMessage('Preferencias guardadas exitosamente', 'success');
  } catch (error) {
    console.error('Error saving preferences:', error);
    UIUtils.showMessage('Error al guardar las preferencias', 'error');
  }
}
