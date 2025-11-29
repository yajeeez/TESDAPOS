// ==========================
// Orders Management
// ==========================
let orders = [];

const statusColors = {
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
    
    // Extract product names from items array
    const productNames = order.product_names || [];
    const itemsDisplay = productNames.length > 0 ? productNames.join(', ') : 'No items';
    const totalQuantity = order.total_item_count || 0;
    
    tr.innerHTML = `
      <td>${order.order_id || order.id}</td>
      <td>${itemsDisplay}</td>
      <td>${totalQuantity}</td>
      <td><span class="status ${statusColors[order.status] || 'pending'}">${order.status || 'Pending'}</span></td>
      <td>
        <select onchange="updateOrderStatus('${order.order_id || order.id}', this.value)">
          <option value="">Change Status</option>
          <option value="Served" ${order.status === 'Served' ? 'selected' : ''}>Served</option>
          <option value="Canceled" ${order.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
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
  
  // Find the order by order_id (string) or id (number)
  const order = orders.find(o => 
    (o.order_id && o.order_id === orderId) || 
    (o.id && o.id.toString() === orderId.toString())
  );
  
  if (order) {
    const oldStatus = order.status;
    order.status = newStatus;
    renderOrders();
    
    // Show notification
    showNotification(`Order #${orderId} status updated from ${oldStatus} to ${newStatus}`);
  } else {
    console.error('Order not found:', orderId);
    showNotification('Order not found', 'error');
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
    console.log('Fetching orders from database...');
    
    const response = await fetch('http://localhost/TESDAPOS/admin/fetch_orders.php');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.orders) {
      orders = result.orders;
      renderOrders();
      console.log(`Successfully fetched ${orders.length} orders`);
      return true;
    } else {
      console.error('API returned error:', result.message || 'Unknown error');
      showNotification('Failed to fetch orders: ' + (result.message || 'Unknown error'), 'error');
      return false;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    showNotification('Failed to connect to server. Please check your connection.', 'error');
    return false;
  }
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  await fetchOrdersFromDB();
});