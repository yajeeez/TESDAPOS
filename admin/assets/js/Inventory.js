// ==========================
// ==========================
// Inventory Management
// ==========================
let inventoryItems = [];
let products = [];

// ==========================
// Modal Functions
// ==========================
function showConfirmationModal(title, message, confirmCallback, isDelete = false) {
  console.log('showConfirmationModal called:', { title, message, isDelete });
  
  const modal = document.getElementById('confirmationModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('modalConfirm');
  
  if (!modal || !modalTitle || !modalMessage || !confirmBtn) {
    console.error('Modal elements not found:', {
      modal: !!modal,
      modalTitle: !!modalTitle,
      modalMessage: !!modalMessage,
      confirmBtn: !!confirmBtn
    });
    return;
  }
  
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.style.display = 'block';
  
  console.log('Modal should now be visible');
  
  // Style button based on action type
  if (isDelete) {
    confirmBtn.className = 'btn btn-danger';
    confirmBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
  } else {
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm';
  }
  
  // Remove any existing event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  // Add new event listener
  newConfirmBtn.addEventListener('click', () => {
    console.log('Confirm button clicked');
    closeConfirmationModal();
    if (confirmCallback) confirmCallback();
  });
}

function closeConfirmationModal() {
  const modal = document.getElementById('confirmationModal');
  modal.style.display = 'none';
}

// ==========================
// Toast Notification Functions
// ==========================
function showToast(message, type = 'success') {
  const toast = document.getElementById('notificationToast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  
  if (type === 'error') {
    toast.style.background = '#dc3545';
  } else {
    toast.style.background = '#28a745';
  }
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==========================
// Logout Function
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  showConfirmationModal(
    'Confirm Logout',
    'Are you sure you want to logout?',
    () => {
      window.location.href = "/TESDAPOS/LandingPage/LandingPage.html";
    }
  );
}

// ==========================
// Get Local Placeholder Image
// ==========================
function getLocalPlaceholderImage(productName) {
  const name = productName.toLowerCase();
  
  if (name.includes('adobo')) {
    return '../../img/adobo.jpg';
  } else if (name.includes('sinigang')) {
    return '../../img/sinigang.jpg';
  } else if (name.includes('iced') || name.includes('tea')) {
    return '../../img/icedtea.jpg';
  } else if (name.includes('milk') || name.includes('tea')) {
    return '../../img/milktea.jpg';
  } else {
    return '../../img/TESDALOGO.png';
  }
}

// ==========================
// Get Product Image with Database Path and Fallback
// ==========================
function getProductImagePath(productId, productName, dbImagePath) {
  // If we have a database image path, construct the correct relative path
  if (dbImagePath) {
    // Remove any leading slashes and ensure proper path from admin/components/
    const cleanPath = dbImagePath.replace(/^\/+/, '');
    return `../../${cleanPath}`;
  }
  
  // Fallback to placeholder
  return getLocalPlaceholderImage(productName);
}

// ==========================
// Fetch products from database
// ==========================
async function fetchProductsFromDB() {
  try {
    console.log('Attempting to fetch products...');
    const response = await fetch('/TESDAPOS/connection/fetch_products.php');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched data:', data);
    
    if (data.success) {
      inventoryItems = data.products.map((product) => ({
        id: product.id,
        name: product.product_name,
        category: product.category.toLowerCase(),
        price: product.price,
        quantity: product.stock_quantity,
        image: getProductImagePath(product.id, product.product_name, product.image_path)
      }));
      
      products = inventoryItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        stock: item.quantity,
        image: item.image
      }));
      
      console.log('Products loaded successfully:', inventoryItems.length, 'items');
      return true;
    } else {
      console.error('Failed to fetch products:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    inventoryItems = [];
    products = [];
    return false;
  }
}

// ==========================
// Render Inventory with Category Filter
// ==========================
async function renderInventory() {
  const inventoryList = document.getElementById('inventoryList');
  const filter = document.getElementById('categoryFilter')?.value || 'all';
  if (!inventoryList) return;

  inventoryList.innerHTML = '<p class="loading-message">Loading products...</p>';

  if (inventoryItems.length === 0) {
    const success = await fetchProductsFromDB();
    if (!success) {
      inventoryList.innerHTML = `
        <p class="error-message">
          Failed to load products from database. Please check your connection.
        </p>
      `;
      return;
    }
  }

  inventoryList.innerHTML = '';

  const filteredItems = inventoryItems.filter(item => filter === 'all' || item.category === filter);

  if (filteredItems.length === 0) {
    inventoryList.innerHTML = `
      <p class="empty-message">
        No products found in inventory. Please add products first in the "Create Products" section.
      </p>
    `;
    return;
  }

  filteredItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'inventory-card';
    
    const imageSrc = item.image;
    
    div.innerHTML = `
      <img src="${imageSrc}" alt="${item.name}" onerror="this.src='../../img/TESDALOGO.png'">
      <div class="card-body">
        <h4>${item.name}</h4>
        <p>Category: ${item.category}</p>
        <p class="price">₱${item.price.toFixed(2)}</p>
        <p class="stock">Stock: ${item.quantity} pcs</p>
        <div class="actions">
          <button class="edit-btn" onclick="updateProduct('${item.id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-btn" onclick="deleteProduct('${item.id}')"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    `;
    inventoryList.appendChild(div);
  });
}

