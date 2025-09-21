import { getItemForInventory, deleteItems, updateItem } from "../../../services/itemServices";
import { getUserInventoryPermissions } from "../../../services/inventoryServices";
import { UserInventoryPermissionsDto } from "../../../interfaces/PermissionInterface";
import { CustomFieldValueDto } from "../../../interfaces/CreateItemDto";
import { UIUtils } from "../../utils/ui";
import { Router } from "../../router/router";
import { UpdateItemDto } from "../../../interfaces/CreateItemDto";
import { uploadImageToCloudinary } from "../../../services/cloudinaryService";
import "../styles/itemPage.css";

const router = Router.getInstance();
let currentInventoryPermissions: UserInventoryPermissionsDto | null = null;
let currentItem: any = null;
export function ItemPage(){
    return `
    <div class="item-details"> 
      <section class="item-container">
        <h1 class="item-title"></h1>
        <hr> 
        <section class="item-toolbar" id="item-toolbar" style="display: none;">
            <div class="toolbar-actions">
                <div class="action-buttons">
                    <button class="btn btn-warning" id="edit-item-btn">
                        <i class="fas fa-edit"></i> Edit Item
                    </button>
                    <button class="btn btn-danger" id="delete-item-btn">
                        <i class="fas fa-trash"></i> Delete Item
                    </button>
                    <button class="btn btn-secondary" id="back-to-inventory-btn">
                        <i class="fas fa-arrow-left"></i> Back to Inventory
                    </button>
                </div>
            </div>
        </section>
        <section class="item">
            <section class="item-info">
            </section>
            <section class="item-img">
            </section>
        </section>  
      </section>
      <section class="modal-container" style="display: none;">

      </section>

    </div>`;
}

export async function initItemPage(Inventoryid: number, itemId: number) {
  const itemSection = document.querySelector('.item-info') as HTMLElement;
  let itemImgSection = document.querySelector('.item-img') as HTMLElement;
  itemSection.innerHTML = '';
  itemImgSection.innerHTML = '';
  const itemHeader = document.querySelector('.item-title') as HTMLElement;
  const itemTable = document.createElement('table');
  const getItem = await getItemDetails(Inventoryid, itemId);
  
  if (!getItem) {
    UIUtils.showModalForMessages('Item not found');
    return;
  }
  
  currentItem = getItem;
  itemHeader.textContent = getItem.name;

  // Initialize toolbar with permission checking
  await initializeToolbarWithPermissions(Inventoryid);

  let tableRows = `
    <tr>
      <th>ID: </th>
      <td>${getItem.customId}</td>
    </tr>
    <tr>
      <th>Name: </th>
      <td>${getItem.name }</td>
    </tr>
    <tr>
      <th>Description: </th>
      <td>${getItem.description}</td>
    </tr>
    <tr>
      <th>Created at: </th>
      <td>${new Date(getItem.createdAt).toLocaleDateString()}</td>
    </tr>
    <tr>
      <th>Updated at: </th>
      <td>${new Date(getItem.updatedAt).toLocaleDateString()}</td>
    </tr>
  `;


  if (getItem.customFieldValues && getItem.customFieldValues.length > 0) {
    getItem.customFieldValues.forEach((field: any) => {
      tableRows += `
        <tr>
          <th>${field.name}: </th>
          <td>${field.value}</td>
        </tr>
      `;
    });
  }

  itemImgSection.innerHTML = `
    <img src="${escapeHtml(getItem.imgUrl || '')}" alt="Item Image" />
  `;

  itemTable.innerHTML = tableRows;
  itemSection.appendChild(itemTable);
  
  console.log(getItem);
}


async function getItemDetails(inventoryId: number, itemId: number) {
  try {
    const item = await getItemForInventory(inventoryId, itemId);
    return item;
  } catch (error) {
    console.error('Error fetching item details:', error);
    return null;
  }
}

