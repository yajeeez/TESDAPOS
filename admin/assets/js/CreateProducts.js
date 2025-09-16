// ==========================
// ==========================
// Create Products Management
// ==========================
let products = [];
let currentAction = null;
let currentProductId = null;

// ==========================
// Modal Functions
// ==========================
function showModal(title, message, confirmCallback) {
  const modal = document.getElementById('confirmationModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('modalConfirm');
  
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
  modal.style.display = 'none';
}

function showEditModal(product) {
  const modal = document.getElementById('editModal');
  
  // Populate form fields
  document.getElementById('editProductId').value = product.id;
  document.getElementById('editProductName').value = product.name;
  document.getElementById('editCategory').value = product.category;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editStock').value = product.stock;
  
  modal.style.display = 'block';
}

function closeEditModal() {
  const modal = document.getElementById('editModal');
  modal.style.display = 'none';
}

// ==========================
// Toast Notification Functions
// ==========================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');
  
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
// Form Validation
// ==========================
function validateForm(form) {
  const requiredFields = {
    'productName': 'Product Name',
    'category': 'Category',
    'price': 'Price',
    'stock': 'Stock Quantity'
  };
  
  const emptyFields = [];
  
  for (const [fieldName, displayName] of Object.entries(requiredFields)) {
    const field = form[fieldName];
    if (!field.value.trim()) {
      emptyFields.push(displayName);
    }
  }
  
  if (emptyFields.length > 0) {
    const message = `Please fill in the following required fields: ${emptyFields.join(', ')}`;
    showToast(message, 'warning');
    return false;
  }
  
  return true;
}

// ==========================
// Edit Form Validation
// ==========================
function validateEditForm(form) {
  const requiredFields = {
    'editProductName': 'Product Name',
    'editCategory': 'Category',
    'editPrice': 'Price',
    'editStock': 'Stock Quantity'
  };
  
  const emptyFields = [];
  
  for (const [fieldId, displayName] of Object.entries(requiredFields)) {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      emptyFields.push(displayName);
    }
  }
  
  if (emptyFields.length > 0) {
    const message = `Please fill in the following required fields: ${emptyFields.join(', ')}`;
    showToast(message, 'warning');
    return false;
  }
  
  return true;
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
// Submit Product Function
// ==========================
async function submitProduct(productForm) {
  // Show loading state
  const submitBtn = productForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Product...';
  submitBtn.disabled = true;
  
  try {
    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append('productName', productForm.productName.value.trim());
    formData.append('category', productForm.category.value);
    formData.append('price', productForm.price.value);
    formData.append('stock', productForm.stock.value || 0);
    
    // Add photo if selected
    if (productForm.photo.files[0]) {
      formData.append('photo', productForm.photo.files[0]);
      console.log('Photo file added:', productForm.photo.files[0].name);
    }
    
    // Send to backend
    console.log('Sending request to add_product.php...');
    const response = await fetch('../../connection/add_product.php', {
      method: 'POST',
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    // Check if response is ok and contains JSON
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
      
      // Reset form
      productForm.reset();
      
      // Add debug logging
      console.log('Product added successfully, redirecting to inventory...');
      console.log('Added product ID:', result.product_id);
      
      // Redirect to inventory page after a short delay with cache busting
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
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// ==========================
// Update Product Function
// ==========================
async function updateProduct() {
  try {
    const productId = document.getElementById('editProductId').value;
    const productName = document.getElementById('editProductName').value.trim();
    const category = document.getElementById('editCategory').value;
    const price = document.getElementById('editPrice').value;
    const stock = document.getElementById('editStock').value;
    
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('productName', productName);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('stock', stock);
    
    const response = await fetch('../../connection/update_product.php', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast('Product updated successfully!', 'success');
      closeEditModal();
      // Refresh inventory or reload page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      throw new Error(result.message || 'Failed to update product');
    }
    
  } catch (error) {
    console.error('Error updating product:', error);
    showToast('Error updating product: ' + error.message, 'error');
  }
}

// ==========================
// Delete Product Function
// ==========================
function deleteProduct(productId, productName) {
  showModal(
    'Confirm Product Deletion',
    `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
    () => performDelete(productId)
  );
}

async function performDelete(productId) {
  try {
    const formData = new FormData();
    formData.append('productId', productId);
    
    const response = await fetch('../../connection/delete_product.php', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast('Product deleted successfully!', 'success');
      // Refresh inventory or reload page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      throw new Error(result.message || 'Failed to delete product');
    }
    
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Error deleting product: ' + error.message, 'error');
  }
}

// ==========================
// Initialize Create Products
// ==========================
function initProducts() {
  const productForm = document.getElementById('createProductForm');

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Validate form first
      if (!validateForm(productForm)) {
        return;
      }
      
      // Show confirmation modal
      showModal(
        'Confirm Product Addition',
        'Are you sure you want to add this product to the inventory?',
        () => submitProduct(productForm)
      );
    });
  }

  // Handle edit modal save button
  const saveEditBtn = document.getElementById('saveEdit');
  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', () => {
      const editForm = document.getElementById('editProductForm');
      if (!validateEditForm(editForm)) {
        return;
      }
      
      showModal(
        'Confirm Product Update',
        'Are you sure you want to update this product?',
        () => updateProduct()
      );
    });
  }
}

// ==========================
// Close Modal on Outside Click
// ==========================
window.addEventListener('click', (event) => {
  const confirmModal = document.getElementById('confirmationModal');
  const editModal = document.getElementById('editModal');
  
  if (event.target === confirmModal) {
    closeModal();
  }
  
  if (event.target === editModal) {
    closeEditModal();
  }
});

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  initProducts();
});