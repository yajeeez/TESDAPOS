// ==========================
// Inventory Management
// ==========================
let inventoryItems = [];
let products = [];

// ==========================
// Get Local Placeholder Image
// ==========================
function getLocalPlaceholderImage(productName) {
  const name = productName.toLowerCase();
  
  if (name.includes('adobo')) {
    return '../img/adobo.jpg';
  } else if (name.includes('sinigang')) {
    return '../img/sinigang.jpg';
  } else if (name.includes('iced') || name.includes('tea')) {
    return '../img/icedtea.jpg';
  } else if (name.includes('milk') || name.includes('tea')) {
    return '../img/milktea.jpg';
  } else {
    return '../img/TESDALOGO.png';
  }
}

// ==========================
// Get Product Image with Fallback
// ==========================
async function getProductImage(productId, productName) {
  try {
    const response = await fetch(`http://localhost/TESDAPOS/admin/list_images.php`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.images.length > 0) {
        const productImages = data.images.filter(img => 
          img.filename.startsWith(`product_${productId}_`)
        );
        
        if (productImages.length > 0) {
          productImages.sort((a, b) => b.modified - a.modified);
          const imagePath = productImages[0].path;
          return `../${imagePath}`;
        }
      }
    }
  } catch (error) {
    console.log('Could not fetch image list:', error);
  }
  
  return getLocalPlaceholderImage(productName);
}

// ==========================
// Fetch products from database
// ==========================
async function fetchProductsFromDB() {
  try {
    console.log('Attempting to fetch products...');
    const response = await fetch('http://localhost/TESDAPOS/admin/fetch_products.php');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetched data:', data);
    
    if (data.success) {
      inventoryItems = await Promise.all(data.products.map(async (product) => ({
        id: product.id,
        name: product.product_name,
        category: product.category.toLowerCase(),
        price: product.price,
        quantity: product.stock_quantity,
        image: await getProductImage(product.id, product.product_name)
      })));
      
      await refreshProductImages();
      
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
// Refresh Product Images
// ==========================
async function refreshProductImages() {
  try {
    console.log('Refreshing product images...');
    const response = await fetch(`http://localhost/TESDAPOS/admin/list_images.php`);
    if (response.ok) {
      const data = await response.json();
      console.log('Image data received:', data);
      
      if (data.success && data.images.length > 0) {
        let updatedCount = 0;
        
        for (let item of inventoryItems) {
          const productImages = data.images.filter(img => 
            img.filename.startsWith(`product_${item.id}_`)
          );
          
          if (productImages.length > 0) {
            productImages.sort((a, b) => b.modified - a.modified);
            const newImagePath = productImages[0].path;
            
            const correctedPath = `../${newImagePath}`;
            if (item.image !== correctedPath) {
              console.log(`Updating image for product ${item.id}: ${item.image} -> ${correctedPath}`);
              item.image = correctedPath;
              updatedCount++;
            }
          }
        }
        
        for (let product of products) {
          const productImages = data.images.filter(img => 
            img.filename.startsWith(`product_${product.id}_`)
          );
          
          if (productImages.length > 0) {
            productImages.sort((a, b) => b.modified - a.modified);
            const newImagePath = productImages[0].path;
            
            const correctedPath = `../${newImagePath}`;
            if (product.image !== correctedPath) {
              console.log(`Updating image for product ${product.id}: ${product.image} -> ${correctedPath}`);
              product.image = correctedPath;
              updatedCount++;
            }
          }
        }
        
        console.log(`Image refresh complete. Updated ${updatedCount} products.`);
        return updatedCount > 0;
      }
    }
  } catch (error) {
    console.error('Could not refresh product images:', error);
  }
  return false;
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

  const imagesUpdated = await refreshProductImages();

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
      <img src="${imageSrc}" alt="${item.name}" onerror="this.src='../img/TESDALOGO.png'">
      <div class="card-body">
        <h4>${item.name}</h4>
        <p>Category: ${item.category}</p>
        <p class="price">₱${item.price.toFixed(2)}</p>
        <p class="stock">Stock: ${item.quantity} pcs</p>
        <div class="actions">
          <button class="edit-btn" onclick="updateProduct(${item.id})"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-btn" onclick="deleteProduct(${item.id})"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    `;
    inventoryList.appendChild(div);
  });
}

// ==========================
// Update Product
// ==========================
window.updateProduct = function (id) {
  console.log('updateProduct called with ID:', id);
  
  let product = inventoryItems.find(p => p.id === id);
  if (!product) {
    product = products.find(p => p.id === id);
  }
  if (!product) {
    console.error('Product not found with ID:', id);
    return;
  }
  
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
  
  document.getElementById('updateProductModal').style.display = 'block';
};

// ==========================
// Delete Product
// ==========================
window.deleteProduct = function (id) {
  products = products.filter(p => p.id !== id);
  inventoryItems = inventoryItems.filter(i => i.id !== id);
  renderInventory();
};

// ==========================
// Modal Control Functions
// ==========================
window.closeUpdateModal = function() {
  document.getElementById('updateProductModal').style.display = 'none';
  document.getElementById('updateProductForm').reset();
  document.getElementById('currentPhotoPreview').innerHTML = '';
};

// Close modal when clicking outside of it
window.onclick = function(event) {
  const modal = document.getElementById('updateProductModal');
  if (event.target === modal) {
    closeUpdateModal();
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
    updateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(updateForm);
      const productId = formData.get('product_id');
      
      try {
        console.log('Updating product:', productId);
        
        const response = await fetch('http://localhost/TESDAPOS/admin/update_product.php', {
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
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          console.error('Response text:', responseText);
          throw new Error('Server returned invalid JSON response. Check console for details.');
        }
        
        console.log('Update result:', result);
        
        if (result.success) {
          const product = products.find(p => p.id == productId);
          if (product) {
            product.name = formData.get('product_name');
            product.category = formData.get('category').toLowerCase();
            product.price = parseFloat(formData.get('price'));
            product.stock = parseInt(formData.get('stock_quantity'));
            
            const photoFile = document.getElementById('updatePhoto').files[0];
            
            if (photoFile && result.image_uploaded && result.image_path) {
              const newImagePath = `../${result.image_path}`;
              console.log('Updating product image to:', newImagePath);
              product.image = newImagePath;
            }
          }
          
          const inventoryItem = inventoryItems.find(i => i.id == productId);
          if (inventoryItem) {
            inventoryItem.name = product.name;
            inventoryItem.category = product.category;
            inventoryItem.price = product.price;
            inventoryItem.quantity = product.stock;
            if (photoFile && result.image_uploaded && result.image_path) {
              const newImagePath = `../${result.image_path}`;
              console.log('Updating inventory item image to:', newImagePath);
              inventoryItem.image = newImagePath;
            }
          }
          
          renderInventory();
          closeUpdateModal();
          showNotification('Product updated successfully!');
          
        } else {
          showNotification('Failed to update product: ' + result.error, 'error');
        }
        
      } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Error updating product: ' + error.message, 'error');
      }
    });
  }
}

// ==========================
// Notification System
// ==========================
function showNotification(message, type = 'success') {
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
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  initUpdateProductForm();
  initImagePreview();
  await fetchProductsFromDB();
  renderInventory();
});