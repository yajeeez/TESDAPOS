// ==========================
// ==========================
// Create Products Management
// ==========================
let products = [];
let currentAction = null;
let currentProductId = null;

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing Create Products page...');
  
  initPhotoPreview();
  initFormValidation();
  initButtonRipples();
  
  console.log('Create Products page initialization complete');
});

// ==========================
// Photo Preview Functionality
// ==========================
function initPhotoPreview() {
  const photoInput = document.getElementById('photo');
  const photoPreview = document.getElementById('photoPreview');
  
  if (!photoInput || !photoPreview) {
    console.warn('Photo input or preview element not found');
    return;
  }
  
  photoInput.addEventListener('change', (event) => {
    handlePhotoPreview(event, photoPreview);
  });
  
  // Handle drag and drop
  const uploadContainer = document.querySelector('.file-upload-display');
  if (uploadContainer) {
    uploadContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadContainer.style.borderColor = 'var(--tesda-blue)';
    });
    
    uploadContainer.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadContainer.style.borderColor = 'rgba(0, 74, 173, 0.3)';
    });
    
    uploadContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadContainer.style.borderColor = 'rgba(0, 74, 173, 0.3)';
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        photoInput.files = files;
        handlePhotoPreview({ target: { files } }, photoPreview);
      }
    });
  }
}

function handlePhotoPreview(event, previewContainer) {
  const file = event.target.files[0];
  
  if (!file) {
    resetPhotoPreview(previewContainer);
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file', 'warning');
    resetPhotoPreview(previewContainer);
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    previewContainer.innerHTML = `
      <img src="${e.target.result}" alt="Preview" />
    `;
    previewContainer.classList.add('has-image');
  };
  
  reader.onerror = () => {
    showToast('Error reading file', 'error');
    resetPhotoPreview(previewContainer);
  };
  
  reader.readAsDataURL(file);
}

function resetPhotoPreview(previewContainer) {
  previewContainer.innerHTML = `
    <div class="preview-placeholder">
      <i class="fas fa-image"></i>
      <span>No image selected</span>
    </div>
  `;
  previewContainer.classList.remove('has-image');
}

