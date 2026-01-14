// ==========================
// Transactions Module (Cashier)
// ==========================

// Global variables for transactions data
let transactionsData = [];
let filteredTransactions = [];

const statusColors = {
  Pending: 'pending',
  Approved: 'approved',
  Served: 'served',
  Canceled: 'canceled'
};

// ==========================
// Utility Helpers
// ==========================

function transactionTotal(transaction) {
  return parseFloat(transaction.total_amount) || 0;
}

function transactionItemCount(transaction) {
  return parseInt(transaction.total_item_count) || 0;
}

function formatCurrency(value) {
  return `₱${Number(value || 0).toFixed(2)}`;
}

function formatDisplayDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ==========================
// Core Transactions Rendering
// ==========================

async function fetchTransactionsFromDB() {
  try {
    console.log('🔄 Fetching all transactions...');

    // Fetch ALL transactions (Served orders from all cashiers)
    const res = await fetch('/TESDAPOS/admin/fetch_orders.php?status=Served', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('📦 Received data:', data);

    if (data.success && data.orders) {
      transactionsData = data.orders;
      filteredTransactions = [...transactionsData];
      console.log(`✅ Loaded ${transactionsData.length} transactions from all cashiers`);

      // Log sample transaction to see structure
      if (transactionsData.length > 0) {
        console.log('📋 Sample transaction:', transactionsData[0]);
      }

      renderTransactions();
      return true;
    }
    throw new Error(data.message || 'Failed to fetch orders');
  } catch (e) {
    console.error('❌ Error fetching transactions:', e);
    transactionsData = [];
    filteredTransactions = [];
    renderTransactions();
    return false;
  }
}

function renderTransactions() {
  const tbody = document.getElementById('transactionsList');
  if (!tbody) {
    console.warn('⚠️ transactionsList tbody not found');
    return;
  }

  tbody.innerHTML = '';
  const transactionsToRender = filteredTransactions.length > 0 ? filteredTransactions : transactionsData;

  console.log('🎨 Rendering transactions:', transactionsToRender.length);

  if (!transactionsToRender.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2rem; color: #666;">
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No transactions found. Completed orders will appear here.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Sort transactions by order_id in ascending order (lowest number first)
  const sortedTransactions = [...transactionsToRender].sort((a, b) => {
    const idA = parseInt((a.order_id || a.id || '0').toString().replace(/\D/g, '')) || 0;
    const idB = parseInt((b.order_id || b.id || '0').toString().replace(/\D/g, '')) || 0;
    return idA - idB;
  });

  sortedTransactions.forEach((transaction) => {
    const total = transactionTotal(transaction);
    const itemCount = transactionItemCount(transaction);

    // Get product names for display
    let itemsLabel = 'No Items';
    if (transaction.product_names && transaction.product_names.length > 0) {
      const firstName = transaction.product_names[0];
      itemsLabel = transaction.product_names.length > 1
        ? `${firstName} +${transaction.product_names.length - 1} more`
        : firstName;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${transaction.order_id || transaction.id}</strong></td>
      <td>${transaction.transaction_id || 'N/A'}</td>
      <td>${formatDisplayDate(transaction.created_at || transaction.date)}</td>
      <td>${transaction.served_by || 'N/A'}</td>
      <td>${itemsLabel}</td>
      <td>${itemCount}</td>
      <td>${transaction.payment_method || 'N/A'}</td>
      <td><strong>${formatCurrency(total)}</strong></td>
      <td><span class="status ${statusColors[transaction.status] || 'pending'}">${transaction.status || 'Pending'}</span></td>
      <td>
        <button class="action-btn" onclick="generateTransactionReport('${transaction.order_id || transaction.id}')" title="Generate Report">
          <i class="fas fa-file-export"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================
// Individual Transaction Report Function
// ==========================

function generateTransactionReport(orderId) {
  const transaction = transactionsData.find((txn) =>
    (txn.order_id && txn.order_id === orderId) ||
    (txn.id && txn.id === orderId)
  );

  if (!transaction) {
    showNotification('Transaction not found', 'error');
    return;
  }

  // Create a modal using the Order.css confirmation modal structure
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'transactionReportModal';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-icon report-icon">
        <i class="fas fa-file-export"></i>
      </div>
      <h3 class="modal-title">Generate Transaction Report</h3>
      <p class="modal-message">Choose the format for Order #${orderId} report:</p>
      <div class="modal-actions">
        <button class="modal-btn modal-print" onclick="printTransactionReport('${orderId}'); closeTransactionModal();">
          <i class="fas fa-print"></i> Print Receipt
        </button>
        <button class="modal-btn modal-export" onclick="exportTransactionToCSV('${orderId}'); closeTransactionModal();">
          <i class="fas fa-file-csv"></i> Export to CSV
        </button>
        <button class="modal-btn modal-close" onclick="closeTransactionModal();">
          <i class="fas fa-times"></i> Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Trigger animation
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeTransactionModal();
    }
  });

  // Function to close modal (added to global scope)
  window.closeTransactionModal = function () {
    modal.classList.remove('active');
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
      delete window.closeTransactionModal;
    }, 300);
  };
}

function printTransactionReport(orderId) {
  const transaction = transactionsData.find((txn) =>
    (txn.order_id && txn.order_id === orderId) ||
    (txn.id && txn.id === orderId)
  );

  if (!transaction) {
    showNotification('Transaction not found', 'error');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=720,height=900');
  if (!printWindow) {
    showNotification('Pop-up blocked. Please allow pop-ups to print.', 'error');
    return;
  }

  const items = transaction.items || [];
  const itemsRows = items.map(item => `
    <tr>
      <td>${item.name || item.product_name || 'Unknown Item'}</td>
      <td style="text-align:right;">${item.quantity || 1}</td>
      <td style="text-align:right;">${formatCurrency(item.price || 0)}</td>
      <td style="text-align:right;">${formatCurrency((item.price || 0) * (item.quantity || 1))}</td>
    </tr>
  `).join('');

  const total = transactionTotal(transaction);
  const itemCount = transactionItemCount(transaction);

  // Calculate VAT (1%)
  const subtotal = total / 1.01;
  const vat = total - subtotal;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Transaction Report #${orderId} - TESDA POS</title>
        <style>
          @media print {
            @page { margin: 1cm; }
            body { margin: 0; }
          }
          body {
            font-family: 'Inter', 'Arial', sans-serif;
            padding: 24px;
            color: #1f2937;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #004aad;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #004aad;
            margin: 0 0 10px 0;
            font-size: 2rem;
          }
          .header h2 {
            color: #333;
            margin: 0;
            font-size: 1.2rem;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
          }
          .info-label {
            font-weight: 600;
            color: #666;
          }
          .info-value {
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 12px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background: #004aad;
            color: white;
            font-weight: 600;
          }
          .totals {
            margin-top: 20px;
            text-align: right;
            font-size: 1.1rem;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 0.85rem;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/TESDAPOS/img/TESDALOGO.png" alt="TESDA Logo" style="width: 80px; height: 80px; margin-bottom: 10px;">
          <h1>TESDA POS SYSTEM</h1>
          <h2>Transaction Report</h2>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Order ID:</span>
            <span class="info-value">#${orderId}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Transaction ID:</span>
            <span class="info-value">${transaction.transaction_id || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date:</span>
            <span class="info-value">${formatDisplayDate(transaction.created_at || transaction.date)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Cashier:</span>
            <span class="info-value">${transaction.served_by || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${transaction.payment_method || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="info-value">${transaction.status || 'Pending'}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:right;">Quantity</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals">
          <div>Total Items: ${itemCount}</div>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
            <div style="font-weight: normal; font-size: 0.95rem;">Subtotal: ${formatCurrency(subtotal)}</div>
            <div style="font-weight: normal; font-size: 0.95rem;">VAT (1%): ${formatCurrency(vat)}</div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 2px solid #333; font-size: 1.2rem;">Total Amount: ${formatCurrency(total)}</div>
          </div>
        </div>

        <div class="footer">
          <p>© 2025 TESDA POS System</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

function exportTransactionToCSV(orderId) {
  const transaction = transactionsData.find((txn) =>
    (txn.order_id && txn.order_id === orderId) ||
    (txn.id && txn.id === orderId)
  );

  if (!transaction) {
    showNotification('Transaction not found', 'error');
    return;
  }

  const items = transaction.items || [];
  const headers = ['Order ID', 'Transaction ID', 'Date', 'Cashier', 'Payment Method', 'Status', 'Item Name', 'Quantity', 'Price', 'Subtotal'];

  // Ensure payment method shows full value
  const paymentMethod = transaction.payment_method || 'Cash';
  const fullPaymentMethod = paymentMethod.length > 15 ? paymentMethod : paymentMethod;

  const csvRows = items.map(item => [
    orderId,
    transaction.transaction_id || 'N/A',
    transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : (transaction.date || ''),
    transaction.served_by || 'N/A',
    fullPaymentMethod,
    transaction.status || 'Pending',
    item.name || item.product_name || 'Unknown Item',
    item.quantity || 1,
    item.price || 0,
    (item.price || 0) * (item.quantity || 1)
  ]);

  // Add summary row at the end
  csvRows.push([
    orderId,
    transaction.transaction_id || 'N/A',
    transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : (transaction.date || ''),
    transaction.served_by || 'N/A',
    fullPaymentMethod,
    transaction.status || 'Pending',
    'TOTAL',
    transactionItemCount(transaction).toString(),
    '',
    transactionTotal(transaction)
  ]);

  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `transaction_${orderId}_report.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showNotification(`Transaction #${orderId} exported to CSV`, 'success');
}

// ==========================
// Main Report Generation Function
// ==========================

function generateReport() {
  const transactionsToExport = filteredTransactions.length > 0 ? filteredTransactions : transactionsData;

  if (!transactionsToExport.length) {
    showNotification('No transactions to generate report', 'error');
    return;
  }

  // Create a modal using the Order.css confirmation modal structure
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'mainReportModal';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-icon report-icon">
        <i class="fas fa-file-export"></i>
      </div>
      <h3 class="modal-title">Generate Report</h3>
      <p class="modal-message">Choose the format for your sales report:</p>
      <div class="modal-actions">
        <button class="modal-btn modal-print" onclick="printSalesReport(); closeReportModal();">
          <i class="fas fa-print"></i> Print Report
        </button>
        <button class="modal-btn modal-export" onclick="exportToCSV(); closeReportModal();">
          <i class="fas fa-file-csv"></i> Export to CSV
        </button>
        <button class="modal-btn modal-close" onclick="closeReportModal();">
          <i class="fas fa-times"></i> Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Trigger animation
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeReportModal();
    }
  });

  // Function to close modal (added to global scope)
  window.closeReportModal = function () {
    modal.classList.remove('active');
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
      delete window.closeReportModal;
    }, 300);
  };
}

// ==========================
// Print Sales Report Function
// ==========================

function printSalesReport() {
  const transactionsToPrint = filteredTransactions.length > 0 ? filteredTransactions : transactionsData;

  if (!transactionsToPrint.length) {
    showNotification('No transactions to print', 'error');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) {
    showNotification('Pop-up blocked. Please allow pop-ups to print.', 'error');
    return;
  }

  // Calculate summary
  const totalSales = transactionsToPrint.reduce((sum, txn) => sum + transactionTotal(txn), 0);
  const transactionCount = transactionsToPrint.length;
  const totalItems = transactionsToPrint.reduce((sum, txn) => sum + transactionItemCount(txn), 0);
  const averageOrder = transactionCount > 0 ? totalSales / transactionCount : 0;

  // Generate table rows
  const tableRows = transactionsToPrint.map(txn => {
    const items = txn.items ? txn.items.map(item => `${item.name} (${item.quantity}x)`).join(', ') : 'No items';
    const total = transactionTotal(txn);
    const itemCount = transactionItemCount(txn);

    return `
      <tr>
        <td>#${txn.order_id || txn.id}</td>
        <td>${formatDisplayDate(txn.created_at || txn.date)}</td>
        <td>${txn.served_by || 'N/A'}</td>
        <td>${items}</td>
        <td style="text-align:center;">${itemCount}</td>
        <td>${txn.payment_method || 'N/A'}</td>
        <td style="text-align:right;">${formatCurrency(total)}</td>
        <td>${txn.status || 'Pending'}</td>
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sales Report - TESDA POS</title>
        <style>
          @media print {
            @page { margin: 1cm; }
            body { margin: 0; }
          }
          body {
            font-family: 'Inter', 'Arial', sans-serif;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #004aad;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #004aad;
            margin: 0 0 10px 0;
            font-size: 2rem;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #004aad;
          }
          .summary-card h3 {
            margin: 0 0 8px 0;
            font-size: 0.9rem;
            color: #666;
            font-weight: 600;
          }
          .summary-card p {
            margin: 0;
            font-size: 1.5rem;
            font-weight: bold;
            color: #004aad;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 0.9rem;
          }
          th {
            background: #004aad;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #003d8f;
          }
          td {
            padding: 10px 12px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 0.85rem;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/TESDAPOS/img/TESDALOGO.png" alt="TESDA Logo" style="width: 80px; height: 80px; margin-bottom: 10px;">
          <h1>TESDA POS SYSTEM</h1>
          <h2>Sales Report</h2>
          <p>Generated on: ${new Date().toLocaleString('en-PH')}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>Total Sales</h3>
            <p>${formatCurrency(totalSales)}</p>
          </div>
          <div class="summary-card">
            <h3>Transactions</h3>
            <p>${transactionCount}</p>
          </div>
          <div class="summary-card">
            <h3>Items Sold</h3>
            <p>${totalItems}</p>
          </div>
          <div class="summary-card">
            <h3>Average Order</h3>
            <p>${formatCurrency(averageOrder)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Cashier</th>
              <th>Items</th>
              <th>Quantity</th>
              <th>Payment Method</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
          <tfoot>
            <tr style="background: #f0f0f0; font-weight: bold;">
              <td colspan="6" style="text-align: right; padding: 15px;">TOTAL:</td>
              <td style="text-align: right; padding: 15px;">${formatCurrency(totalSales)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          <p>© 2025 TESDA POS System</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

// ==========================
// CSV Export Function
// ==========================

function exportToCSV() {
  const transactionsToExport = filteredTransactions.length > 0 ? filteredTransactions : transactionsData;

  if (!transactionsToExport.length) {
    showNotification('No transactions to export', 'error');
    return;
  }

  // CSV Headers
  const headers = ['Order ID', 'Date', 'Cashier', 'Payment Method', 'Status', 'Items', 'Quantity', 'Total Amount'];

  // Convert transactions to CSV rows
  const csvRows = transactionsToExport.map(transaction => {
    const items = transaction.items || [];
    const itemsCount = transaction.total_item_count || items.length;
    const itemsDetails = items.map(item =>
      `${item.name || item.product_name} (${item.quantity}x @ ₱${item.price})`
    ).join('; ');

    // Ensure payment method shows full value
    const paymentMethod = transaction.payment_method || 'Cash';
    const fullPaymentMethod = paymentMethod.length > 15 ? paymentMethod : paymentMethod;

    return [
      transaction.order_id || transaction.id || '',
      transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : (transaction.date || ''),
      transaction.served_by || '',
      fullPaymentMethod,
      transaction.status || 'Pending',
      `"${itemsDetails}"`, // Items details wrapped in quotes
      itemsCount.toString(),
      transaction.total_amount || '0.00'
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for UTF-8 support in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `sales_report_${timestamp}.csv`;

  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showNotification(`Exported ${transactionsToExport.length} transaction(s) to CSV`, 'success');
}

// ==========================
// Notification Toast
// ==========================

function showNotification(message, type = 'success') {
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
  if (toastMessage) {
    toastMessage.textContent = message;
  }

  if (type === 'error') {
    toast.style.background = '#dc3545';
  } else {
    toast.style.background = '#28a745';
  }

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  await fetchTransactionsFromDB();
  renderTransactions();
});