// Initialize toolbar with permission checking
async function initializeToolbarWithPermissions(inventoryId: number) {
    try {
        const isAuthenticated = UIUtils.isUserAuthenticated();
        const isAdmin = UIUtils.isAdmin();
        
        if (!isAuthenticated) {
            initializeToolbarForGuests(inventoryId);
            return;
        }
        
        currentInventoryPermissions = await getUserInventoryPermissions(inventoryId);
        
        // User has access to item management if they have:
        // - Can edit or delete items specifically
        // - Can write to the inventory
        // - Can manage the inventory
        // - Are the owner
        // - Have Creator or Admin access level
        // - Are system admin
        const hasItemAccess = (currentInventoryPermissions && (
            currentInventoryPermissions.canEditItems ||
            currentInventoryPermissions.canDeleteItems ||
            currentInventoryPermissions.canWrite ||
            currentInventoryPermissions.canCreateItems ||
            currentInventoryPermissions.canManageInventory ||
            currentInventoryPermissions.isOwner ||
            currentInventoryPermissions.accessLevel === "Creator" ||
            currentInventoryPermissions.accessLevel === "Admin"
        )) || isAdmin;
        
        if (hasItemAccess) {
            const toolbar = document.getElementById('item-toolbar');
            if (toolbar) {
                toolbar.style.display = 'block';
                initializeItemToolbar(inventoryId);
            }
        } else {
            initializeToolbarForGuests(inventoryId);
        }

    } catch (error) {
        console.error('Error checking permissions:', error);
        initializeToolbarForGuests(inventoryId);
    }
}

// Initialize toolbar for authenticated users with permissions
function initializeItemToolbar(inventoryId: number) {
    const editButton = document.getElementById('edit-item-btn') as HTMLButtonElement;
    const deleteButton = document.getElementById('delete-item-btn') as HTMLButtonElement;
    const backButton = document.getElementById('back-to-inventory-btn') as HTMLButtonElement;
    const isAdmin = UIUtils.isAdmin();

    // Show edit button if user can edit items OR has write access OR is owner/admin
    const canEdit = (currentInventoryPermissions && (
        currentInventoryPermissions.canEditItems ||
        currentInventoryPermissions.canWrite ||
        currentInventoryPermissions.canManageInventory ||
        currentInventoryPermissions.isOwner ||
        currentInventoryPermissions.accessLevel === "Creator" ||
        currentInventoryPermissions.accessLevel === "Admin"
    )) || isAdmin;

    // Show delete button if user can delete items OR is owner/admin
    const canDelete = (currentInventoryPermissions && (
        currentInventoryPermissions.canDeleteItems ||
        currentInventoryPermissions.canManageInventory ||
        currentInventoryPermissions.isOwner ||
        currentInventoryPermissions.accessLevel === "Creator" ||
        currentInventoryPermissions.accessLevel === "Admin"
    )) || isAdmin;

    if (!canEdit && editButton) {
        editButton.style.display = 'none';
    }
    if (!canDelete && deleteButton) {
        deleteButton.style.display = 'none';
    }
    editButton?.addEventListener('click', () => {
        if (!currentItem) {
            UIUtils.showModalForMessages('Item data not available');
            return;
        }
        console.log('Opening edit modal for item:', currentItem.name);
        openModalToUpdateItem();
    });

    deleteButton?.addEventListener('click', () => {
        if (!currentItem) {
            UIUtils.showModalForMessages('Item data not available');
            return;
        }
        confirmItemDelete(inventoryId);
    });

    backButton?.addEventListener('click', () => {
        router.navigate(`/inventories/${inventoryId}`);
    });
}

// Initialize limited toolbar for guests or users without permissions
function initializeToolbarForGuests(inventoryId: number) {
    const toolbar = document.getElementById('item-toolbar');
    const editButton = document.getElementById('edit-item-btn') as HTMLButtonElement;
    const deleteButton = document.getElementById('delete-item-btn') as HTMLButtonElement;
    const backButton = document.getElementById('back-to-inventory-btn') as HTMLButtonElement;

    if (toolbar) {
        toolbar.style.display = 'block';
    }

    // Hide edit and delete buttons
    if (editButton) editButton.style.display = 'none';
    if (deleteButton) deleteButton.style.display = 'none';

    backButton?.addEventListener('click', () => {
        router.navigate(`/inventories/${inventoryId}`);
    });
}

// Confirm item deletion
function confirmItemDelete(inventoryId: number) {
    if (!currentItem) return;
    
    UIUtils.ModalForConfirmation(
        `Are you sure you want to delete "${currentItem.name}"? This action cannot be undone.`,
        () => executeItemDelete(inventoryId),
        () => console.log('Item delete canceled')
    );
}

// Execute item deletion
async function executeItemDelete(inventoryId: number) {
    if (!currentItem) return;
    
    try {
        await deleteItems([currentItem.id]);
        UIUtils.showModalForMessages('Item deleted successfully!');
        router.navigate(`/inventories/${inventoryId}`);
    } catch (error) {
        console.error('Error deleting item:', error);
        UIUtils.showModalForMessages('Error deleting item. Please try again.');
    }
}

