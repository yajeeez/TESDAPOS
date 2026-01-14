// ==========================
// Admin Dashboard Core Functions
// ==========================

// ==========================
// Notification System
// ==========================
function showDashboardNotification(message, type = 'info') {
  // Create or get notification element
  let notification = document.getElementById('dashboardNotification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'dashboardNotification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      max-width: 400px;
      opacity: 0;
      transform: translateX(400px);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(notification);
  }
  
  // Set color based on type
  const colors = {
    info: { bg: '#3498db', text: '#fff' },
    success: { bg: '#27ae60', text: '#fff' },
    warning: { bg: '#f39c12', text: '#fff' },
    error: { bg: '#e74c3c', text: '#fff' }
  };
  
  const color = colors[type] || colors.info;
  notification.style.backgroundColor = color.bg;
  notification.style.color = color.text;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-${type === 'info' ? 'info-circle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Show notification
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Hide after 4 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
  }, 4000);
}

// ==========================
// Logout function is now in logout-modal.js
// ==========================

// ==========================
// Charts (Chart.js) & Metrics
// ==========================
let barChart, pieChart;
let chartsInitialized = false; // Flag to prevent multiple initializations
let dashboardMetrics = {
  totalSales: 0,
  ordersToday: 0,
  totalProducts: 0,
  lowStockItems: 0
};

// Status and Payment Method Distributions
let statusDistribution = {
  Pending: 0,
  Approved: 0,
  Served: 0,
  Canceled: 0
};

let paymentMethodDistribution = {
  Cash: 0,
  "Credit or Debit Card": 0
};

// ==========================
// Calculate All Dashboard Metrics from Database
// For dashboard cards, always use ALL data regardless of filters
// ==========================
async function calculateAllMetrics(useFilters = false) {
  // Initialize metrics
  const metrics = {
    totalSales: 0,
    ordersToday: 0,
    totalProducts: dashboardMetrics.totalProducts || 0,
    lowStockItems: dashboardMetrics.lowStockItems || 0,
    statusDistribution: {
      Pending: 0,
      Approved: 0,
      Served: 0,
      Canceled: 0
    },
    paymentMethodDistribution: {
      Cash: 0,
      "Credit or Debit Card": 0
    }
  };

  // Fetch real order data from database
  try {
    // For dashboard cards, always use ALL transactions
    // For charts, use filtered transactions if useFilters is true
    let transactions = [];
    
    if (useFilters && typeof filteredTransactions !== 'undefined' && Array.isArray(filteredTransactions)) {
      // Use filteredTransactions for charts
      transactions = filteredTransactions;
      console.log('📊 Using filteredTransactions for charts:', transactions.length);
    } else if (typeof transactionsData !== 'undefined' && Array.isArray(transactionsData)) {
      // Use all transactions for dashboard cards
      transactions = transactionsData;
      console.log('📊 Using all transactionsData for dashboard cards:', transactions.length);
    } else {
      // Final fallback to database fetch
      const response = await fetch('/TESDAPOS/admin/fetch_filtered_orders.php');
      const data = await response.json();
      
      if (data.success && data.orders) {
        transactions = data.orders;
        console.log('📊 Fetched from database:', transactions.length);
      }
    }
    
    // Process transactions if any exist
    // If transactions is empty (cashier has no data), metrics will remain at 0
    if (transactions.length > 0) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
      
      console.log('📅 Today\'s date for filtering:', todayStr);
      
      transactions.forEach(transaction => {
        const status = transaction.status || 'Pending';
        
        // Calculate total sales - only count Served orders
        if (status === 'Served' && transaction.total_amount) {
          metrics.totalSales += parseFloat(transaction.total_amount) || 0;
        }

        // Count orders today - count ALL Served orders from today
        if (transaction.created_at) {
          const createdAtStr = String(transaction.created_at);
          
          // Check if created_at starts with today's date (handles both date strings and ISO timestamps)
          if (createdAtStr.startsWith(todayStr) && status === 'Served') {
            metrics.ordersToday++;
            console.log('✅ Order counted for today:', {
              order_id: transaction.order_id,
              created_at: createdAtStr,
              today: todayStr,
              status: status
            });
          } else if (status === 'Served') {
            console.log('❌ Order NOT from today:', {
              order_id: transaction.order_id,
              created_at: createdAtStr,
              today: todayStr,
              status: status
            });
          }
        }

        // Count by status
        if (metrics.statusDistribution.hasOwnProperty(status)) {
          metrics.statusDistribution[status]++;
        } else {
          metrics.statusDistribution.Pending++;
        }

        // Count by payment method - only count Served orders
        if (status === 'Served') {
          const paymentMethod = transaction.payment_method || 'Cash';
          if (paymentMethod === 'Cash' || paymentMethod === 'cash') {
            metrics.paymentMethodDistribution.Cash++;
          } else if (paymentMethod === 'card' || paymentMethod === 'Card' || paymentMethod === 'Credit or Debit Card') {
            metrics.paymentMethodDistribution["Credit or Debit Card"]++;
          } else {
            metrics.paymentMethodDistribution.Cash++;
          }
        }
      });
    } else {
      // No transactions found - cashier has no data or filters excluded everything
      console.log('ℹ️ No transactions found. All metrics will be 0.');
    }
  } catch (error) {
    console.error('Error fetching order data for charts:', error);
    // Fallback to dashboard metrics if database fetch fails
    metrics.totalSales = dashboardMetrics.totalSales || 0;
    metrics.ordersToday = dashboardMetrics.ordersToday || 0;
  }

  // Update global distributions
  statusDistribution = metrics.statusDistribution;
  paymentMethodDistribution = metrics.paymentMethodDistribution;
  
  console.log('📈 Final metrics:', {
    totalSales: metrics.totalSales,
    ordersToday: metrics.ordersToday,
    statusDistribution: metrics.statusDistribution,
    paymentMethodDistribution: metrics.paymentMethodDistribution
  });
  
  return metrics;
}

