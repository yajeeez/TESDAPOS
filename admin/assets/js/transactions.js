// ==========================
// Transactions & Sales Report Module
// ==========================

// Global variables for transactions data
let transactionsData = [];
let orders = [];
let filteredTransactions = [];
let salesTrendChart = null;
let allCashiers = [];

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

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================
// Expose compact metrics for dashboard
// ==========================
function getDashboardOrderMetrics() {
  const transactionsToUse = filteredTransactions.length > 0 ? filteredTransactions : transactionsData;

  const totalSales = transactionsToUse.reduce((sum, txn) => sum + transactionTotal(txn), 0);

  const today = new Date();
  const todayKey = formatInputDate(today);
  const ordersToday = transactionsToUse.filter(txn => txn.date === todayKey).length;

  return {
    totalSales,
    ordersToday
  };
}

function formatMonthLabel(key) {
  const [year, month] = key.split('-');
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
}

// ==========================
// Core Transactions Rendering
// ==========================

function initializeTransactionsData() {
  orders = transactionsData.map((transaction) => {
    const totalItems = transactionItemCount(transaction);
    const firstItem = transaction.items[0]?.name || 'No Items';
    const label = transaction.items.length > 1
      ? `${firstItem} +${transaction.items.length - 1}`
      : firstItem;

    return {
      id: transaction.id,
      item: label,
      quantity: totalItems,
      status: transaction.status
    };
  });
}

