// ==========================
// Orders Management
// ==========================
let orders = [];

const statusColors = {
  'Pending': 'pending',
  'Approved': 'approved',
  'Served': 'served',
  'Canceled': 'canceled'
};

// ==========================
// Render Orders
// ==========================
function renderOrders() {
  const tbody = document.getElementById('ordersList');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
          No orders found. Orders will appear here when customers place them.
        </td>
      </tr>
    `;
    return;
  }
  
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
// Update Order Status
// ==========================
function updateOrderStatus(orderId, newStatus) {
  if (!newStatus) return;
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    renderOrders();
    
    // Show notification
    showNotification(`Order #${orderId} status updated to ${newStatus}`);
  }
}

// ==========================
// Notification System
// ==========================
function showNotification(message, type = 'success') {
  // Create toast if it doesn't exist
  let toast = document.getElementById('notificationToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'notificationToast';
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-check-circle"></i>
        <span id="toastMessage"></span>
      </div>
    `;
    document.body.appendChild(toast);
  }
  
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
// Fetch Orders from Database (placeholder)
// ==========================
async function fetchOrdersFromDB() {
  try {
    // This would fetch from your orders API endpoint
    // const response = await fetch('http://localhost/TESDAPOS/admin/fetch_orders.php');
    // For now, we'll use mock data
    
    console.log('Fetching orders from database...');
    // Mock orders for demonstration
    orders = [
      { id: 1001, item: 'Chicken Adobo', quantity: 2, status: 'Pending' },
      { id: 1002, item: 'Pork Sinigang', quantity: 1, status: 'Approved' },
      { id: 1003, item: 'Iced Tea', quantity: 3, status: 'Served' }
    ];
    
    renderOrders();
    return true;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return false;
  }
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  await fetchOrdersFromDB();
  renderOrders();
});