// ==========================
// Update Product
// ==========================
function updateProduct(id) {
  console.log('updateProduct called with ID:', id);
  
  const modal = document.getElementById('updateProductModal');
  if (!modal) {
    console.error('Update Product Modal not found!');
    showToast('Modal not found', 'error');
    return;
  }
  
  let product = inventoryItems.find(p => p.id == id);
  if (!product) {
    product = products.find(p => p.id == id);
  }
  if (!product) {
    console.error('Product not found with ID:', id);
    showToast('Product not found', 'error');
    return;
  }
  
  console.log('Found product:', product);
  
  document.getElementById('updateProductId').value = product.id;
  document.getElementById('updateProductName').value = product.name;
  document.getElementById('updateCategory').value = product.category.charAt(0).toUpperCase() + product.category.slice(1);
  document.getElementById('updatePrice').value = product.price;
  document.getElementById('updateStockQuantity').value = product.stock || product.quantity;
  
  const photoPreview = document.getElementById('currentPhotoPreview');
  if (product.image && !product.image.includes('TESDALOGO.png')) {
    photoPreview.innerHTML = `
      <div style="text-align: center;">
        <h4>Current Photo:</h4>
        <img src="${product.image}" alt="Current photo" style="max-width: 200px; max-height: 150px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <p style="display: none; color: #666;">Image not found</p>
      </div>
    `;
  } else {
    photoPreview.innerHTML = '<p style="text-align: center; color: #666;">No current photo</p>';
  }
  
  modal.style.display = 'block';
  console.log('Update modal should now be visible');
}

// Make functions globally accessible
window.updateProduct = updateProduct;

