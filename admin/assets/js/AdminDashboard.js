// ==========================
// Sidebar toggle
// ==========================
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

// ==========================
// Section switching & Topbar
// ==========================
const sectionCards = {
  dashboard: { title: "Dashboard Overview", desc: "Quick summary of the system metrics." },
  orders: { title: "Orders Management", desc: "View and manage all trainee orders." },
  products: { title: "Product Creation", desc: "Add new items to the POS system inventory." },
  inventory: { title: "Inventory Management", desc: "Manage stock items and their details." },
  trainees: { title: "Trainee Access", desc: "Manage trainee accounts and their access." },
  transactions: { title: "Transactions", desc: "Review all past transactions and payment history." },
  maintenance: { title: "Maintenance", desc: "Configure system settings and perform maintenance tasks." }
};

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');

  // Show selected section
  const section = document.getElementById(sectionId);
  if (section) section.style.display = 'block';

  // ==========================
  // Update topbar card
  // ==========================
  const topbarCard = document.getElementById('topbarSectionCard');
  if (sectionCards[sectionId]) {
    topbarCard.innerHTML = `
      <div class="section-card">
        <h3>${sectionCards[sectionId].title}</h3>
        <p>${sectionCards[sectionId].desc}</p>
      </div>
    `;
  } else {
    topbarCard.innerHTML = '';
  }

  // ==========================
  // Update sidebar active link
  // ==========================
  document.querySelectorAll('.sidebar ul li a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar ul li a[onclick="showSection('${sectionId}')"]`);
  if (activeLink) activeLink.classList.add('active');

  // ==========================
  // Render dynamic content
  // ==========================
  switch (sectionId) {
    case 'orders': renderOrders(); break;
    case 'products': renderProducts(); break;
    case 'trainees': showTrainees(); break;
    case 'reports': showReports(); break;
    case 'transactions': renderTransactions(); break; // ✅ Added
    case 'maintenance': showMaintenance(); break;
    case 'inventory': renderInventory(); break;
  }
}

// ==========================
// Inventory & Products Management
// ==========================
let products = [];
let inventoryItems = [];

// ==========================
// Get Local Image Path
// ==========================
function getLocalImagePath(productId, productName) {
  // Look for image in img/product/ folder based on product ID
  // The image naming convention: product_[ID]_[timestamp].[ext]
  const basePath = 'img/product/';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  
  // For now, return a placeholder. In a real implementation, you might want to
  // check if the file exists, but since we can't do that from frontend,
  // we'll use a pattern that matches the naming convention
  return `${basePath}product_${productId}_placeholder.jpg`;
}

// ==========================
// Check if Local Image Exists
// ==========================
async function checkLocalImageExists(imagePath) {
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// ==========================
// Get Product Image with Fallback
// ==========================
async function getProductImage(productId, productName) {
  try {
    // Get list of available images
    const response = await fetch(`http://localhost/TESDAPOS/admin/list_images.php`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.images.length > 0) {
        // Find image for this product ID - get the most recent one
        const productImages = data.images.filter(img => 
          img.filename.startsWith(`product_${productId}_`)
        );
        
        if (productImages.length > 0) {
          // Sort by modification time to get the most recent image
          productImages.sort((a, b) => b.modified - a.modified);
          const imagePath = productImages[0].path;
          // Ensure the path is relative to the admin directory
          return `../${imagePath}`;
        }
      }
    }
  } catch (error) {
    console.log('Could not fetch image list:', error);
  }
  
  // If no local image found, return a local placeholder based on category
  return getLocalPlaceholderImage(productName);
}

// ==========================
// Get Local Placeholder Image
// ==========================
function getLocalPlaceholderImage(productName) {
  const name = productName.toLowerCase();
  
  // Check if we have matching images in the main img folder
  if (name.includes('adobo')) {
    return '../img/adobo.jpg';
  } else if (name.includes('sinigang')) {
    return '../img/sinigang.jpg';
  } else if (name.includes('iced') || name.includes('tea')) {
    return '../img/icedtea.jpg';
  } else if (name.includes('milk') || name.includes('tea')) {
    return '../img/milktea.jpg';
  } else {
    // Default placeholder - use TESDA logo as fallback
    return '../img/TESDALOGO.png';
  }
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
      // Convert database products to our format
      inventoryItems = await Promise.all(data.products.map(async (product) => ({
        id: product.id,
        name: product.product_name,
        category: product.category.toLowerCase(),
        price: product.price,
        quantity: product.stock_quantity,
        image: await getProductImage(product.id, product.product_name)
      })));
      
      // Refresh images to ensure we have the latest
      await refreshProductImages();
      
      // Also populate products array for consistency
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
    console.log('No fallback data - using empty arrays');
    
    // Clear arrays to avoid conflicts
    inventoryItems = [];
    products = [];
    
    console.log('Empty arrays initialized');
    return false;
  }
}

