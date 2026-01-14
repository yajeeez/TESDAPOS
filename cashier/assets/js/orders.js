// ==========================
// ==========================
// Orders Management - Cashier
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

// Get current cashier info from window object or URL parameters
function getCurrentCashier() {
  if (window.cashierInfo) {
    return window.cashierInfo;
  }

  const urlParams = new URLSearchParams(window.location.search);
  return {
    name: urlParams.get('name') || 'Cashier',
    username: urlParams.get('username') || 'cashier',
    email: urlParams.get('email') || ''
  };
}

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
        <td colspan="9" style="text-align: center; padding: 2rem; color: #666;">
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

    const paymentMethodRaw = (order.payment_method ?? '').toString();
    const paymentMethodLower = paymentMethodRaw.toLowerCase();
    const isCash = paymentMethodLower === 'cash';
    const paymentDisplay = isCash ? 'Cash' : (order.card_type || paymentMethodRaw || 'Card');
    const txnDisplay = (!isCash && order.transaction_id) ? order.transaction_id : '';

    // Debug: Log served_by info for this order
    console.log(`Order ${displayId} - served_by: "${order.served_by}", served_by_username: "${order.served_by_username}"`);

    tr.innerHTML = `
      <td>${displayId}</td>
      <td>${itemDisplay}</td>
      <td>${order.total_item_count || order.quantity || 1}</td>
      <td>₱${(order.total_amount || 0).toFixed(2)}</td>
      <td>${paymentDisplay}</td>
      <td>${txnDisplay}</td>
      <td><span class="status ${statusColors[order.status] || 'pending'}">${order.status || 'Pending'}</span></td>
      <td>${order.served_by ? order.served_by : (order.served_by_username ? order.served_by_username : '<span style="color: #999;">Not yet served</span>')}</td>
      <td>
        <button class="edit-btn" onclick="openEditModal('${order.order_id || order._id || order.id}')" title="Edit Payment">
          <i class="fas fa-edit"></i>
        </button>
        <button class="print-receipt-btn" onclick="printReceipt('${order.order_id || order._id || order.id}')" title="Print Receipt">
          <i class="fas fa-print"></i>
        </button>
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

    // Get current cashier info
    const currentCashier = getCurrentCashier();

    // Update order status
    order.status = newStatus;

    // If marking as served or canceled, record the cashier who did the action
    if (newStatus === 'Served' || newStatus === 'Canceled') {
      order.served_by = currentCashier.name;
      order.served_by_username = currentCashier.username;
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

    // Save to database with cashier info
    saveOrderStatusToDB(orderIdStr, newStatus, currentCashier).then(success => {
      if (success) {
        console.log(`Order #${order.order_id || order._id || order.id} status updated to ${newStatus}`);
        if (newStatus === 'Served') {
          console.log(`Order served by: ${currentCashier.name} (${currentCashier.username})`);
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
async function saveOrderStatusToDB(orderId, newStatus, cashierInfo) {
  try {
    const requestData = {
      order_id: orderId,
      status: newStatus
    };

    // Add cashier info if marking as served or canceled
    if ((newStatus === 'Served' || newStatus === 'Canceled') && cashierInfo) {
      requestData.served_by = cashierInfo.name;
      requestData.served_by_username = cashierInfo.username;
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
  // Debug: Log cashier info
  const cashierInfo = getCurrentCashier();
  console.log('🔍 Current cashier info:', cashierInfo);
  console.log('🔍 Window cashier info:', window.cashierInfo);

  await fetchOrdersFromDB();
});


// ==========================
// Print Receipt Function
// ==========================
function printReceipt(orderId) {
  const order = orders.find(o => {
    const orderIdStr = String(orderId);
    const orderOrderId = String(o.order_id || '');
    const orderMongoId = String(o._id || '');
    const orderIdField = String(o.id || '');

    return orderOrderId === orderIdStr || orderMongoId === orderIdStr || orderIdField === orderIdStr;
  });

  if (!order) {
    alert('Order not found');
    return;
  }

  // Calculate subtotal (before VAT)
  const subtotal = order.total_amount || 0;

  // Calculate VAT (1% of subtotal)
  const vatRate = 0.01;
  const vatAmount = subtotal * vatRate;

  // Calculate total (subtotal + VAT)
  const total = subtotal + vatAmount;

  // Handle item display
  let itemDisplay = '';
  if (order.product_names && Array.isArray(order.product_names)) {
    itemDisplay = order.product_names.map((name, index) => {
      const qty = order.quantities && order.quantities[index] ? order.quantities[index] : 1;
      let price = order.prices && order.prices[index] ? parseFloat(order.prices[index]) : 0;

      // If price is 0, calculate from subtotal
      if (price === 0 && subtotal > 0) {
        price = subtotal / (order.quantities ? order.quantities.reduce((a, b) => a + b, 0) : 1);
      }

      return `<tr>
        <td style="padding: 4px 0; text-align: left;">${name}</td>
        <td style="padding: 4px 0; text-align: center;">${qty}</td>
        <td style="padding: 4px 0; text-align: right;">₱${price.toFixed(2)}</td>
      </tr>`;
    }).join('');
  } else if (order.item) {
    const qty = order.quantity || order.total_item_count || 1;
    const price = subtotal / qty;
    itemDisplay = `<tr>
      <td style="padding: 4px 0; text-align: left;">${order.item}</td>
      <td style="padding: 4px 0; text-align: center;">${qty}</td>
      <td style="padding: 4px 0; text-align: right;">₱${price.toFixed(2)}</td>
    </tr>`;
  } else {
    // Fallback: use total_amount as the item price
    const qty = order.total_item_count || order.quantity || 1;
    const price = subtotal / qty;
    itemDisplay = `<tr>
      <td style="padding: 4px 0; text-align: left;">Order Items</td>
      <td style="padding: 4px 0; text-align: center;">${qty}</td>
      <td style="padding: 4px 0; text-align: right;">₱${price.toFixed(2)}</td>
    </tr>`;
  }

  const displayId = order.order_id || order.id;
  const cashReceived = order.cash_received || 0;
  const changeAmount = cashReceived > 0 ? (cashReceived - total) : 0;
  const paymentMethod = order.payment_method || 'Cash';

  const currentDate = new Date(order.created_at || new Date());
  const dateStr = currentDate.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const timeStr = currentDate.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Determine if this is a card payment and prepare header lines
  const paymentMethodLower = paymentMethod.toLowerCase();
  const isCardPayment = paymentMethodLower === 'visa' || paymentMethodLower === 'gcash' || paymentMethodLower === 'maya';
  let headerPaymentLine = '';
  let headerCardTypeLine = '';
  let headerTransactionLine = '';

  if (isCardPayment) {
    headerPaymentLine = `<p><strong>Payment Method:</strong> Card</p>`;
    const cardTypeDisplay = order.card_type || paymentMethod;
    headerCardTypeLine = `<p><strong>Card Type:</strong> ${cardTypeDisplay}</p>`;
    if (order.transaction_id) {
      headerTransactionLine = `<p><strong>Transaction ID:</strong> ${order.transaction_id}</p>`;
    }
  } else if (paymentMethodLower === 'cash') {
    // For cash payments, show transaction ID but not payment method or card type
    if (order.transaction_id) {
      headerTransactionLine = `<p><strong>Transaction ID:</strong> ${order.transaction_id}</p>`;
    }
  }

  // Create print window
  const printWindow = window.open('', '_blank', 'width=300,height=600');

  if (!printWindow) {
    alert('Please allow popups to print receipt');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - Order #${displayId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.4;
          padding: 10px;
          width: 280px;
          margin: 0 auto;
          background: white;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #000;
        }
        .receipt-header img {
          width: 60px;
          height: 60px;
          margin-bottom: 5px;
        }
        .receipt-header h1 {
          font-size: 16px;
          font-weight: bold;
          margin: 5px 0;
        }
        .receipt-header p {
          font-size: 10px;
          margin: 2px 0;
        }
        .receipt-info {
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #000;
        }
        .receipt-info p {
          margin: 3px 0;
          font-size: 11px;
        }
        .items-table {
          width: 100%;
          margin-bottom: 10px;
          border-collapse: collapse;
        }
        .items-table th {
          border-bottom: 1px solid #000;
          padding: 5px 0;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
        }
        .items-table td {
          font-size: 10px;
        }
        .totals {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #000;
        }
        .totals p {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 11px;
        }
        .totals .vat-line {
          font-size: 11px;
          color: #333;
        }
        .totals .grand-total {
          font-size: 14px;
          font-weight: bold;
          padding-top: 5px;
          border-top: 2px solid #000;
          margin-top: 5px;
        }
        .totals .change-line {
          font-size: 13px;
          font-weight: bold;
          color: #000;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed #000;
        }
        .payment-info {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed #000;
          font-size: 11px;
          text-align: center;
        }
        .receipt-footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px dashed #000;
          font-size: 10px;
        }
        @media print {
          body {
            width: 80mm;
            padding: 5mm;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-header">
        <img src="../../img/TESDALOGO.png" alt="TESDA Logo">
        <h1>TESDA POS SYSTEM</h1>
        <p>Food Ordering System</p>
        <p>Thank you for your order!</p>
      </div>
      
      <div class="receipt-info">
        <p><strong>Order #:</strong> ${displayId}</p>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Time:</strong> ${timeStr}</p>
        ${headerPaymentLine}
        ${headerCardTypeLine}
        ${headerTransactionLine}
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th style="text-align: left;">Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemDisplay}
        </tbody>
      </table>
      
      <div class="totals">
        <p>
          <span>SUB TOTAL:</span>
          <span>₱${subtotal.toFixed(2)}</span>
        </p>
        <p class="vat-line">
          <span>VAT (1%):</span>
          <span>₱${vatAmount.toFixed(2)}</span>
        </p>
        <p class="grand-total">
          <span>TOTAL:</span>
          <span>₱${total.toFixed(2)}</span>
        </p>
        ${cashReceived > 0 ? `
        <p class="change-line">
          <span>Cash:</span>
          <span>₱${cashReceived.toFixed(2)}</span>
        </p>
        <p class="change-line">
          <span>Change:</span>
          <span>₱${changeAmount.toFixed(2)}</span>
        </p>
        ` : ''}
      </div>

      <div class="receipt-footer">
        <p>This serves as your official receipt</p>
        <p>Please keep for your records</p>
        <p style="margin-top: 10px;">© 2025 TESDA POS System</p>
      </div>
      
      <script>
        setTimeout(() => {
          window.print();
        }, 500);
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

// ==========================
// Edit Payment Modal Functions
// ==========================
function openEditModal(orderId) {
  const order = orders.find(o => {
    const orderIdStr = String(orderId);
    const orderOrderId = String(o.order_id || '');
    const orderMongoId = String(o._id || '');
    const orderIdField = String(o.id || '');

    return orderOrderId === orderIdStr || orderMongoId === orderIdStr || orderIdField === orderIdStr;
  });

  if (!order) {
    alert('Order not found');
    return;
  }

  // Handle item display
  let itemDisplay = '';
  if (order.product_names && Array.isArray(order.product_names)) {
    itemDisplay = order.product_names.join(', ');
  } else if (order.item) {
    itemDisplay = order.item;
  } else {
    itemDisplay = 'Unknown items';
  }

  const displayId = order.order_id || order.id;
  const totalAmount = order.total_amount || 0;
  const quantity = order.total_item_count || order.quantity || 1;

  // Create modal HTML
  const modalHtml = `
    <div class="edit-modal-overlay" id="editModalOverlay" onclick="closeEditModal()">
      <div class="edit-modal" onclick="event.stopPropagation()">
        <div class="edit-modal-header">
          <h3><i class="fas fa-edit"></i> Edit Payment Details</h3>
        </div>
        <div class="edit-modal-body">
          <div class="order-info">
            <div class="info-row">
              <label>Order ID:</label>
              <span>${displayId}</span>
            </div>
            <div class="info-row">
              <label>Item(s):</label>
              <span>${itemDisplay}</span>
            </div>
            <div class="info-row">
              <label>Quantity:</label>
              <span>${quantity}</span>
            </div>
            <div class="info-row">
              <label>Amount:</label>
              <span>₱${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div class="edit-form">
            <div class="form-group">
              <label for="cashReceived">Cash Received:</label>
              <input type="number" id="cashReceived" step="0.01" min="0" placeholder="Enter cash received" oninput="calculateChange()">
            </div>
            <div class="form-group">
              <label for="changeAmount">Change:</label>
              <input type="number" id="changeAmount" step="0.01" readonly placeholder="0.00">
            </div>
            <div class="form-group">
              <label for="totalBalance">Total Balance:</label>
              <input type="number" id="totalBalance" value="${totalAmount.toFixed(2)}" step="0.01" readonly>
            </div>
          </div>
        </div>
        <div class="edit-modal-footer">
          <button class="cancel-btn" onclick="closeEditModal()">Cancel</button>
          <button class="save-btn" onclick="savePaymentEdit('${orderId}')">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>
    </div>
  `;

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeEditModal() {
  const modal = document.getElementById('editModalOverlay');
  if (modal) {
    modal.remove();
  }
}

function calculateChange() {
  const cashReceived = parseFloat(document.getElementById('cashReceived').value) || 0;
  const totalBalance = parseFloat(document.getElementById('totalBalance').value) || 0;
  const change = cashReceived - totalBalance;

  document.getElementById('changeAmount').value = change >= 0 ? change.toFixed(2) : '0.00';
}

async function savePaymentEdit(orderId) {
  const cashReceived = parseFloat(document.getElementById('cashReceived').value) || 0;
  const changeAmount = parseFloat(document.getElementById('changeAmount').value) || 0;
  const totalBalance = parseFloat(document.getElementById('totalBalance').value) || 0;

  if (cashReceived <= 0) {
    alert('Please enter a valid cash received amount');
    return;
  }

  if (cashReceived < totalBalance) {
    alert('Cash received cannot be less than total balance');
    return;
  }

  const cashierInfo = getCurrentCashier();

  console.log('Saving payment edit for order:', orderId);
  console.log('Cashier info:', cashierInfo);

  try {
    const requestData = {
      order_id: orderId,
      cash_received: cashReceived,
      change_amount: changeAmount,
      total_balance: totalBalance,
      updated_by: cashierInfo.username,
      updated_by_name: cashierInfo.name
    };

    console.log('Request data:', requestData);

    // Update order with payment details
    const response = await fetch('/TESDAPOS/cashier/update_payment_details.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Response result:', result);

    if (result.success) {
      alert('Payment details updated successfully');
      closeEditModal();
      await fetchOrdersFromDB(); // Refresh orders
    } else {
      alert('Failed to update payment details: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error updating payment details:', error);
    alert('Error updating payment details: ' + error.message);
  }
}