// ==========================
// Delete Product with Confirmation
// ==========================
function deleteProduct(id) {
  console.log('deleteProduct called with ID:', id);
  
  // Find the product to get its name for the confirmation message
  let product = inventoryItems.find(p => p.id == id);
  if (!product) {
    product = products.find(p => p.id == id);
  }
  
  if (!product) {
    showToast('Product not found', 'error');
    return;
  }
  
  // Show confirmation modal
  showConfirmationModal(
    'Confirm Product Deletion',
    `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
    () => performDelete(id),
    true // isDelete flag
  );
}

// Make functions globally accessible
window.deleteProduct = deleteProduct;

// ==========================
// Perform Delete Operation
// ==========================
async function performDelete(id) {
  try {
    const formData = new FormData();
    formData.append('productId', id);
    
    const response = await fetch('/TESDAPOS/connection/delete_product.php', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Remove from local arrays
      products = products.filter(p => p.id !== id);
      inventoryItems = inventoryItems.filter(i => i.id !== id);
      
      // Re-render inventory
      renderInventory();
      
      // Show success message
      showToast('Product deleted successfully!', 'success');
    } else {
      throw new Error(result.error || 'Failed to delete product');
    }
    
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Error deleting product: ' + error.message, 'error');
  }
}

// ==========================
// Modal Control Functions
// ==========================
function closeUpdateModal() {
  document.getElementById('updateProductModal').style.display = 'none';
  document.getElementById('updateProductForm').reset();
  document.getElementById('currentPhotoPreview').innerHTML = '';
}

function closeConfirmationModal() {
  console.log('closeConfirmationModal called');
  const modal = document.getElementById('confirmationModal');
  if (modal) {
    modal.style.display = 'none';
    console.log('Confirmation modal hidden');
  } else {
    console.error('Confirmation modal not found when trying to close');
  }
}

// Make functions globally accessible
window.closeUpdateModal = closeUpdateModal;
window.closeConfirmationModal = closeConfirmationModal;

// Close modal when clicking outside of it
window.onclick = function(event) {
  const updateModal = document.getElementById('updateProductModal');
  const confirmModal = document.getElementById('confirmationModal');
  
  if (event.target === updateModal) {
    closeUpdateModal();
  }
  
  if (event.target === confirmModal) {
    closeConfirmationModal();
  }
};

// ==========================
// Image Preview Handler
// ==========================
function initImagePreview() {
  const photoInput = document.getElementById('updatePhoto');
  if (photoInput) {
    photoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      const photoPreview = document.getElementById('currentPhotoPreview');
      
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
          e.target.value = '';
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          e.target.value = '';
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
          photoPreview.innerHTML = `
            <div style="text-align: center;">
              <h4>New Image Preview:</h4>
              <img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <p style="margin-top: 10px; color: #666; font-size: 0.9rem;">${file.name}</p>
            </div>
          `;
        };
        reader.readAsDataURL(file);
      } else {
        const productId = document.getElementById('updateProductId').value;
        const product = products.find(p => p.id == productId);
        if (product && product.image && !product.image.includes('TESDALOGO.png')) {
          photoPreview.innerHTML = `<img src="${product.image}" alt="Current photo">`;
        } else {
          photoPreview.innerHTML = '<p>No current photo</p>';
        }
      }
    });
  }
}

// ==========================
// Update Product Form Handler
// ==========================
function initUpdateProductForm() {
  const updateForm = document.getElementById('updateProductForm');
  if (updateForm) {
    updateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Directly perform update without confirmation
      performUpdate(updateForm);
    });
  }
}

// ==========================
// Perform Update Operation
// ==========================
async function performUpdate(updateForm) {
  const formData = new FormData(updateForm);
  const productId = formData.get('productId');
  
  // Add detailed logging
  console.log('=== UPDATE OPERATION STARTED ===');
  console.log('Product ID:', productId);
  console.log('Product Name:', formData.get('productName'));
  console.log('Category:', formData.get('category'));
  console.log('Price:', formData.get('price'));
  console.log('Stock:', formData.get('stock'));
  
  try {
    const response = await fetch('/TESDAPOS/connection/update_product.php', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log('Raw server response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      console.error('Response text:', responseText);
      throw new Error('Server returned invalid JSON response. Check console for details.');
    }
    
    console.log('Parsed result:', result);
    
    if (result.success) {
      console.log('Update successful, refreshing data...');
      
      // Clear cache and refetch from database
      inventoryItems = [];
      products = [];
      
      // Refetch products from database
      const fetchSuccess = await fetchProductsFromDB();
      if (fetchSuccess) {
        console.log('Data refetched successfully');
        // Refresh the inventory display
        renderInventory();
        closeUpdateModal();
        
        // Show success notification
        showToast('Product updated successfully and saved to database!', 'success');
      } else {
        console.error('Failed to refetch data after update');
        showToast('Product updated but failed to refresh display. Please refresh page.', 'warning');
      }
      
    } else {
      console.error('Update failed:', result.message);
      showToast('Failed to update product: ' + (result.message || 'Unknown error'), 'error');
    }
    
  } catch (error) {
    console.error('Error updating product:', error);
    showToast('Error updating product: ' + error.message, 'error');
  }
  
  console.log('=== UPDATE OPERATION COMPLETED ===');
}

// ==========================
// Notification System
// ==========================
function showNotification(message, type = 'success') {
  const toast = document.getElementById('notificationToast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = toast.querySelector('i');
  
  toastMessage.textContent = message;
  
  // Update icon and color based on type
  if (type === 'error') {
    toast.style.background = '#dc3545';
    toastIcon.className = 'fas fa-exclamation-circle';
  } else if (type === 'warning') {
    toast.style.background = '#ffc107';
    toast.style.color = '#333';
    toastIcon.className = 'fas fa-exclamation-triangle';
  } else {
    toast.style.background = '#28a745';
    toast.style.color = '#fff';
    toastIcon.className = 'fas fa-check-circle';
  }
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==========================
// Refresh Inventory Data
// ==========================
window.refreshInventory = async function() {
  inventoryItems = []; // Clear cache
  await renderInventory();
};

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded - Initializing Inventory page...');
  
  // Check if modal elements exist
  const updateModal = document.getElementById('updateProductModal');
  const confirmModal = document.getElementById('confirmationModal');
  
  if (!updateModal) {
    console.error('Update Product Modal not found!');
  } else {
    console.log('Update Product Modal found');
  }
  
  if (!confirmModal) {
    console.error('Confirmation Modal not found!');
  } else {
    console.log('Confirmation Modal found');
  }
  
  initUpdateProductForm();
  initImagePreview();
  initModernButtons();
  
  // Add refresh button functionality
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshInventory);
  }
  
  // Add category filter functionality
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', renderInventory);
  }
  
  await fetchProductsFromDB();
  renderInventory();
  
  console.log('Inventory page initialization complete');
});

// ==========================
// Modern Button Ripple Effect
// ==========================
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
  
  void circle.offsetWidth; // Trigger reflow
  circle.classList.add('ripple');
}

// ==========================
// Initialize Modern Buttons
// ==========================
function initModernButtons() {
  const modernButtons = document.querySelectorAll('.btn-modern-primary, .btn-modern-secondary');
  
  modernButtons.forEach(button => {
    button.addEventListener('click', createRipple);
  });
}