function initProducts() {
  const productForm = document.getElementById('createProductForm'); 
  const productsList = document.getElementById('productsList');

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const photoFile = productForm.photo.files[0];
      let imgURL = "../img/TESDALOGO.png"; // Use local placeholder
      if (photoFile) imgURL = URL.createObjectURL(photoFile);

      const product = {
        id: Date.now(),
        name: productForm.productName.value,
        category: productForm.category.value,
        price: Number(productForm.price.value),
        stock: Number(productForm.stock.value) || 0,
        image: imgURL
      };

      // ✅ Add to products
      products.push(product);

      // ✅ Sync with inventory
      inventoryItems.push({
        id: product.id,
        name: product.name,
        quantity: product.stock,
        price: product.price,
        image: product.image,
        category: product.category
      });

      renderProducts();
      renderInventory();
      productForm.reset();
    });
  }

  // ==========================
  // Render Products
  // ==========================
  window.renderProducts = function () {
    if (!productsList) return;
    productsList.innerHTML = '';

    if (products.length === 0) {
      productsList.innerHTML = `
        <p class="empty-message">
         "No products found. Go ahead and add new products in the 'Create Products' section to get started."
        </p>
      `;
      return;
    }

    products.forEach(product => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <h4>${product.name}</h4>
        <p>Category: ${product.category}</p>
        <p>Price: ₱${product.price.toFixed(2)}</p>
        <p>Stock: ${product.stock}</p>
        <button onclick="updateProduct(${product.id})">Update</button>
        <button onclick="deleteProduct(${product.id})">Delete</button>
      `;
      productsList.appendChild(div);
    });
  };

  // ==========================
  // Update Product
  // ==========================
  window.updateProduct = function (id) {
    console.log('updateProduct called with ID:', id);
    
    // First try to find in inventoryItems (database data), then in products array
    let product = inventoryItems.find(p => p.id === id);
    if (!product) {
      product = products.find(p => p.id === id);
    }
    if (!product) {
      console.error('Product not found with ID:', id);
      console.log('Available inventory items:', inventoryItems.map(i => i.id));
      console.log('Available products:', products.map(p => p.id));
      return;
    }
    
    // Populate modal with current product data
    document.getElementById('updateProductId').value = product.id;
    document.getElementById('updateProductName').value = product.name;
    document.getElementById('updateCategory').value = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    document.getElementById('updatePrice').value = product.price;
    // Handle different property names (stock vs quantity)
    document.getElementById('updateStockQuantity').value = product.stock || product.quantity;
    
    // Show current photo if exists
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
    
    // Show modal
    document.getElementById('updateProductModal').style.display = 'block';
  };

  // ==========================
  // Delete Product
  // ==========================
  window.deleteProduct = function (id) {
    products = products.filter(p => p.id !== id);
    inventoryItems = inventoryItems.filter(i => i.id !== id);
    renderProducts();
    renderInventory();
  };
}

// ==========================
// Force Refresh Single Product Image
// ==========================
async function forceRefreshProductImage(productId) {
  try {
    console.log(`Force refreshing image for product ${productId}...`);
    const response = await fetch(`http://localhost/TESDAPOS/admin/list_images.php`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.images.length > 0) {
        const productImages = data.images.filter(img => 
          img.filename.startsWith(`product_${productId}_`)
        );
        
        if (productImages.length > 0) {
          productImages.sort((a, b) => b.modified - a.modified);
          const newImagePath = productImages[0].path;
          
          // Update both arrays
          const product = products.find(p => p.id == productId);
          const inventoryItem = inventoryItems.find(i => i.id == productId);
          
          const correctedPath = `../${newImagePath}`;
          if (product) {
            console.log(`Force updating product ${productId}: ${product.image} -> ${correctedPath}`);
            product.image = correctedPath;
          }
          if (inventoryItem) {
            console.log(`Force updating inventory item ${productId}: ${inventoryItem.image} -> ${correctedPath}`);
            inventoryItem.image = correctedPath;
          }
          
          // Re-render
          renderProducts();
          renderInventory();
          
          return newImagePath;
        }
      }
    }
  } catch (error) {
    console.error(`Error force refreshing product ${productId} image:`, error);
  }
  return null;
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
        
        // Update images for all products
        for (let item of inventoryItems) {
          const productImages = data.images.filter(img => 
            img.filename.startsWith(`product_${item.id}_`)
          );
          
          if (productImages.length > 0) {
            // Sort by modification time to get the most recent image
            productImages.sort((a, b) => b.modified - a.modified);
            const newImagePath = productImages[0].path;
            
            // Only update if the image path has changed
            const correctedPath = `../${newImagePath}`;
            if (item.image !== correctedPath) {
              console.log(`Updating image for product ${item.id}: ${item.image} -> ${correctedPath}`);
              item.image = correctedPath;
              updatedCount++;
            }
          }
        }
        
        // Also update products array
        for (let product of products) {
          const productImages = data.images.filter(img => 
            img.filename.startsWith(`product_${product.id}_`)
          );
          
          if (productImages.length > 0) {
            productImages.sort((a, b) => b.modified - a.modified);
            const newImagePath = productImages[0].path;
            
            // Only update if the image path has changed
            const correctedPath = `../${newImagePath}`;
            if (product.image !== correctedPath) {
              console.log(`Updating image for product ${product.id}: ${product.image} -> ${correctedPath}`);
              product.image = correctedPath;
              updatedCount++;
            }
          }
        }
        
        console.log(`Image refresh complete. Updated ${updatedCount} products.`);
        return updatedCount > 0; // Return true if any images were updated
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

  // Show loading state
  inventoryList.innerHTML = '<p class="loading-message">Loading products...</p>';

  // Fetch products from database if not already loaded
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

  // Refresh product images to ensure we have the latest
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
    
    // Handle image path - use local image if available, otherwise placeholder
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
// Orders Management
// ==========================
let orders = []; // Empty array - will be populated from database when needed

