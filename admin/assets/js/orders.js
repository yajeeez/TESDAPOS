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
  window.location.href = "../../public/components/login.html"; 
}

const statusColors = {
  'Pending': 'pending',
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
        <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
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
    
    // Debug: Log served_by info for this order
    console.log(`Order ${displayId} - served_by: "${order.served_by}", served_by_username: "${order.served_by_username}"`);
    
    tr.innerHTML = `
      <td>${displayId}</td>
      <td>${itemDisplay}</td>
      <td>${order.total_item_count || order.quantity || 1}</td>
      <td>₱${(order.total_amount || 0).toFixed(2)}</td>
      <td><span class="status ${statusColors[order.status] || 'served'}">${order.status || 'Served'}</span></td>
      <td>${order.served_by ? order.served_by : (order.served_by_username ? order.served_by_username : '<span style="color: #999;">Not yet served</span>')}</td>
      <td>
        <select onchange="updateOrderStatus('${order.order_id || order._id || order.id}', this.value)">
          <option value="">Change Status</option>
          <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
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
  
  console.log('Updating order:', orderId, 'to status:', newStatus);
  
  // Convert orderId to string for consistent comparison
  const orderIdStr = String(orderId);
  
  const order = orders.find(o => {
    const orderOrderId = String(o.order_id || '');
    const orderMongoId = String(o._id || '');
    const orderIdField = String(o.id || '');
    
    return orderOrderId === orderIdStr || orderMongoId === orderIdStr || orderIdField === orderIdStr;
  });
  
  if (order) {
    const oldStatus = order.status || 'Unknown';
    const oldServedBy = order.served_by || '';
    
    console.log('Found order, updating status from', oldStatus, 'to', newStatus);
    
    // Get current admin info
    const adminInfo = window.adminInfo || { name: 'Admin', username: 'admin' };
    
    // Update order status
    order.status = newStatus;
    
    // If marking as served or canceled, record the admin who did the action
    if (newStatus === 'Served' || newStatus === 'Canceled') {
      order.served_by = adminInfo.name;
      order.served_by_username = adminInfo.username;
      order.served_at = new Date().toISOString();
      order.action_type = newStatus === 'Served' ? 'served' : 'canceled';
    } else if (newStatus === 'Pending') {
      // Clear served_by info if changing back to pending
      order.served_by = '';
      order.served_by_username = '';
      order.served_at = '';
      order.action_type = '';
    }
    
    // Immediately update the display
    renderOrders();
    
    // Save to database
    saveOrderStatusToDB(orderIdStr, newStatus).then(success => {
      if (success) {
        console.log(`Order #${order.order_id || order._id || order.id} status updated to ${newStatus}`);
        if (newStatus === 'Served' || newStatus === 'Canceled') {
          console.log(`Order ${newStatus.toLowerCase()} by: ${adminInfo.name} (${adminInfo.username})`);
        }
      } else {
        // Revert status if save failed
        order.status = oldStatus;
        order.served_by = oldServedBy;
        renderOrders();
        console.error('Failed to update order status');
      }
    });
  } else {
    console.error('Order not found:', orderIdStr);
  }
}

// ==========================
// Save Order Status to Database
// ==========================
async function saveOrderStatusToDB(orderId, newStatus) {
  try {
    const requestData = {
      order_id: orderId,
      status: newStatus
    };
    
    // Add admin info if marking as served or canceled
    if (newStatus === 'Served' || newStatus === 'Canceled') {
      const adminInfo = window.adminInfo || { name: 'Admin', username: 'admin' };
      requestData.served_by = adminInfo.name;
      requestData.served_by_username = adminInfo.username;
      requestData.served_at = new Date().toISOString();
    }
    
    const response = await fetch('/TESDAPOS/admin/update_order_status.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error saving order status:', error);
    return false;
  }
}

// ==========================
// Fetch Orders from Database
// ==========================
async function fetchOrdersFromDB() {
  try {
    console.log('Fetching orders from database...');
    
    const response = await fetch('/TESDAPOS/admin/fetch_orders.php');
    
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
      return false;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return false;
  }
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  // Debug: Log admin info
  console.log('🔍 Admin info:', window.adminInfo);
  
  await fetchOrdersFromDB();
});