async function initCharts() {
  const barCanvas = document.getElementById('barChart');
  const pieCanvas = document.getElementById('pieChart');

  if (!barCanvas || !pieCanvas) {
    console.log('Chart canvases not found, skipping chart initialization');
    return;
  }

  // Always check and destroy existing charts before creating new ones
  // This prevents "Canvas is already in use" errors

  // Check for existing Chart.js instances on the canvas elements using Chart.getChart()
  // This is the proper way to detect if a chart is already registered on a canvas
  const existingBarChart = Chart.getChart('barChart');
  const existingPieChart = Chart.getChart('pieChart');

  // Destroy any existing charts found via Chart.getChart()
  if (existingBarChart) {
    try {
      existingBarChart.destroy();
      console.log('Destroyed existing barChart instance found on canvas');
    } catch (e) {
      console.warn('Failed to destroy existing barChart instance:', e);
    }
  }

  if (existingPieChart) {
    try {
      existingPieChart.destroy();
      console.log('Destroyed existing pieChart instance found on canvas');
    } catch (e) {
      console.warn('Failed to destroy existing pieChart instance:', e);
    }
  }

  // Also destroy our stored instances if they exist (as a safety measure)
  if (barChart) {
    try {
      barChart.destroy();
    } catch (e) {
      console.warn('Failed to destroy stored barChart instance:', e);
    }
    barChart = null;
  }
  if (pieChart) {
    try {
      pieChart.destroy();
    } catch (e) {
      console.warn('Failed to destroy stored pieChart instance:', e);
    }
    pieChart = null;
  }

  // Get fresh context after destroying existing charts
  const barCtx = barCanvas.getContext('2d');
  const pieCtx = pieCanvas.getContext('2d');

  // Get all metrics including status and payment distributions from database
  const allMetrics = await calculateAllMetrics();
  
  // Check active filters
  const statusFilter = document.getElementById('filterStatus')?.value || '';
  const paymentFilter = document.getElementById('filterPaymentMethod')?.value || '';
  
  // Prepare dynamic chart data based on filters
  let barLabels = [];
  let barData = [];
  let barColors = [];
  
  // Always include base metrics
  barLabels.push('Total Sales (₱K)', 'Orders Today', 'Total Products', 'Low Stock Items');
  barData.push(
    allMetrics.totalSales / 1000, // Sales in thousands
    allMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems
  );
  barColors.push('#9b59b6', '#3498db', '#f39c12', '#e74c3c');
  
  // Add status-based data based on filter
  // Show Served and Canceled status
  if (paymentFilter === '' && (statusFilter === '' || statusFilter === 'Served')) {
    barLabels.push('Served Orders');
    barData.push(allMetrics.statusDistribution.Served);
    barColors.push('#3498db');
  }
  
  if (paymentFilter === '' && (statusFilter === '' || statusFilter === 'Canceled')) {
    barLabels.push('Canceled Orders');
    barData.push(allMetrics.statusDistribution.Canceled);
    barColors.push('#e74c3c');
  }
  
  // Add payment method-based data based on filter
  // Only show payment methods if no status filter is active
  if (statusFilter === '' && (paymentFilter === '' || paymentFilter === 'Cash')) {
    barLabels.push('Cash Payments');
    barData.push(allMetrics.paymentMethodDistribution.Cash);
    barColors.push('#27ae60');
  }
  
  if (statusFilter === '' && (paymentFilter === '' || paymentFilter === 'Cashless')) {
    barLabels.push('Card Payments');
    barData.push(allMetrics.paymentMethodDistribution["Credit or Debit Card"]);
    barColors.push('#f39c12');
  }

  // Bar Chart - All Metrics
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: barLabels,
      datasets: [{
        label: 'Dashboard Metrics',
        data: barData,
        backgroundColor: barColors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        title: {
          display: true,
          text: 'Dashboard Metrics Overview'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                // Format sales differently
                if (label.includes('Total Sales')) {
                  label += '₱' + (context.parsed.y * 1000).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                } else {
                  label += context.parsed.y;
                }
              }
              return label;
            }
          }
        }
      },
      scales: { 
        y: { 
          beginAtZero: true
        } 
      }
    }
  });

  // Prepare dynamic pie chart data based on filters
  let pieLabels = [];
  let pieData = [];
  let pieColors = [];
  
  // Always include base metrics
  pieLabels.push('Total Sales', 'Orders Today', 'Total Products', 'Low Stock Items');
  pieData.push(
    Math.min(allMetrics.totalSales / 100, 100), // Normalize sales
    allMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems
  );
  pieColors.push('#9b59b6', '#3498db', '#f39c12', '#e74c3c');
  
  // Add status-based data based on filter
  // Show Served and Canceled status
  if (paymentFilter === '' && (statusFilter === '' || statusFilter === 'Served')) {
    pieLabels.push('Served Orders');
    pieData.push(allMetrics.statusDistribution.Served);
    pieColors.push('#3498db');
  }
  
  if (paymentFilter === '' && (statusFilter === '' || statusFilter === 'Canceled')) {
    pieLabels.push('Canceled Orders');
    pieData.push(allMetrics.statusDistribution.Canceled);
    pieColors.push('#e74c3c');
  }
  
  // Add payment method-based data based on filter
  // Only show payment methods if no status filter is active
  if (statusFilter === '' && (paymentFilter === '' || paymentFilter === 'Cash')) {
    pieLabels.push('Cash Payments');
    pieData.push(allMetrics.paymentMethodDistribution.Cash);
    pieColors.push('#27ae60');
  }
  
  if (statusFilter === '' && (paymentFilter === '' || paymentFilter === 'Cashless')) {
    pieLabels.push('Card Payments');
    pieData.push(allMetrics.paymentMethodDistribution["Credit or Debit Card"]);
    pieColors.push('#f39c12');
  }

  // Pie Chart - All Metrics Distribution
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: pieLabels,
      datasets: [{
        data: pieData,
        backgroundColor: pieColors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          position: 'right',
          labels: {
            boxWidth: 15,
            padding: 10,
            font: {
              size: 11
            }
          }
        },
        title: {
          display: true,
          text: 'All Metrics Distribution'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                const value = context.parsed;
                if (label.includes('Total Sales')) {
                  label += '₱' + (value * 100).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                } else {
                  label += value;
                }
                // Add percentage (handle division by zero)
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                if (total > 0) {
                  const percentage = ((value / total) * 100).toFixed(1);
                  label += ' (' + percentage + '%)';
                } else {
                  label += ' (0%)';
                }
              }
              return label;
            }
          }
        }
      }
    }
  });
}