function openModalToUpdateItem() {
  const modalContainer = document.querySelector('.modal-container') as HTMLElement;
  if (!currentItem) return;

  const modalContent = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Edit Item</h3>
        <span class="close" id="close-edit-modal">&times;</span>
      </div>
      <div class="modal-body">
        <form id="edit-item-form">
          <div class="form-group">
            <label for="edit-item-name">Name *:</label>
            <input type="text" id="edit-item-name" name="name" value="${escapeHtml(currentItem.name || '')}" required>
          </div>
          <div class="form-group">
            <label for="edit-item-customId">Custom ID:</label>
            <input type="text" id="edit-item-customId" name="customId" value="${escapeHtml(currentItem.customId || '')}" placeholder="Optional custom identifier">
          </div>
          <div class="form-group">
            <label for="edit-item-description">Description:</label>
            <textarea id="edit-item-description" name="description" rows="3" placeholder="Describe this item...">${escapeHtml(currentItem.description || '')}</textarea>
          </div>
          
          <!-- Dynamic custom fields will be added here -->
          <div id="edit-custom-fields-container">
            <!-- Custom fields will be dynamically generated -->
          </div>

          <div class="img-upload-section">
            <label for="edit-item-image">Item Image:</label>
            <input type="file" id="edit-item-image" name="image" accept="image/*">
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" id="cancel-edit-item">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;

  modalContainer.innerHTML = modalContent;
  modalContainer.style.display = 'block';

  // Populate custom fields if they exist
  populateCustomFieldsForEdit();

  // Attach event listeners
  attachEditModalEventListeners();
}

function populateCustomFieldsForEdit() {
  const container = document.getElementById('edit-custom-fields-container');
  if (!container || !currentItem.customFieldValues) return;

  container.innerHTML = '';

  currentItem.customFieldValues.forEach((field: any) => {
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'form-group';
    
    const label = document.createElement('label');
    label.setAttribute('for', `edit-custom-field-${field.fieldId}`);
    label.textContent = `${field.name}:`;
    
    let input: HTMLElement;
    
    switch (field.type.toLowerCase()) {
      case 'text':
      case 'string':
        input = document.createElement('input');
        (input as HTMLInputElement).type = 'text';
        (input as HTMLInputElement).id = `edit-custom-field-${field.fieldId}`;
        (input as HTMLInputElement).name = `custom_field_${field.fieldId}`;
        (input as HTMLInputElement).value = field.value || '';
        (input as HTMLInputElement).placeholder = `Enter ${field.name}`;
        break;
        
      case 'number':
      case 'integer':
        input = document.createElement('input');
        (input as HTMLInputElement).type = 'number';
        (input as HTMLInputElement).id = `edit-custom-field-${field.fieldId}`;
        (input as HTMLInputElement).name = `custom_field_${field.fieldId}`;
        (input as HTMLInputElement).value = field.value || '';
        (input as HTMLInputElement).placeholder = `Enter ${field.name}`;
        break;
        
      case 'checkbox':
      case 'boolean':
        input = document.createElement('input');
        (input as HTMLInputElement).type = 'checkbox';
        (input as HTMLInputElement).id = `edit-custom-field-${field.fieldId}`;
        (input as HTMLInputElement).name = `custom_field_${field.fieldId}`;
        (input as HTMLInputElement).checked = field.value === 'true';
        break;
        
      case 'date':
      case 'datetime':
        input = document.createElement('input');
        (input as HTMLInputElement).type = 'datetime-local';
        (input as HTMLInputElement).id = `edit-custom-field-${field.fieldId}`;
        (input as HTMLInputElement).name = `custom_field_${field.fieldId}`;
        if (field.value) {
          // Convert from ISO string to datetime-local format
          const date = new Date(field.value);
          (input as HTMLInputElement).value = date.toISOString().slice(0, 16);
        }
        break;
        
      case 'decimal':
        input = document.createElement('input');
        (input as HTMLInputElement).type = 'number';
        (input as HTMLInputElement).step = '0.0001';
        (input as HTMLInputElement).id = `edit-custom-field-${field.fieldId}`;
        (input as HTMLInputElement).name = `custom_field_${field.fieldId}`;
        (input as HTMLInputElement).value = field.value || '';
        (input as HTMLInputElement).placeholder = `Enter ${field.name}`;
        break;
        
      default:
        input = document.createElement('input');
        (input as HTMLInputElement).type = 'text';
        (input as HTMLInputElement).id = `edit-custom-field-${field.fieldId}`;
        (input as HTMLInputElement).name = `custom_field_${field.fieldId}`;
        (input as HTMLInputElement).value = field.value || '';
        (input as HTMLInputElement).placeholder = `Enter ${field.name}`;
        break;
    }
    
    // Store field metadata for form submission
    input.setAttribute('data-field-name', field.name);
    input.setAttribute('data-field-type', field.type);
    input.setAttribute('data-field-id', field.fieldId.toString());
    
    fieldGroup.appendChild(label);
    fieldGroup.appendChild(input);
    container.appendChild(fieldGroup);
  });
}

