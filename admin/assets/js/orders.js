// ==========================
// ==========================
// Orders Management
// ==========================
let orders = [];

// ==========================
// Logout Function
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "/TESDAPOS/LandingPage/LandingPage.html"; 
  }
}

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
        <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
          No orders found. Orders will appear here when customers place them.
        </td>
      </tr>
    `;
    return;
  }
  
  orders.forEach(order => {
    const tr = document.createElement('tr');
    
    // Handle real order data structure with product_names
    let itemDisplay = '';
    if (order.product_names && Array.isArray(order.product_names)) {
      itemDisplay = order.product_names.join(', ');
    } else if (order.item) {
      itemDisplay = order.item;
    } else {
      itemDisplay = 'Unknown items';
    }
    
    // Use order_id if available, otherwise use id
    const displayId = order.order_id || order.id;
    
    tr.innerHTML = `
      <td>${displayId}</td>
      <td>${itemDisplay}</td>
      <td>${order.total_item_count || order.quantity || 1}</td>
      <td>₱${(order.total_amount || 0).toFixed(2)}</td>
      <td><span class="status ${statusColors[order.status] || 'pending'}">${order.status || 'Pending'}</span></td>
      <td>
        <select onchange="updateOrderStatus('${order._id || order.id}', this.value)">
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
  const order = orders.find(o => (o._id === orderId) || (o.id === orderId));
  if (order) {
    order.status = newStatus;
    renderOrders();
    
    // Show notification with order_id for better user experience
    const displayId = order.order_id || order._id || order.id;
    showNotification(`Order #${displayId} status updated to ${newStatus}`);
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
// Fetch Orders from Database
// ==========================
async function fetchOrdersFromDB() {
  try {
    console.log('Fetching orders from database...');
    
    const response = await fetch('/TESDAPOS/admin/fetch_orders.php');
    const data = await response.json();
    
    if (data.success) {
      orders = data.orders;
      console.log('Orders fetched successfully:', orders);
    } else {
      console.error('Error fetching orders:', data.message);
      // Use mock data as fallback
      orders = [
        { order_id: '01', id: 1001, item: 'Chicken Adobo', quantity: 2, status: 'Pending' },
        { order_id: '02', id: 1002, item: 'Pork Sinigang', quantity: 1, status: 'Approved' },
        { order_id: '03', id: 1003, item: 'Iced Tea', quantity: 3, status: 'Served' }
      ];
    }
    
    renderOrders();
    return true;
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Use mock data as fallback
    orders = [
      { order_id: '01', id: 1001, item: 'Chicken Adobo', quantity: 2, status: 'Pending' },
      { order_id: '02', id: 1002, item: 'Pork Sinigang', quantity: 1, status: 'Approved' },
      { order_id: '03', id: 1003, item: 'Iced Tea', quantity: 3, status: 'Served' }
    ];
    renderOrders();
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