// ==========================
// Transactions Management
// ==========================
let orders = [];
let menuItems = [];

const statusColors = {
  'Pending': 'pending',
  'Approved': 'approved',
  'Served': 'served',
  'Canceled': 'canceled'
};

// ==========================
// Render Transactions
// ==========================
function renderTransactions() {
  const tbody = document.getElementById('transactionsList');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
          No transactions found. Completed orders will appear here.
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
    renderTransactions();
    showNotification(`Transaction #${orderId} status updated to ${newStatus}`);
  }
}

// ==========================
// Show Transactions with Summary
// ==========================
function showTransactions() {
  const section = document.getElementById('transactions');
  if (!section) return;

  const totalSales = orders.reduce((total, order) => {
    const item = menuItems.find(i => i.name === order.item);
    return item && order.status === 'Served' ? total + item.price * order.quantity : total;
  }, 0);

  // Update the page content if there's a transactions section
  const existingContent = section.querySelector('.transactions-summary');
  if (!existingContent) {
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'transactions-summary';
    summaryDiv.innerHTML = `
      <div style="background: var(--white); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: var(--tesda-blue); margin-bottom: 0.5rem;">Transaction Summary</h3>
        <p style="color: #333;">Total Sales from Transactions: <strong>₱${totalSales.toFixed(2)}</strong></p>
        <button onclick="generateReceipt()" style="background: var(--tesda-blue); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 0.5rem;">
          <i class="fas fa-receipt"></i> Generate Receipt
        </button>
      </div>
    `;
    section.insertBefore(summaryDiv, section.firstChild);
  }
}

// ==========================
// Generate Receipt
// ==========================
function generateReceipt() {
  const servedOrders = orders.filter(order => order.status === 'Served');
  
  if (servedOrders.length === 0) {
    showNotification('No completed transactions to generate receipt for.', 'error');
    return;
  }

  let receiptContent = '=== TESDA POS RECEIPT ===\\n';
  receiptContent += `Date: ${new Date().toLocaleDateString()}\\n`;
  receiptContent += `Time: ${new Date().toLocaleTimeString()}\\n`;
  receiptContent += '\\n--- ITEMS ---\\n';
  
  let total = 0;
  servedOrders.forEach(order => {
    const item = menuItems.find(i => i.name === order.item);
    const price = item ? item.price : 0;
    const subtotal = price * order.quantity;
    total += subtotal;
    
    receiptContent += `${order.item} x${order.quantity} - ₱${subtotal.toFixed(2)}\\n`;
  });
  
  receiptContent += '\\n--- TOTAL ---\\n';
  receiptContent += `TOTAL AMOUNT: ₱${total.toFixed(2)}\\n`;
  receiptContent += '\\nThank you for your business!\\n';
  receiptContent += '=========================';

  // Log to console and show notification
  console.log(receiptContent);
  showNotification('Receipt generated successfully! Check console for details.');
  
  // You could also create a modal to display the receipt or trigger a print dialog
  alert(receiptContent.replace(/\\n/g, '\\n'));
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
// Fetch Transactions from Database (placeholder)
// ==========================
async function fetchTransactionsFromDB() {
  try {
    console.log('Fetching transactions from database...');
    
    // Mock transactions for demonstration
    orders = [
      { id: 1001, item: 'Chicken Adobo', quantity: 2, status: 'Served' },
      { id: 1002, item: 'Pork Sinigang', quantity: 1, status: 'Served' },
      { id: 1003, item: 'Iced Tea', quantity: 3, status: 'Pending' },
      { id: 1004, item: 'Milk Tea', quantity: 1, status: 'Served' }
    ];
    
    // Mock menu items for price calculation
    menuItems = [
      { name: 'Chicken Adobo', price: 120.00 },
      { name: 'Pork Sinigang', price: 150.00 },
      { name: 'Iced Tea', price: 35.00 },
      { name: 'Milk Tea', price: 45.00 }
    ];
    
    renderTransactions();
    showTransactions();
    return true;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return false;
  }
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  await fetchTransactionsFromDB();
  renderTransactions();
  showTransactions();
});