// ==========================
// Helper: format currency
// ==========================
function formatCurrencyDashboard(value) {
  const num = Number(value || 0);
  return `₱${num.toFixed(2)}`;
}

// ==========================
// Get Filtered Transactions (respects filter selections)
// ==========================
function getFilteredTransactions() {
  // Prefer filteredTransactions (from transactions.js) if it exists, otherwise use transactionsData
  // filteredTransactions may be empty array if filters exclude everything, which is valid
  let transactions = [];
  
  if (typeof filteredTransactions !== 'undefined' && Array.isArray(filteredTransactions)) {
    // Use filteredTransactions even if empty (means filters excluded everything)
    transactions = filteredTransactions;
  } else if (typeof transactionsData !== 'undefined' && Array.isArray(transactionsData)) {
    // Fallback to all transactions if filteredTransactions doesn't exist yet
    transactions = transactionsData;
  } else if (typeof orders !== 'undefined' && Array.isArray(orders)) {
    transactions = orders;
  }
  
  return transactions;
}

// ==========================
// Calculate Status Distribution from Transactions
// ==========================
function calculateStatusDistribution() {
  // Since calculateAllMetrics is async, we need to handle this differently
  // For now, return the global statusDistribution that gets updated by calculateAllMetrics
  return statusDistribution;
}