function attachEditModalEventListeners() {
  const closeBtn = document.getElementById('close-edit-modal');
  const cancelBtn = document.getElementById('cancel-edit-item');
  const modalContainer = document.querySelector('.modal-container') as HTMLElement;
  const form = document.getElementById('edit-item-form') as HTMLFormElement;

  const closeModal = () => {
    if (modalContainer) modalContainer.style.display = 'none';
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  
  // Close modal when clicking outside the modal content
  window.onclick = (event) => {
    if (event.target === modalContainer) {
      closeModal();
    }
  };

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      await handleEditItemFormSubmit();
    };
  }
}

async function handleEditItemFormSubmit() {
  try {
    const form = document.getElementById('edit-item-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const name = (formData.get('name') as string)?.trim();
    const customId = (formData.get('customId') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const imageFile = (document.getElementById('edit-item-image') as HTMLInputElement)?.files?.[0];
    let imageUrl: string | undefined;

    if (imageFile) {
      // Upload image to Cloudinary and get the URL
      imageUrl = await uploadImageToCloudinary(imageFile);
      console.log('Uploaded image URL:', imageUrl);
    }


    if (!name) {
      UIUtils.showModalForMessages('Item name is required');
      return;
    }

    if (!currentItem) {
      UIUtils.showModalForMessages('Item data not available');
      return;
    }

    // Collect custom field values from the form
    const customFieldValues: any[] = [];
    const customFieldInputs = form.querySelectorAll('[data-field-name]') as NodeListOf<HTMLInputElement>;
    
    customFieldInputs.forEach((input) => {
      const fieldName = input.getAttribute('data-field-name');
      const fieldType = input.getAttribute('data-field-type');
      const fieldId = input.getAttribute('data-field-id');
      
      if (fieldName && fieldType && fieldId) {
        let value: string | undefined;
        
        switch (fieldType.toLowerCase()) {
          case 'checkbox':
          case 'boolean':
            value = (input as HTMLInputElement).checked.toString();
            break;
          case 'date':
          case 'datetime':
            if (input.value) {
              // Convert to ISO string for backend
              value = new Date(input.value).toISOString();
            }
            break;
          default:
            value = input.value.trim() || undefined;
            break;
        }
        
        // Only add if there's a value or it's a boolean field
        if (value !== undefined && (value !== 'false' || fieldType.toLowerCase().includes('checkbox'))) {
          customFieldValues.push({
            fieldId: parseInt(fieldId),
            name: fieldName,
            type: fieldType,
            value: value
          });
        }
      }
    });

    const updateData: UpdateItemDto = {
      name: name,
      description: description || undefined,
      customId: customId || undefined,
      customFieldValues: customFieldValues,
      ImgUrl: imageUrl // Include image URL if uploaded
    };

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    // Create the full item object that the API expects
    const fullItemData = {
      ...currentItem,
      name: updateData.name,
      description: updateData.description || currentItem.description,
      customId: updateData.customId || currentItem.customId,
      customFieldValues: updateData.customFieldValues || currentItem.customFieldValues,
      ImgUrl: updateData.ImgUrl || currentItem.ImgUrl // Include the image URL
    };

    await updateItem(currentItem.id, fullItemData);

    const modalContainer = document.querySelector('.modal-container') as HTMLElement;
    if (modalContainer) modalContainer.style.display = 'none';
    
    UIUtils.showModalForMessages('Item updated successfully!');
    
    // Reload the item data to show updated information
    const inventoryId = currentInventoryPermissions?.inventoryId || currentItem.inventoryId;
    if (inventoryId) {
      // Clear the current item info section before reloading
      const itemSection = document.querySelector('.item-info') as HTMLElement;
      if (itemSection) {
        itemSection.innerHTML = '';
      }
      
      // Reload the page with updated data
      await initItemPage(inventoryId, currentItem.id);
    }
    
  } catch (error) {
    console.error('Error updating item:', error);
    UIUtils.showModalForMessages('Error updating item: ' + (error instanceof Error ? error.message : 'Unknown error'));

    // Reset button state
    const submitBtn = document.querySelector('#edit-item-form button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  }
}

function escapeHtml(text: string): string {
  if (!text) return '';
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}