// Sidebar toggle
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

// Section switching
function showSection(id) {
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(sec => sec.style.display = 'none');
  const target = document.getElementById(id);
  if (target) target.style.display = 'block';
}

// Inventory Management
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

// Order Management (Dummy data + status updates)
let orders = [
  { id: 1, item: 'Burger', status: 'Pending' },
  { id: 2, item: 'Fries', status: 'Approved' },
];

function showOrders() {
  const section = document.getElementById('orders');
  section.innerHTML = '<h2>Manage Orders</h2>';
  orders.forEach(order => {
    section.innerHTML += `
      <div>
        <strong>Order #${order.id}</strong>: ${order.item} - 
        <span>${order.status}</span>
        <select onchange="updateOrderStatus(${order.id}, this.value)">
          <option value="">Change Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Served">Served</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>
    `;
  });
}

function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    showOrders();
  }
}

// Trainee Access Management (Dummy)
const trainees = [
  { name: 'Trainee A', online: true },
  { name: 'Trainee B', online: false },
];

function showTrainees() {
  const section = document.getElementById('trainees');
  section.innerHTML = '<h2>Trainee Access</h2>';
  trainees.forEach((t, index) => {
    section.innerHTML += `
      <div>
        ${t.name} - ${t.online ? 'Online' : 'Offline'}
        <button onclick="toggleTrainee(${index})">${t.online ? 'Disable' : 'Enable'}</button>
      </div>
    `;
  });
}

function toggleTrainee(index) {
  trainees[index].online = !trainees[index].online;
  showTrainees();
}

// Menu Module (Static)
const menuItems = [
  { name: 'Burger', price: 50 },
  { name: 'Fries', price: 30 },
  { name: 'Coke', price: 20 },
];

function showMenu() {
  const section = document.getElementById('menu');
  section.innerHTML = '<h2>Menu</h2>';
  menuItems.forEach(item => {
    section.innerHTML += `<div>${item.name} - ₱${item.price}</div>`;
  });
}

// Report Generation
function showReports() {
  const section = document.getElementById('reports');
  const totalSales = orders.reduce((total, order) => {
    const item = menuItems.find(i => i.name === order.item);
    return item && (order.status === 'Served') ? total + item.price : total;
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

// Maintenance (Stubs)
function showMaintenance() {
  const section = document.getElementById('maintenance');
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
// Sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");
}