// ==========================
// Calculate Payment Method Distribution from Transactions
// ==========================
function calculatePaymentMethodDistribution() {
  // Since calculateAllMetrics is async, we need to handle this differently
  // For now, return the global paymentMethodDistribution that gets updated by calculateAllMetrics
  return paymentMethodDistribution;
}

// ==========================
// Fetch metrics from orders & inventory
// ==========================
async function computeDashboardMetrics() {
  const metrics = {
    totalSales: 0,
    ordersToday: 0,
    totalProducts: 0,
    lowStockItems: 0
  };

  // Orders / sales (from MongoDB Orders collection)
  try {
    const response = await fetch('../../connection/fetch_dashboard_metrics.php', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        metrics.totalSales = data.totalSales || 0;
        metrics.ordersToday = data.ordersToday || 0;
      }
    }
  } catch (e) {
    console.error('Error fetching order metrics from database:', e);
    // Fallback to transactions module if available
    try {
      if (typeof getDashboardOrderMetrics === 'function') {
        const orderMetrics = getDashboardOrderMetrics();
        metrics.totalSales = orderMetrics.totalSales || 0;
        metrics.ordersToday = orderMetrics.ordersToday || 0;
      }
    } catch (fallbackError) {
      console.error('Error with fallback order metrics:', fallbackError);
    }
  }

  // Inventory metrics (from Mongo inventory via existing endpoint)
  try {
    const response = await fetch('../../connection/fetch_products.php', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        const products = data.products;
        metrics.totalProducts = data.count ?? products.length;

        // Low stock items: stock quantity < 10
        metrics.lowStockItems = products.filter(p => {
          const stock =
            typeof p.stock_quantity !== 'undefined'
              ? Number(p.stock_quantity)
              : typeof p.stock !== 'undefined'
                ? Number(p.stock)
                : 0;
          return stock > 0 && stock < 10;
        }).length;
      }
    }
  } catch (e) {
    console.error('Error fetching inventory metrics for dashboard:', e);
  }

  dashboardMetrics = metrics;
  return metrics;
}

// ==========================
// Dashboard Data Management
// ==========================
async function refreshDashboardData() {
  try {
    console.log('Refreshing dashboard data...');
    // First fetch inventory metrics
    await computeDashboardMetrics();
    // Then update dashboard cards with filtered transaction data
    await updateDashboardCards();
    // Wait a bit for transactions data to be available
    setTimeout(() => {
      if (barChart && pieChart) {
        updateCharts();
      }
    }, 500);
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
  }
}

// Function to refresh charts - can be called externally after transactions load
function refreshCharts() {
  if (barChart && pieChart) {
    updateCharts();
  }
}

