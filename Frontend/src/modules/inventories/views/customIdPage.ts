import { getCustomIdFormat, updateCustomIdFormat, previewCustomId } from "../../../services/inventoryServices";
import { CustomIdFormatDto, UpdateCustomIdFormatDto, CUSTOM_ID_ELEMENTS } from "../../../interfaces/CustomIdInterface";
import { UIUtils } from "../../utils/ui";
import "../styles/customIdPage.css";

let currentInventoryId: number | null = null;
let currentFormat: CustomIdFormatDto | null = null;

export function customIdPage(inventoryId: number) {
  currentInventoryId = inventoryId;
  
  return `
    <div class="custom-id-page">
      <div class="page-header">
        <h2>Custom ID Configuration</h2>
        <p class="subtitle">Configure automatic ID generation for items in this inventory</p>
      </div>
      
      <div class="custom-id-container">
        <div class="custom-id-section">
          <div class="form-group">
            <label class="switch">
              <input type="checkbox" id="enable-custom-id">
              <span class="slider"></span>
            </label>
            <label for="enable-custom-id" class="switch-label">Enable Custom ID Generation</label>
          </div>
          
          <div id="custom-id-config" class="custom-id-config" style="display: none;">
            <div class="form-group">
              <h3>ID Format Pattern</h3>
              <input 
                type="text" 
                id="custom-id-format" 
                placeholder="e.g., ITEM-{random6}-{random20}"
                class="form-control"
              >
              <small class="form-text">
                Use fixed text and placeholders like {random6}, {random20}, etc.
              </small>
            </div>
            
            <div class="available-elements">
              <h4>Available Elements</h4>
              <div class="elements-grid">
                ${CUSTOM_ID_ELEMENTS.map(element => `
                  <div class="element-card" data-placeholder="${element.placeholder}">
                    <div class="element-header">
                      <h4>${element.name}</h4>
                      <code class="element-code">${element.placeholder}</code>
                    </div>
                    <p class="element-description">${element.description}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="preview-section">
              <h4>Preview</h4>
              <div class="preview-container">
                <div class="preview-label">Generated ID Preview:</div>
                <div id="preview-result" class="preview-result">-</div>
                <button type="button" id="refresh-preview" class="btn btn-secondary btn-sm">
                  🔄 Generate New Preview
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="actions-section">
          <button type="button" id="save-custom-id" class="btn btn-primary">Save Configuration</button>
          <button type="button" id="cancel-custom-id" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
    

  `;
}

export async function initializeCustomIdPage(inventoryId: number) {
  currentInventoryId = inventoryId;
  
  try {
    currentFormat = await getCustomIdFormat(inventoryId);
    const enableToggle = document.getElementById('enable-custom-id') as HTMLInputElement;
    const formatInput = document.getElementById('custom-id-format') as HTMLInputElement;
    const configSection = document.getElementById('custom-id-config') as HTMLElement;
    
    if (enableToggle && formatInput && configSection) {
      enableToggle.checked = currentFormat.enabled;
      formatInput.value = currentFormat.format;
      configSection.style.display = currentFormat.enabled ? 'block' : 'none';
      
      if (currentFormat.enabled && currentFormat.format) {
        updatePreview();
      }
    }
    
    attachEventListeners();
  } catch (error) {
    console.error('Error loading custom ID configuration:', error);
    UIUtils.showMessage('Error loading custom ID configuration', 'error');
  }
}

function attachEventListeners() {
  const enableToggle = document.getElementById('enable-custom-id') as HTMLInputElement;
  const configSection = document.getElementById('custom-id-config') as HTMLElement;
  
  enableToggle?.addEventListener('change', () => {
    if (configSection) {
      configSection.style.display = enableToggle.checked ? 'block' : 'none';
    }
  });
  
  const formatInput = document.getElementById('custom-id-format') as HTMLInputElement;
  formatInput?.addEventListener('input', debounce(updatePreview, 500));
  
  const elementCards = document.querySelectorAll('.element-card');
  elementCards.forEach(card => {
    card.addEventListener('click', () => {
      const placeholder = card.getAttribute('data-placeholder');
      if (placeholder && formatInput) {
        insertAtCursor(formatInput, placeholder);
        updatePreview();
      }
    });
  });
  
  const refreshBtn = document.getElementById('refresh-preview');
  refreshBtn?.addEventListener('click', updatePreview);
  
  const saveBtn = document.getElementById('save-custom-id');
  saveBtn?.addEventListener('click', saveConfiguration);
  
  const cancelBtn = document.getElementById('cancel-custom-id');
  cancelBtn?.addEventListener('click', () => {
    window.history.back();
  });
}

async function updatePreview() {
  const formatInput = document.getElementById('custom-id-format') as HTMLInputElement;
  const previewResult = document.getElementById('preview-result');
  
  if (!formatInput || !previewResult || !currentInventoryId) return;
  
  const format = formatInput.value.trim();
  if (!format) {
    previewResult.textContent = '-';
    previewResult.style.color = '#6c757d';
    return;
  }
  
  try {
    console.log('Generating preview with format:', format, 'for inventory:', currentInventoryId);
    const preview = await previewCustomId(currentInventoryId, format);
    console.log('Preview generated:', preview);
    
    if (preview === 'Invalid format') {
      previewResult.textContent = 'Invalid format';
      previewResult.style.color = '#dc3545';
    } else {
      previewResult.textContent = preview;
      previewResult.style.color = '#007bff';
    }
  } catch (error) {
    console.error('Error generating preview:', error);
    previewResult.textContent = 'Error generating preview';
    previewResult.style.color = '#dc3545';
    setTimeout(() => {
      previewResult.style.color = '#007bff';
    }, 2000);
  }
}

async function saveConfiguration() {
  if (!currentInventoryId) return;
  
  const enableToggle = document.getElementById('enable-custom-id') as HTMLInputElement;
  const formatInput = document.getElementById('custom-id-format') as HTMLInputElement;
  
  const updateData: UpdateCustomIdFormatDto = {
    enabled: enableToggle.checked,
    format: formatInput.value.trim()
  };
  
  if (updateData.enabled && !updateData.format) {
    UIUtils.showMessage('Please enter a format pattern when custom ID is enabled', 'error');
    return;
  }
  
  try {
    await updateCustomIdFormat(currentInventoryId, updateData);
    UIUtils.showMessage('Custom ID configuration saved successfully!', 'success');
    
    // Go back to inventory page
    setTimeout(() => {
      window.history.back();
    }, 1500);
  } catch (error) {
    console.error('Error saving configuration:', error);
    UIUtils.showMessage('Error saving configuration', 'error');
  }
}

function insertAtCursor(input: HTMLInputElement, text: string) {
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const value = input.value;
  
  input.value = value.slice(0, start) + text + value.slice(end);
  input.focus();
  input.setSelectionRange(start + text.length, start + text.length);
}

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