// ==========================
// Form Validation
// ==========================
function initFormValidation() {
  const form = document.getElementById('createProductForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (validateForm(form)) {
      await submitProduct(form);
    }
  });
  
  // Real-time validation feedback
  const inputs = form.querySelectorAll('input[required], select[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateField(input);
    });
    
    input.addEventListener('input', () => {
      clearFieldError(input);
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  
  if (!value) {
    addFieldError(field, 'This field is required');
    return false;
  }
  
  // Additional validation for specific fields
  if (field.type === 'number' && parseFloat(value) < 0) {
    addFieldError(field, 'Value must be greater than or equal to 0');
    return false;
  }
  
  clearFieldError(field);
  return true;
}

function addFieldError(field, message) {
  clearFieldError(field);
  
  field.style.borderColor = '#ef4444';
  field.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    font-weight: 500;
  `;
  
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.style.borderColor = '';
  field.style.boxShadow = '';
  
  const errorDiv = field.parentNode.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// ==========================
// Button Ripple Effects
// ==========================
function initButtonRipples() {
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('click', createRipple);
  });
}

function createRipple(event) {
  const button = event.currentTarget;
  const ripple = button.querySelector('.btn-ripple');
  
  if (!ripple) return;
  
  const circle = ripple;
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  
  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.remove('ripple');
  
  void circle.offsetWidth;
  circle.classList.add('ripple');
}

// ==========================
// Toast Notification Functions
// ==========================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');
  
  if (!toast || !toastIcon || !toastMessage) {
    console.warn('Toast elements not found');
    return;
  }
  
  // Set icon based on type
  toastIcon.className = 'fas ';
  toastIcon.classList.remove('success', 'error', 'warning');
  
  switch(type) {
    case 'success':
      toastIcon.classList.add('fa-check-circle', 'success');
      break;
    case 'error':
      toastIcon.classList.add('fa-exclamation-circle', 'error');
      break;
    case 'warning':
      toastIcon.classList.add('fa-exclamation-triangle', 'warning');
      break;
  }
  
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==========================
// Logout Function
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "/TESDAPOS/LandingPage/LandingPage.html"; 
  }
}

// ==========================
// Modal Functions (for legacy support)
// ==========================
function showModal(title, message, confirmCallback) {
  const modal = document.getElementById('confirmationModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('modalConfirm');
  
  if (!modal || !modalTitle || !modalMessage || !confirmBtn) {
    console.warn('Modal elements not found');
    return;
  }
  
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.style.display = 'block';
  
  // Remove any existing event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  // Add new event listener
  newConfirmBtn.addEventListener('click', () => {
    closeModal();
    if (confirmCallback) confirmCallback();
  });
}

function closeModal() {
  const modal = document.getElementById('confirmationModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ==========================
// Close Modal on Outside Click
// ==========================
window.addEventListener('click', (event) => {
  const confirmModal = document.getElementById('confirmationModal');
  
  if (event.target === confirmModal) {
    closeModal();
  }
});

// ==========================
// Enhanced Form Validation
// ==========================
function validateForm(form) {
  const requiredFields = {
    'productName': 'Product Name',
    'category': 'Category', 
    'price': 'Price',
    'stock': 'Stock Quantity'
  };
  
  let isValid = true;
  const emptyFields = [];
  
  for (const [fieldName, displayName] of Object.entries(requiredFields)) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field || !field.value.trim()) {
      emptyFields.push(displayName);
      if (field) {
        addFieldError(field, `${displayName} is required`);
      }
      isValid = false;
    } else {
      if (field) {
        clearFieldError(field);
      }
    }
  }
  
  // Additional validation
  const priceField = form.querySelector('[name="price"]');
  const stockField = form.querySelector('[name="stock"]');
  
  if (priceField && priceField.value && parseFloat(priceField.value) < 0) {
    addFieldError(priceField, 'Price must be greater than or equal to 0');
    isValid = false;
  }
  
  if (stockField && stockField.value && parseInt(stockField.value) < 0) {
    addFieldError(stockField, 'Stock quantity must be greater than or equal to 0');
    isValid = false;
  }
  
  if (!isValid && emptyFields.length > 0) {
    showToast(`Please fill in the required fields: ${emptyFields.join(', ')}`, 'warning');
  }
  
  return isValid;
}

// ==========================
// Submit Product Function
// ==========================
async function submitProduct(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitContent = submitBtn.querySelector('.btn-content');
  const originalText = submitContent.innerHTML;
  
  // Show loading state
  submitContent.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Adding Product...</span>';
  submitBtn.disabled = true;
  
  try {
    // Create FormData object to handle file upload
    const formData = new FormData();
    
    // Get form values using the new structure
    const productName = form.querySelector('[name="productName"]').value.trim();
    const category = form.querySelector('[name="category"]').value;
    const price = form.querySelector('[name="price"]').value;
    const stock = form.querySelector('[name="stock"]').value || 0;
    const photoFile = form.querySelector('[name="photo"]').files[0];
    
    formData.append('productName', productName);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('stock', stock);
    
    // Add photo if selected
    if (photoFile) {
      formData.append('photo', photoFile);
      console.log('Photo file added:', photoFile.name);
    }
    
    console.log('Sending product data:', {
      productName,
      category,
      price,
      stock,
      hasPhoto: !!photoFile
    });
    
    // Send to backend
    const response = await fetch('../../connection/add_product.php', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Response was:', responseText);
      throw new Error('Server returned invalid JSON. Check console for details.');
    }
    
    if (result.success) {
      // Show success notification
      showToast('Product has been successfully added to the inventory!', 'success');
      
      // Reset form and preview
      form.reset();
      resetPhotoPreview(document.getElementById('photoPreview'));
      
      // Clear any field errors
      const errorDivs = form.querySelectorAll('.field-error');
      errorDivs.forEach(error => error.remove());
      
      // Reset field styles
      const fields = form.querySelectorAll('input, select');
      fields.forEach(field => {
        field.style.borderColor = '';
        field.style.boxShadow = '';
      });
      
      console.log('Product added successfully:', result.product_id);
      
      // Redirect to inventory page after a short delay
      setTimeout(() => {
        window.location.href = 'Inventory.php?refresh=' + Date.now();
      }, 2000);
      
    } else {
      throw new Error(result.message || 'Failed to add product');
    }
    
  } catch (error) {
    console.error('Error adding product:', error);
    showToast('Error adding product: ' + error.message, 'error');
  } finally {
    // Reset button state
    submitContent.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}