async function updateDashboardCards() {
  // Get FILTERED metrics for dashboard cards
  const filteredMetrics = await calculateAllMetrics(true);

  const totalSalesEl = document.getElementById('dashboardTotalSales');
  const ordersTodayEl = document.getElementById('dashboardOrdersToday');
  const totalProductsEl = document.getElementById('dashboardTotalProducts');
  const lowStockEl = document.getElementById('dashboardLowStock');

  console.log('📊 Updating dashboard cards with FILTERED data:', {
    totalSales: filteredMetrics.totalSales,
    ordersToday: filteredMetrics.ordersToday,
    totalProducts: dashboardMetrics.totalProducts,
    lowStockItems: dashboardMetrics.lowStockItems
  });

  if (totalSalesEl) {
    totalSalesEl.textContent = formatCurrencyDashboard(filteredMetrics.totalSales);
  }
  if (ordersTodayEl) {
    ordersTodayEl.textContent = filteredMetrics.ordersToday.toString();
  }
  if (totalProductsEl) {
    totalProductsEl.textContent = dashboardMetrics.totalProducts.toString();
  }
  if (lowStockEl) {
    lowStockEl.textContent = dashboardMetrics.lowStockItems.toString();
  }
}

async function updateCharts() {
  if (!barChart || !pieChart) return;

  // Get FILTERED metrics for charts
  const allMetrics = await calculateAllMetrics(true);
  
  // Check active filters
  const statusFilter = document.getElementById('filterStatus')?.value || '';
  const paymentFilter = document.getElementById('filterPaymentMethod')?.value || '';
  
  // Prepare dynamic chart data based on filters
  let barLabels = [];
  let barData = [];
  let barColors = [];
  let pieLabels = [];
  let pieData = [];
  let pieColors = [];
  
  // Always include base metrics
  barLabels.push('Total Sales (₱K)', 'Orders Today', 'Total Products', 'Low Stock Items');
  barData.push(
    allMetrics.totalSales / 1000, // Sales in thousands
    allMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems
  );
  barColors.push('#9b59b6', '#3498db', '#f39c12', '#e74c3c');
  
  pieLabels.push('Total Sales', 'Orders Today', 'Total Products', 'Low Stock Items');
  pieData.push(
    Math.min(allMetrics.totalSales / 100, 100), // Normalize sales
    allMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems
  );
  pieColors.push('#9b59b6', '#3498db', '#f39c12', '#e74c3c');
  
  // Add status-based data based on filter
  // Show Served and Canceled status
  if (paymentFilter === '' && (statusFilter === '' || statusFilter === 'Served')) {
    barLabels.push('Served Orders');
    barData.push(allMetrics.statusDistribution.Served);
    barColors.push('#3498db');
    
    pieLabels.push('Served Orders');
    pieData.push(allMetrics.statusDistribution.Served);
    pieColors.push('#3498db');
  }
  
  if (paymentFilter === '' && (statusFilter === '' || statusFilter === 'Canceled')) {
    barLabels.push('Canceled Orders');
    barData.push(allMetrics.statusDistribution.Canceled);
    barColors.push('#e74c3c');
    
    pieLabels.push('Canceled Orders');
    pieData.push(allMetrics.statusDistribution.Canceled);
    pieColors.push('#e74c3c');
  }
  
  // Add payment method-based data based on filter
  // Only show payment methods if no status filter is active
  if (statusFilter === '' && (paymentFilter === '' || paymentFilter === 'Cash')) {
    barLabels.push('Cash Payments');
    barData.push(allMetrics.paymentMethodDistribution.Cash);
    barColors.push('#27ae60');
    
    pieLabels.push('Cash Payments');
    pieData.push(allMetrics.paymentMethodDistribution.Cash);
    pieColors.push('#27ae60');
  }
  
  if (statusFilter === '' && (paymentFilter === '' || paymentFilter === 'Cashless')) {
    barLabels.push('Card Payments');
    barData.push(allMetrics.paymentMethodDistribution["Credit or Debit Card"]);
    barColors.push('#f39c12');
    
    pieLabels.push('Card Payments');
    pieData.push(allMetrics.paymentMethodDistribution["Credit or Debit Card"]);
    pieColors.push('#f39c12');
  }

  // Update Bar Chart
  barChart.data.labels = barLabels;
  barChart.data.datasets[0].data = barData;
  barChart.data.datasets[0].backgroundColor = barColors;
  barChart.update();

  // Update Pie Chart
  pieChart.data.labels = pieLabels;
  pieChart.data.datasets[0].data = pieData;
  pieChart.data.datasets[0].backgroundColor = pieColors;
  pieChart.update();
}

