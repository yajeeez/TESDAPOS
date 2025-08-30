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
  inventory: { title: "Inventory Management", desc: "Manage stock items and their details." },
  trainees: { title: "Trainee Access", desc: "Manage trainee accounts and their access." },
  transactions: { title: "Transactions", desc: "Review all past transactions and payment history." },
  maintenance: { title: "Maintenance", desc: "Configure system settings and perform maintenance tasks." },
  reports: { title: "Reports", desc: "Generate sales, inventory, and trainee activity reports." }
};

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');
  const section = document.getElementById(sectionId);
  if(section) section.style.display = 'block';

  // Update topbar
  const topbarCard = document.getElementById('topbarSectionCard');
  if(sectionCards[sectionId]) {
    topbarCard.innerHTML = `
      <div class="section-card">
        <h3>${sectionCards[sectionId].title}</h3>
        <p>${sectionCards[sectionId].desc}</p>
      </div>
    `;
  } else {
    topbarCard.innerHTML = '';
  }

  // Update sidebar active state
  document.querySelectorAll('.sidebar ul li a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar ul li a[onclick="showSection('${sectionId}')"]`);
  if(activeLink) activeLink.classList.add('active');

  // Render dynamic content if needed
  if(sectionId === 'orders') renderOrders();
  if(sectionId === 'trainees') showTrainees();
  if(sectionId === 'reports') showReports();
  if(sectionId === 'maintenance') showMaintenance();
}

// ==========================
// Inventory Management
// ==========================
let inventoryItems = [];

document.addEventListener('DOMContentLoaded', () => {
  const inventoryForm = document.getElementById('inventoryForm');
  const inventoryList = document.getElementById('inventoryList');

  if (inventoryForm) {
    inventoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const item = {
        id: Date.now(),
        name: inventoryForm.itemName.value,
        quantity: Number(inventoryForm.quantity.value),
        price: Number(inventoryForm.price.value),
      };
      inventoryItems.push(item);
      renderInventory();
      inventoryForm.reset();
    });
  }

  function renderInventory() {
    inventoryList.innerHTML = '';
    inventoryItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'inventory-item';
      div.innerHTML = `
        <strong>${item.name}</strong> - Qty: ${item.quantity}, ₱${item.price.toFixed(2)}
        <button onclick="updateItem(${item.id})">Update</button>
        <button onclick="deleteItem(${item.id})">Delete</button>
      `;
      inventoryList.appendChild(div);
    });
  }

  window.updateItem = function (id) {
    const item = inventoryItems.find(i => i.id === id);
    if (!item) return;
    const newName = prompt("Update name:", item.name);
    const newQty = prompt("Update quantity:", item.quantity);
    const newPrice = prompt("Update price:", item.price);
    if (newName && newQty && newPrice) {
      item.name = newName;
      item.quantity = Number(newQty);
      item.price = Number(newPrice);
      renderInventory();
    }
  };

  window.deleteItem = function (id) {
    inventoryItems = inventoryItems.filter(i => i.id !== id);
    renderInventory();
  };
});

// ==========================
// Orders Management
// ==========================
let orders = [
  { id: 1, item: 'Burger', quantity: 2, status: 'Pending' },
  { id: 2, item: 'Fries', quantity: 1, status: 'Approved' },
  { id: 3, item: 'Coke', quantity: 3, status: 'Served' },
  { id: 4, item: 'Pizza', quantity: 1, status: 'Canceled' },
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

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', () => {
  showSection('dashboard'); // default section
  initCharts();
});


// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  showSection('dashboard'); // default
  initCharts();
});
