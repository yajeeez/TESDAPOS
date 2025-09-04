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
    case 'transactions': showTransactions(); break; // ✅ Added
    case 'maintenance': showMaintenance(); break;
    case 'inventory': renderInventory(); break;
  }
}

// ==========================
// Inventory & Products Management
// ==========================
let products = [];
let inventoryItems = [];

function initProducts() {
  const productForm = document.getElementById('createProductForm'); 
  const productsList = document.getElementById('productsList');

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const photoFile = productForm.photo.files[0];
      let imgURL = "https://via.placeholder.com/300x170?text=No+Image";
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
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newName = prompt("Update name:", product.name);
    const newCategory = prompt("Update category:", product.category);
    const newPrice = prompt("Update price:", product.price);
    const newStock = prompt("Update stock:", product.stock);
    if (newName && newCategory && newPrice && newStock) {
      product.name = newName;
      product.category = newCategory;
      product.price = Number(newPrice);
      product.stock = Number(newStock);

      // ✅ Sync with inventory
      const item = inventoryItems.find(i => i.id === id);
      if (item) {
        item.name = product.name;
        item.price = product.price;
        item.quantity = product.stock;
        item.category = product.category;
      }

      renderProducts();
      renderInventory();
    }
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
// Render Inventory with Category Filter
// ==========================
function renderInventory() {
  const inventoryList = document.getElementById('inventoryList');
  const filter = document.getElementById('categoryFilter')?.value || 'all';
  if (!inventoryList) return;

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
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
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
let orders = [
  { id: 180, item: 'Burger', quantity: 2, status: 'Pending' },
  { id: 69, item: 'Fries', quantity: 1, status: 'Approved' },
  { id: 3, item: 'Coke', quantity: 3, status: 'Served' },
  { id: 4, item: 'Pizza', quantity: 1, status: 'Canceled' },
  { id: 5, item: 'aeronchups', quantity: 1, status: 'Canceled' },
  { id: 6, item: 'aeronpagpag', quantity: 1, status: 'Canceled' },
  { id: 7, item: 'aeroneater', quantity: 1, status: 'Canceled' },
  { id: 8, item: 'aeronbisacool', quantity: 1, status: 'Canceled' },
  { id: 9, item: 'eronpatakla', quantity: 1, status: 'Canceled' },
  { id: 10, item: 'eronmalala', quantity: 1, status: 'Canceled' },
];

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
const trainees = [
  { name: 'Trainee A', online: true },
  { name: 'Trainee B', online: false },
];

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
const menuItems = [
  { name: 'Burger', price: 50 },
  { name: 'Fries', price: 30 },
  { name: 'Coke', price: 20 },
];

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
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  initProducts();
  renderInventory();
  showSection('dashboard'); 
  initCharts();
});