// ==========================
// Attach Filter Event Listeners for Chart Updates
// ==========================
function attachFilterListeners() {
  // Listen to filter input changes and trigger applyFilters, then update charts
  const filterInputs = [
    'filterStartDate',
    'filterCashier',
    'filterStatus',
    'filterPaymentMethod'
  ];

  filterInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      // Add change event listener
      input.addEventListener('change', () => {
        // Call applyFilters if it exists to update filteredTransactions
        if (typeof applyFilters === 'function') {
          applyFilters();
        }
        // Update charts after filters are applied
        setTimeout(() => {
          if (barChart && pieChart) {
            updateCharts();
          }
        }, 150);
      });
    }
  });

  // Wrap applyFilters to also update charts
  if (typeof window.applyFilters === 'function') {
    const originalApplyFilters = window.applyFilters;
    window.applyFilters = function() {
      const result = originalApplyFilters.apply(this, arguments);
      setTimeout(() => {
        if (typeof refreshCharts === 'function') {
          refreshCharts();
        }
      }, 150);
      return result;
    };
  }

  // Wrap resetFilters to also update charts
  if (typeof window.resetFilters === 'function') {
    const originalResetFilters = window.resetFilters;
    window.resetFilters = function() {
      const result = originalResetFilters.apply(this, arguments);
      setTimeout(() => {
        if (typeof refreshCharts === 'function') {
          refreshCharts();
        }
      }, 150);
      return result;
    };
  }
}

// ==========================
// Export Sales Report to CSV
// ==========================
function exportSalesReportToCSV() {
  const transactions = getFilteredTransactions();
  
  if (!transactions || transactions.length === 0) {
    alert('No sales data available to export.');
    return;
  }

  // Create CSV headers
  const headers = [
    'Order ID',
    'Date', 
    'Cashier',
    'Customer Name',
    'Status',
    'Payment Method',
    'Total Amount',
    'Items Count',
    'Items Details'
  ];

  // Convert transactions to CSV rows
  const csvRows = transactions.map(transaction => {
    const items = transaction.items || [];
    const itemsCount = items.length;
    const itemsDetails = items.map(item => 
      `${item.name || item.product_name} (${item.quantity}x @ P${item.price})`
    ).join('; ');

    return [
      transaction.order_id || transaction.id || '',
      transaction.date || (transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : ''),
      transaction.served_by || transaction.staff_name || 'N/A',
      transaction.customer_name || 'Walk-in',
      transaction.status || 'Pending',
      transaction.paymentMethod || transaction.payment_method || 'Cash',
      transaction.total_amount || '0.00',
      itemsCount.toString(),
      `"${itemsDetails}"`
    ];
  });

  // Calculate summary totals
  const totalSales = transactions.reduce((sum, txn) => sum + (parseFloat(txn.total_amount) || 0), 0);
  const subtotal = totalSales;
  const vat = subtotal * 0.01;
  const totalWithVat = subtotal + vat;

  // Add summary rows
  csvRows.push(['', '', '', '', '', '', '', '', '']);
  csvRows.push(['', '', '', '', '', '', 'Subtotal:', subtotal.toFixed(2), '']);
  csvRows.push(['', '', '', '', '', '', 'VAT (1%):', vat.toFixed(2), '']);
  csvRows.push(['', '', '', '', '', '', 'Total Amount:', totalWithVat.toFixed(2), '']);

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  // Add BOM for UTF-8 support in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  // Generate filename with current date
  const today = new Date().toISOString().split('T')[0];
  const filename = `sales_report_${today}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================
// Initialize Dashboard
// ==========================
function initDashboard() {
  // Prevent multiple initializations
  if (chartsInitialized) {
    console.log('Dashboard already initialized, skipping...');
    return;
  }

  console.log('Initializing Admin Dashboard...');
  initCharts();
  chartsInitialized = true;
  refreshDashboardData();
  
  // Attach filter listeners after a short delay to ensure DOM is ready
  setTimeout(() => {
    attachFilterListeners();
  }, 500);

  // Attach export CSV button listener
  const exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportSalesReportToCSV);
  }
  
  // Auto-refresh every 5 minutes
  setInterval(refreshDashboardData, 5 * 60 * 1000);
}

// Note: The actual initialization of initDashboard is handled
// inside AdminDashboard.php after transactions.js has loaded.