function renderTransactions() {
  const tbody = document.getElementById('transactionsList');
  if (!tbody) return;

  tbody.innerHTML = '';

  const transactionsToRender = filteredTransactions.length > 0 ? filteredTransactions : transactionsData;

  if (!transactionsToRender.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: #666;">
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No transactions found. Completed orders will appear here.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  transactionsToRender.forEach((transaction) => {
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

async function updateOrderStatus(orderId, newStatus) {
  if (!newStatus) return;

  try {
    // Update status in database
    const response = await fetch('/TESDAPOS/admin/update_order_status.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        status: newStatus
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Update local data
      const transaction = transactionsData.find((txn) => 
        (txn.order_id && txn.order_id === orderId) || 
        (txn.id && txn.id === orderId)
      );
      
      if (transaction) {
        transaction.status = newStatus;
      }

      // Re-apply filters if active
      if (filteredTransactions.length > 0) {
        applyFilters();
      } else {
        renderTransactions();
      }
      
      updateSummaryCards();
      showNotification(`Transaction #${orderId} status updated to ${newStatus}`);
    } else {
      showNotification(`Failed to update status: ${result.message}`, 'error');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    showNotification('Failed to update status. Please try again.', 'error');
  }
}

function updateSummaryCards() {
  const transactionsToUse = filteredTransactions.length > 0 ? filteredTransactions : transactionsData;
  
  const totalSales = transactionsToUse.reduce((sum, txn) => sum + transactionTotal(txn), 0);
  const transactionCount = transactionsToUse.length;
  const totalItems = transactionsToUse.reduce((sum, txn) => sum + transactionItemCount(txn), 0);
  const averageOrder = transactionCount > 0 ? totalSales / transactionCount : 0;

  const totalSalesEl = document.getElementById('summaryTotalSales');
  const transactionsCountEl = document.getElementById('summaryTransactionsCount');
  const itemsSoldEl = document.getElementById('summaryItemsSold');
  const averageOrderEl = document.getElementById('summaryAverageOrder');

  if (totalSalesEl) totalSalesEl.textContent = formatCurrency(totalSales);
  if (transactionsCountEl) transactionsCountEl.textContent = transactionCount.toString();
  if (itemsSoldEl) itemsSoldEl.textContent = totalItems.toString();
  if (averageOrderEl) averageOrderEl.textContent = formatCurrency(averageOrder);
}

// generateReceipt function removed - use printSalesReport() for full report
// or implement individual order printing if needed

// ==========================
// Sales Report Controls
// ==========================

function populateCashierFilter() {
  const cashierSelect = document.getElementById('filterCashier');
  if (!cashierSelect) return;

  // Check if dropdown already has cashier options (more than just "All Cashiers")
  if (cashierSelect.options.length > 1) {
    console.log('🔄 Cashier dropdown already populated, skipping transactions.js override');
    return;
  }

  const currentValue = cashierSelect.value;
  cashierSelect.innerHTML = '<option value="">All Cashiers</option>';

  // Use the fetched cashiers array
  const cashiersToUse = allCashiers.length > 0 ? allCashiers : [];
  
  cashiersToUse.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    cashierSelect.appendChild(option);
  });

  if (currentValue) {
    cashierSelect.value = currentValue;
  }
}

function initializeDateFilters() {
  const startInput = document.getElementById('filterStartDate');
  const endInput = document.getElementById('filterEndDate');
  if (!startInput || !endInput || !transactionsData.length) return;

  const timestamps = transactionsData.map((txn) => {
    const date = new Date(txn.created_at || txn.date);
    return date.getTime();
  }).filter(ts => !isNaN(ts));
  
  if (timestamps.length === 0) return;
  
  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));

  startInput.value = formatInputDate(minDate);
  endInput.value = formatInputDate(maxDate);
}

function applyFilters() {
  const startInput = document.getElementById('filterStartDate');
  const endInput = document.getElementById('filterEndDate');
  const cashierSelect = document.getElementById('filterCashier');
  const statusSelect = document.getElementById('filterStatus');
  const paymentSelect = document.getElementById('filterPaymentMethod');

  // Handle single date input (for dashboard) or date range (for transactions page)
  let startDate = null;
  let endDate = null;
  
  if (startInput?.value) {
    startDate = new Date(startInput.value + 'T00:00:00');
    // If there's no end date input (dashboard), use the same date for end
    if (!endInput) {
      endDate = new Date(startInput.value + 'T23:59:59');
    }
  }
  
  if (endInput?.value) {
    endDate = new Date(endInput.value + 'T23:59:59');
  }
  
  const cashier = cashierSelect?.value || '';
  const status = statusSelect?.value || '';
  const paymentMethod = paymentSelect?.value || '';

  console.log('🔍 Applying filters:', {
    startDate: startDate ? startDate.toISOString() : 'none',
    endDate: endDate ? endDate.toISOString() : 'none',
    cashier: cashier || 'all',
    status: status || 'all',
    paymentMethod: paymentMethod || 'all'
  });

  filteredTransactions = transactionsData.filter((txn) => {
    // Use created_at or date field
    const txnDateString = txn.created_at || txn.date;
    if (!txnDateString) return false;
    
    const txnDate = new Date(txnDateString);
    if (isNaN(txnDate.getTime())) return false;
    
    // Date filter - if both dates are set, filter by range
    if (startDate && txnDate < startDate) return false;
    if (endDate && txnDate > endDate) return false;
    
    // Cashier filter - match by served_by (full name)
    if (cashier && txn.served_by !== cashier) {
      console.log('❌ Filtered out by cashier:', txn.served_by, '!==', cashier);
      return false;
    }
    
    // Status filter
    if (status && txn.status !== status) return false;
    
    // Payment method filter - handle both "Cashless" and "Credit or Debit Card"
    if (paymentMethod) {
      const txnPayment = txn.payment_method || 'Cash';
      if (paymentMethod === 'Cashless' || paymentMethod === 'Credit or Debit Card') {
        // Match card payments
        if (txnPayment !== 'card' && txnPayment !== 'Card' && txnPayment !== 'Credit or Debit Card' && txnPayment !== 'Cashless') {
          return false;
        }
      } else if (paymentMethod === 'Cash') {
        // Match cash payments
        if (txnPayment !== 'Cash' && txnPayment !== 'cash') {
          return false;
        }
      } else {
        // Exact match for other payment methods
        if (txnPayment !== paymentMethod) {
          return false;
        }
      }
    }
    
    return true;
  });

  console.log('✅ Filtered transactions:', filteredTransactions.length, 'out of', transactionsData.length);

  // Show notification if no results found
  if (filteredTransactions.length === 0 && transactionsData.length > 0) {
    console.log('ℹ️ No transactions match the current filters. Showing empty state.');
    
    // Show a toast notification on dashboard
    if (typeof showDashboardNotification === 'function') {
      const filterDesc = [];
      if (startDate) filterDesc.push(`date: ${startInput.value}`);
      if (cashier) filterDesc.push(`cashier: ${cashier}`);
      if (status) filterDesc.push(`status: ${status}`);
      if (paymentMethod) filterDesc.push(`payment: ${paymentMethod}`);
      
      showDashboardNotification(`No transactions found for ${filterDesc.join(', ')}`, 'info');
    }
  }

  renderTransactions();
  updateSummaryCards();
}

function resetFilters() {
  const startInput = document.getElementById('filterStartDate');
  const endInput = document.getElementById('filterEndDate');
  const cashierSelect = document.getElementById('filterCashier');
  const statusSelect = document.getElementById('filterStatus');
  const paymentSelect = document.getElementById('filterPaymentMethod');

  // Reset date filters to show all data
  if (transactionsData.length > 0) {
    const timestamps = transactionsData.map((txn) => {
      const date = new Date(txn.created_at || txn.date);
      return date.getTime();
    }).filter(ts => !isNaN(ts));
    
    if (timestamps.length > 0) {
      const minDate = new Date(Math.min(...timestamps));
      const maxDate = new Date(Math.max(...timestamps));
      
      if (startInput) startInput.value = formatInputDate(minDate);
      if (endInput) endInput.value = formatInputDate(maxDate);
    }
  } else {
    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';
  }

  if (cashierSelect) cashierSelect.value = '';
  if (statusSelect) statusSelect.value = '';
  if (paymentSelect) paymentSelect.value = '';

  filteredTransactions = [...transactionsData];
  renderTransactions();
  updateSummaryCards();
  showNotification('Filters reset', 'success');
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
      fullPaymentMethod, // Use the full payment method value
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
  
  // Generate filename with date range
  const startDate = document.getElementById('filterStartDate')?.value || 'all';
  const endDate = document.getElementById('filterEndDate')?.value || 'all';
  const filename = `sales_report_${startDate}_to_${endDate}.csv`;
  
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification(`Exported ${transactionsToExport.length} transaction(s) to CSV`, 'success');
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

  // Get filter info
  const startDate = document.getElementById('filterStartDate')?.value || 'All';
  const endDate = document.getElementById('filterEndDate')?.value || 'All';
  const cashier = document.getElementById('filterCashier')?.value || 'All';
  const status = document.getElementById('filterStatus')?.value || 'All';
  const paymentMethod = document.getElementById('filterPaymentMethod')?.value || 'All';

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
          .filters {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.9rem;
          }
          .filters h3 {
            margin: 0 0 10px 0;
            color: #004aad;
            font-size: 1rem;
          }
          .filters-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .filters-grid div {
            display: flex;
            gap: 10px;
          }
          .filters-grid strong {
            min-width: 120px;
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
          <h1>TESDA POS</h1>
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

        <div class="filters">
          <h3>Filter Criteria</h3>
          <div class="filters-grid">
            <div><strong>Date Range:</strong> ${startDate} to ${endDate}</div>
            <div><strong>Cashier:</strong> ${cashier}</div>
            <div><strong>Status:</strong> ${status}</div>
            <div><strong>Payment Method:</strong> ${paymentMethod}</div>
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
          <p>This is a computer-generated report from TESDA POS System</p>
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

// Removed updateSalesReport - functionality moved to updateSummaryCards and renderTransactions

function populateOrderSelect(transactions) {
  const orderSelect = document.getElementById('reportOrderSelect');
  if (!orderSelect) return;

  const currentValue = orderSelect.value;
  orderSelect.innerHTML = '<option value="">Select Order</option>';

  transactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((txn) => {
      const option = document.createElement('option');
      option.value = txn.id;
      option.textContent = `${txn.id} — ${formatDisplayDate(txn.date)}`;
      orderSelect.appendChild(option);
    });

  if (currentValue && transactions.some((txn) => txn.id.toString() === currentValue)) {
    orderSelect.value = currentValue;
  }
}

function clearOrderDetails() {
  const card = document.getElementById('orderDetailsCard');
  const tbody = document.getElementById('orderItemsBody');
  if (card) card.hidden = true;
  if (tbody) tbody.innerHTML = '';
}

function displayOrderDetails(orderId) {
  const card = document.getElementById('orderDetailsCard');
  const tbody = document.getElementById('orderItemsBody');
  if (!card || !tbody) return;

  if (!orderId) {
    clearOrderDetails();
    return;
  }

  const transaction = transactionsData.find((txn) => txn.id.toString() === orderId.toString());
  if (!transaction) {
    clearOrderDetails();
    showNotification('Order details not found.', 'error');
    return;
  }

  const title = document.getElementById('orderDetailsTitle');
  const meta = document.getElementById('orderMeta');
  const cashierEl = document.getElementById('orderCashier');
  const paymentEl = document.getElementById('orderPaymentMethod');
  const itemsEl = document.getElementById('orderTotalItems');
  const amountEl = document.getElementById('orderTotalAmount');

  if (title) title.textContent = `Order #${transaction.id}`;
  if (meta) meta.textContent = `${formatDisplayDate(transaction.date)} • ${transaction.items.length} item(s)`;
  if (cashierEl) cashierEl.textContent = transaction.cashier;
  if (paymentEl) paymentEl.textContent = transaction.paymentMethod;
  if (itemsEl) itemsEl.textContent = transactionItemCount(transaction).toString();
  if (amountEl) amountEl.textContent = formatCurrency(transactionTotal(transaction));

  renderOrderItems(transaction);
  card.hidden = false;
}

function renderOrderItems(transaction) {
  const tbody = document.getElementById('orderItemsBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  transaction.items.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td style="text-align:right;">${item.quantity}</td>
      <td style="text-align:right;">${formatCurrency(item.price)}</td>
      <td style="text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDailySummary(transactions) {
  const tbody = document.querySelector('#dailySummaryTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!transactions.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" style="text-align:center; color:#64748b;">No data for selected range.</td>';
    tbody.appendChild(tr);
    return;
  }

  const dailyMap = new Map();
  transactions.forEach((txn) => {
    const key = txn.date;
    if (!dailyMap.has(key)) {
      dailyMap.set(key, { transactions: 0, items: 0, total: 0 });
    }
    const summary = dailyMap.get(key);
    summary.transactions += 1;
    summary.items += transactionItemCount(txn);
    summary.total += transactionTotal(txn);
  });

  Array.from(dailyMap.entries())
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .forEach(([date, summary]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDisplayDate(date)}</td>
        <td>${summary.transactions}</td>
        <td>${summary.items}</td>
        <td>${formatCurrency(summary.total)}</td>
      `;
      tbody.appendChild(tr);
    });
}

function renderMonthlySummary(transactions) {
  const tbody = document.querySelector('#monthlySummaryTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!transactions.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" style="text-align:center; color:#64748b;">No data for selected range.</td>';
    tbody.appendChild(tr);
    return;
  }

  const monthlyMap = new Map();
  transactions.forEach((txn) => {
    const date = new Date(txn.date);
    const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { transactions: 0, items: 0, total: 0 });
    }
    const summary = monthlyMap.get(key);
    summary.transactions += 1;
    summary.items += transactionItemCount(txn);
    summary.total += transactionTotal(txn);
  });

  Array.from(monthlyMap.entries())
    .sort((a, b) => new Date(`${b[0]}-01`) - new Date(`${a[0]}-01`))
    .forEach(([monthKey, summary]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatMonthLabel(monthKey)}</td>
        <td>${summary.transactions}</td>
        <td>${summary.items}</td>
        <td>${formatCurrency(summary.total)}</td>
      `;
      tbody.appendChild(tr);
    });
}

function updateSalesTrendChart(transactions) {
  const canvas = document.getElementById('salesTrendChart');
  if (!canvas) return;

  const dailyMap = new Map();
  transactions.forEach((txn) => {
    const key = txn.date;
    dailyMap.set(key, (dailyMap.get(key) || 0) + transactionTotal(txn));
  });

  const sortedEntries = Array.from(dailyMap.entries()).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  const labels = sortedEntries.map(([date]) => formatDisplayDate(date));
  const values = sortedEntries.map(([, total]) => Number(total.toFixed(2)));

  if (salesTrendChart) {
    salesTrendChart.destroy();
  }

  if (!labels.length) {
    salesTrendChart = null;
    return;
  }

  salesTrendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Sales',
          data: values,
          borderColor: 'rgba(0, 74, 173, 1)',
          backgroundColor: 'rgba(0, 74, 173, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#004aad'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `₱${value}`
          }
        }
      }
    }
  });
}

