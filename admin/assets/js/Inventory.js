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
  const modalMessage = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('modalConfirm');
  
  if (!modal || !modalMessage || !confirmBtn) {
    console.error('Modal elements not found');
    return;
  }
  
  // Set the message
  modalMessage.textContent = message;
  modal.style.display = 'block';
  
  console.log('Modal should now be visible');
  
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
// Get Product Image with Database Path
// ==========================
function getProductImagePath(productId, productName, dbImagePath) {
  // If we have a database image path, construct the correct relative path
  if (dbImagePath && dbImagePath.trim() !== '') {
    // Remove any leading slashes and ensure proper path from admin/components/
    const cleanPath = dbImagePath.replace(/^\/+/, '');
    return `../../${cleanPath}`;
  }
  
  // Return empty string if no image path - let CSS handle the styling for missing images
  return '';
}

// ==========================
// Fetch products from database
// ==========================
async function fetchProductsFromDB() {
  try {
    console.log('=== FETCHING PRODUCTS FROM DATABASE ===');
    console.log('Requesting:', '../../connection/fetch_products.php');
    
    const response = await fetch('../../connection/fetch_products.php', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Server returned invalid JSON');
    }
    
    console.log('Parsed response data:', data);
    
    if (data.success) {
      console.log('Found', data.products.length, 'products in database');
      
      inventoryItems = data.products.map((product) => {
        console.log('Processing product:', product);
        return {
          id: product.id,
          name: product.product_name,
          category: product.category.toLowerCase(),
          price: product.price,
          quantity: product.stock_quantity,
          image: getProductImagePath(product.id, product.product_name, product.image_path)
        };
      });
      
      products = inventoryItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        stock: item.quantity,
        image: item.image
      }));
      
      console.log('Processed inventory items:', inventoryItems);
      console.log('Processed products array:', products);
      console.log('Products loaded successfully:', inventoryItems.length, 'items');
      return true;
    } else {
      console.error('Failed to fetch products:', data.message || data.error);
      console.error('Full response:', data);
      return false;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Stack trace:', error.stack);
    inventoryItems = [];
    products = [];
    return false;
  }
}

// ==========================
// Render Inventory with Category Filter
// ==========================
async function renderInventory(forceRefresh = false) {
  const inventoryList = document.getElementById('inventoryList');
  const filter = document.getElementById('categoryFilter')?.value || 'all';
  if (!inventoryList) return;

  inventoryList.innerHTML = '<p class="loading-message">Loading products...</p>';

  // Force refresh or if no items cached
  if (forceRefresh || inventoryItems.length === 0) {
    console.log('Fetching fresh data from database...');
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
  
  // Update category count
  updateCategoryCount(filteredItems.length, filter);

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
    
    // Determine stock status for indicator
    const stockStatus = item.quantity > 10 ? 'in-stock' : item.quantity > 0 ? 'low-stock' : 'out-of-stock';
    
    // Category badge styling
    const categoryColors = {
      'food': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'beverage': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'snack': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'others': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    };
    
    div.innerHTML = `
      <div class="image-container">
        <div class="stock-indicator ${stockStatus}"></div>
        <div class="category-badge" style="background: ${categoryColors[item.category] || categoryColors.others}">
          ${item.category}
        </div>
        <img src="${imageSrc}" alt="${item.name}">
      </div>
      <div class="card-body">
        <h4>${item.name}</h4>
        
        <div class="product-info">
          <div class="info-item">
            <i class="fas fa-tag"></i>
            <span>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-cube"></i>
            <span>Product</span>
          </div>
        </div>
        
        <div class="price-display">
          <div class="price-label">Price</div>
          <div class="price-value">₱${item.price.toFixed(2)}</div>
        </div>
        
        <div class="stock-display">
          <div class="stock-info">
            <i class="fas fa-boxes"></i>
            <span class="stock-text">Stock</span>
          </div>
          <div class="stock-number">${item.quantity}</div>
        </div>
        
        <div class="actions">
          <button class="edit-btn" onclick="updateProduct('${item.id}')">
            <i class="fas fa-edit"></i>
            <span>Edit</span>
          </button>
          <button class="delete-btn" onclick="deleteProduct('${item.id}')">
            <i class="fas fa-trash"></i>
            <span>Delete</span>
          </button>
        </div>
      </div>
    `;
    inventoryList.appendChild(div);
  });
}

// ==========================
// Update Category Count Display
// ==========================
function updateCategoryCount(count, category) {
  let countBadge = document.querySelector('.category-count');
  
  if (!countBadge) {
    countBadge = document.createElement('div');
    countBadge.className = 'category-count';
    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) {
      filterBar.appendChild(countBadge);
    }
  }
  
  const categoryName = category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1);
  countBadge.textContent = `${count} ${categoryName}`;
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
    'Delete Product',
    `Are you sure you want to delete "${product.name}"?`,
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
    console.log('=== DELETE OPERATION STARTED ===');
    console.log('Product ID to delete:', id);
    
    const formData = new FormData();
    formData.append('productId', id);
    
    const response = await fetch('../../connection/delete_product.php', {
      method: 'POST',
      body: formData
    });
    
    console.log('Delete response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log('Raw delete response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Server returned invalid JSON. Check console for details.');
    }
    
    console.log('Parsed delete result:', result);
    
    if (result.success) {
      // Remove from local arrays immediately for better UX
      products = products.filter(p => p.id !== id);
      inventoryItems = inventoryItems.filter(i => i.id !== id);
      
      // Re-render inventory to reflect changes
      await renderInventory();
      
      // Show success message
      showToast('Product deleted successfully!', 'success');
      console.log('Product deleted successfully:', result.deleted_id);
    } else {
      throw new Error(result.error || 'Failed to delete product');
    }
    
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Error deleting product: ' + error.message, 'error');
  }
  
  console.log('=== DELETE OPERATION COMPLETED ===');
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
    const response = await fetch('../../connection/update_product.php', {
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
      
      // Force refresh from database to get updated data
      await renderInventory(true);
      closeUpdateModal();
      
      // Show success notification
      showToast('Product updated successfully and saved to database!', 'success');
      
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
  
  // Add category filter functionality
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', renderInventory);
  }
  
  await fetchProductsFromDB();
  
  // Check if we're coming from a redirect (like after creating a product)
  const urlParams = new URLSearchParams(window.location.search);
  const shouldRefresh = urlParams.get('refresh');
  
  if (shouldRefresh) {
    console.log('Refresh parameter detected, forcing fresh data load');
    await renderInventory(true); // Force refresh
    
    // Clean up URL without refresh parameter
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  } else {
    renderInventory();
  }
  
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