const statusColors = {
  'Pending': 'pending',
  'Approved': 'approved',
  'Served': 'served',
  'Canceled': 'canceled'
};

function renderOrders() {
  const tbody = document.getElementById('ordersList');
  if (!tbody) return;
  tbody.innerHTML = '';
  orders.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${order.item}</td>
      <td>${order.quantity}</td>
      <td><span class="status ${statusColors[order.status]}">${order.status}</span></td>
      <td>
        <select onchange="updateOrderStatus(${order.id}, this.value)">
          <option value="">Change Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Served">Served</option>
          <option value="Canceled">Canceled</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================
// Render Transactions
// ==========================
function renderTransactions() {
  const tbody = document.getElementById('transactionsList');
  if (!tbody) return;
  tbody.innerHTML = '';
  orders.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${order.item}</td>
      <td>${order.quantity}</td>
      <td><span class="status ${statusColors[order.status]}">${order.status}</span></td>
      <td>
        <select onchange="updateOrderStatus(${order.id}, this.value)">
          <option value="">Change Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Served">Served</option>
          <option value="Canceled">Canceled</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateOrderStatus(orderId, newStatus) {
  if (!newStatus) return;
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    renderOrders();
  }
}

// ==========================
// Trainee Access Management
// ==========================
const trainees = []; // Empty array - will be populated from database when needed

function showTrainees() {
  const section = document.getElementById('trainees');
  if (!section) return;
  section.innerHTML = '<h2>Trainee Access</h2>';
  trainees.forEach((t, index) => {
    const div = document.createElement('div');
    div.innerHTML = `
      ${t.name} - ${t.online ? 'Online' : 'Offline'}
      <button onclick="toggleTrainee(${index})">${t.online ? 'Disable' : 'Enable'}</button>
    `;
    section.appendChild(div);
  });
}

function toggleTrainee(index) {
  trainees[index].online = !trainees[index].online;
  showTrainees();
}

// ==========================
// Reports
// ==========================
const menuItems = []; // Empty array - will be populated from database when needed

function showReports() {
  const section = document.getElementById('reports');
  if (!section) return;
  const totalSales = orders.reduce((total, order) => {
    const item = menuItems.find(i => i.name === order.item);
    return item && order.status === 'Served' ? total + item.price * order.quantity : total;
  }, 0);

  section.innerHTML = `
    <h2>Reports</h2>
    <p>Total Sales: ₱${totalSales}</p>
    <button onclick="generateReceipt()">Generate Receipt</button>
  `;
}

// ==========================
// Transactions (with receipt)
// ==========================
function showTransactions() {
  const section = document.getElementById('transactions');
  if (!section) return;

  const totalSales = orders.reduce((total, order) => {
    const item = menuItems.find(i => i.name === order.item);
    return item && order.status === 'Served' ? total + item.price * order.quantity : total;
  }, 0);

  section.innerHTML = `
    <h2>Transactions</h2>
    <p>Total Sales from Transactions: ₱${totalSales}</p>
    <button onclick="generateReceipt()">Generate Receipt</button>
  `;
}

function generateReceipt() {
  alert('Receipt generated for customer!');
}

// ==========================
// Maintenance
// ==========================
function showMaintenance() {
  const section = document.getElementById('maintenance');
  if (!section) return;
  section.innerHTML = `
    <h2>Maintenance Module</h2>
    <button onclick="performBackup()">Backup Data</button>
    <button onclick="viewAuditTrail()">View Audit Trail</button>
  `;
}

function performBackup() {
  alert("System backup complete!");
}

function viewAuditTrail() {
  alert("Audit trail viewed (placeholder).");
}

// ==========================
// Logout
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "/LandingPage/LandingPage.html"; 
  }
}