function printSelectedOrder() {
  const orderSelect = document.getElementById('reportOrderSelect');
  if (!orderSelect || !orderSelect.value) {
    showNotification('Please select an order to print.', 'error');
    return;
  }

  const transaction = transactionsData.find((txn) => txn.id.toString() === orderSelect.value);
  if (!transaction) {
    showNotification('Selected order not found.', 'error');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=720,height=900');
  if (!printWindow) {
    showNotification('Pop-up blocked. Please allow pop-ups to print.', 'error');
    return;
  }

  const itemsRows = transaction.items
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:right;">${item.quantity}</td>
          <td style="text-align:right;">${formatCurrency(item.price)}</td>
          <td style="text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `
    )
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Order #${transaction.id} Receipt</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 24px; color: #1f2937; }
          h1 { text-align: center; margin-bottom: 12px; }
          h2 { margin-top: 0; }
          .meta { margin-bottom: 16px; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { padding: 8px 10px; border: 1px solid #cbd5f5; }
          th { background: #004aad; color: #fff; }
          .totals { margin-top: 16px; text-align: right; font-size: 1.1rem; }
        </style>
      </head>
      <body>
        <h1>TESDA POS</h1>
        <h2>Order #${transaction.id}</h2>
        <div class="meta">
          <div>Date: ${formatDisplayDate(transaction.date)}</div>
          <div>Cashier: ${transaction.cashier}</div>
          <div>Payment Method: ${transaction.paymentMethod}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="totals">Total: <strong>${formatCurrency(transactionTotal(transaction))}</strong></div>
        <script>window.print(); window.onafterprint = () => window.close();<\/script>
      </body>
    </html>
  `);

  printWindow.document.close();
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
// Logout Handler (shared)
// ==========================

function logout(e) {
  if (e) e.preventDefault();
  window.location.href = '../../public/components/login.html';
}

// ==========================
// Initialization
// ==========================

function attachEventHandlers() {
  // Event handlers are attached via onclick in HTML
  // This function can be used for additional event listeners if needed
}

async function fetchTransactionsFromDB() {
  try {
    console.log('Fetching transactions from database...');
    
    // Fetch all orders from database
    const response = await fetch('/TESDAPOS/admin/fetch_filtered_orders.php', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.orders) {
      // Update global variables with database data
      transactionsData = data.orders;
      allCashiers = data.cashiers || [];
      
      // Initialize filtered transactions with all data
      filteredTransactions = [...transactionsData];
      
      // Initialize other components
      initializeTransactionsData();
      populateCashierFilter();
      initializeDateFilters();
      renderTransactions();
      updateSummaryCards();
      
      console.log(`Loaded ${transactionsData.length} transactions from database`);
      return true;
    } else {
      throw new Error(data.message || 'Failed to fetch orders');
    }
  } catch (error) {
    console.error('Error fetching transactions from database:', error);
    
    // Fallback to empty data
    transactionsData = [];
    filteredTransactions = [];
    allCashiers = [];
    
    // Show error notification
    showNotification('Failed to load transactions from database. Please refresh the page.', 'error');
    return false;
  }
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
  window.closeTransactionModal = function() {
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
          <h1>TESDA POS</h1>
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
          <div>Total Amount: ${formatCurrency(total)}</div>
        </div>

        <div class="footer">
          <p>This is a computer-generated report from TESDA POS System</p>
          <p>Generated on: ${new Date().toLocaleString('en-PH')}</p>
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
    fullPaymentMethod, // Use the full payment method value
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
    fullPaymentMethod, // Use the full payment method value
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
// Generate Report Function
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
  window.closeReportModal = function() {
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
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  // Check if we're on the transactions page or dashboard
  const isTransactionsPage = document.getElementById('transactionsList') !== null;
  const isDashboardPage = document.getElementById('salesReport') !== null;
  
  if (isTransactionsPage || isDashboardPage) {
    await fetchTransactionsFromDB();
    
    // Only render transactions table on transactions page
    if (isTransactionsPage) {
      renderTransactions();
    }
    
    // Update summary cards on dashboard
    if (isDashboardPage) {
      updateSummaryCards();
    }
    
    attachEventHandlers();
    console.log('Sales Report & Transactions module initialized');
  }
});