// ==========================
// Charts (Chart.js)
// ==========================
let barChart, pieChart;

function initCharts() {
  const barCtx = document.getElementById('barChart').getContext('2d');
  const pieCtx = document.getElementById('pieChart').getContext('2d');

  // --- Bar Chart ---
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Total Sales', 'Orders Today', 'Active Trainees', 'Low Stock Items'],
      datasets: [{
        label: 'Dashboard Metrics',
        data: [25000, 45, 120, 8],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // --- Pie Chart ---
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: ['Total Sales', 'Orders Today', 'Active Trainees', 'Low Stock Items'],
      datasets: [{
        data: [25000, 45, 120, 8],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

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
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
          e.target.value = '';
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          e.target.value = '';
          return;
        }
        
        // Create preview
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
        // If no file selected, show current photo or placeholder
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
        
        // Use absolute URL for XAMPP server
        const response = await fetch('http://localhost/TESDAPOS/admin/update_product.php', {
          method: 'POST',
          body: formData
        });
        
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get response text first to check if it's valid JSON
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
          // Update local data
          const product = products.find(p => p.id == productId);
          if (product) {
            product.name = formData.get('product_name');
            product.category = formData.get('category').toLowerCase();
            product.price = parseFloat(formData.get('price'));
            product.stock = parseInt(formData.get('stock_quantity'));
            
            // Update photo if uploaded
            const photoFile = document.getElementById('updatePhoto').files[0];
            console.log('Photo file:', photoFile);
            console.log('Image uploaded:', result.image_uploaded);
            console.log('Image path:', result.image_path);
            
            if (photoFile && result.image_uploaded && result.image_path) {
              // Use the server-provided image path
              const newImagePath = `../${result.image_path}`;
              console.log('Updating product image to:', newImagePath);
              product.image = newImagePath;
            } else {
              console.log('No image update - photoFile:', !!photoFile, 'image_uploaded:', result.image_uploaded, 'image_path:', result.image_path);
            }
          }
          
          // Update inventory item
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
          
          // Refresh displays immediately
          renderProducts();
          renderInventory();
          
          // Close modal
          closeUpdateModal();
          
          // Show success notification
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
  
  // Change color based on type
  if (type === 'error') {
    toast.style.background = '#dc3545';
  } else {
    toast.style.background = '#28a745';
  }
  
  // Show toast
  toast.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  initProducts();
  initUpdateProductForm();
  initImagePreview();
  // Load products from database on page load
  await fetchProductsFromDB();
  renderInventory();
  showSection('dashboard'); 
  initCharts();
});
