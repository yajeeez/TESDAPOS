// ==========================
// Admin Dashboard Core Functions
// ==========================

// ==========================
// Logout
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "/TESDAPOS/LandingPage/LandingPage.html"; 
  }
}

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

function initCharts() {
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

  // Get all metrics including status and payment distributions
  const allMetrics = calculateAllMetrics();

  // Prepare data for bar chart - combine all metrics
  const barLabels = [
    'Total Sales (₱K)', 
    'Orders Today', 
    'Total Products', 
    'Low Stock Items',
    'Served',
    'Canceled',
    'Cash',
    'Credit or Debit Card'
  ];
  
  // Normalize sales to thousands for better visualization
  const barData = [
    allMetrics.totalSales / 1000, // Sales in thousands
    allMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems,
    allMetrics.statusDistribution.Served,
    allMetrics.statusDistribution.Canceled,
    allMetrics.paymentMethodDistribution.Cash,
    allMetrics.paymentMethodDistribution["Credit or Debit Card"]
  ];

  const barColors = [
    '#4CAF50',  // Total Sales - Green
    '#2196F3',  // Orders Today - Blue
    '#FF9800',  // Total Products - Orange
    '#F44336',  // Low Stock Items - Red
    '#4CAF50',  // Served - Green
    '#F44336',  // Canceled - Red
    '#4CAF50',  // Cash - Green
    '#2196F3'   // Credit or Debit Card - Blue
  ];

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

  // Prepare data for pie chart - combine all metrics (as counts/values)
  const pieLabels = [
    'Total Sales',
    'Orders Today',
    'Total Products',
    'Low Stock Items',
    'Served',
    'Canceled',
    'Cash',
    'Credit or Debit Card'
  ];

  // Normalize values for pie chart (using percentages or absolute values)
  const pieData = [
    Math.min(allMetrics.totalSales / 100, 100), // Normalize sales
    allMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems,
    allMetrics.statusDistribution.Served,
    allMetrics.statusDistribution.Canceled,
    allMetrics.paymentMethodDistribution.Cash,
    allMetrics.paymentMethodDistribution["Credit or Debit Card"]
  ];

  const pieColors = [
    '#4CAF50',  // Total Sales - Green
    '#2196F3',  // Orders Today - Blue
    '#FF9800',  // Total Products - Orange
    '#F44336',  // Low Stock Items - Red
    '#4CAF50',  // Served - Green
    '#F44336',  // Canceled - Red
    '#4CAF50',  // Cash - Green
    '#2196F3'   // Credit or Debit Card - Blue
  ];

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
                // Add percentage
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                label += ' (' + percentage + '%)';
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
// Calculate All Dashboard Metrics from Filtered Transactions
// ==========================
function calculateAllMetrics() {
  const transactions = getFilteredTransactions();
  
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

  // Calculate from filtered transactions
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  transactions.forEach(transaction => {
    // Calculate total sales
    if (transaction.items && Array.isArray(transaction.items)) {
      const transactionTotal = transaction.items.reduce((sum, item) => {
        return sum + (item.quantity || 0) * (item.price || 0);
      }, 0);
      metrics.totalSales += transactionTotal;
    } else if (transaction.total_amount) {
      metrics.totalSales += parseFloat(transaction.total_amount) || 0;
    }

    // Count orders today
    const transactionDate = transaction.date || (transaction.created_at ? new Date(transaction.created_at).toISOString().split('T')[0] : null);
    if (transactionDate === today) {
      metrics.ordersToday++;
    }

    // Count by status
    const status = transaction.status || 'Pending';
    if (metrics.statusDistribution.hasOwnProperty(status)) {
      metrics.statusDistribution[status]++;
    } else {
      metrics.statusDistribution.Pending++;
    }

    // Count by payment method - map all cashless variations to Cashless
    const paymentMethod = transaction.paymentMethod || transaction.payment_method || 'Cash';
    if (paymentMethod === 'Cash' || paymentMethod === 'cash') {
      metrics.paymentMethodDistribution.Cash++;
    } else if (paymentMethod === 'Cashless' || paymentMethod === 'cashless' || paymentMethod === 'Credit or Debit Card' || paymentMethod === 'credit or debit card' || paymentMethod === 'Credit/Debit Card' || paymentMethod === 'card' || paymentMethod === 'Card') {
      metrics.paymentMethodDistribution["Credit or Debit Card"]++;
    } else {
      metrics.paymentMethodDistribution.Cash++;
    }
  });

  // Update global distributions
  statusDistribution = metrics.statusDistribution;
  paymentMethodDistribution = metrics.paymentMethodDistribution;
  
  return metrics;
}

// ==========================
// Calculate Status Distribution from Transactions
// ==========================
function calculateStatusDistribution() {
  const allMetrics = calculateAllMetrics();
  return allMetrics.statusDistribution;
}

// ==========================
// Calculate Payment Method Distribution from Transactions
// ==========================
function calculatePaymentMethodDistribution() {
  const allMetrics = calculateAllMetrics();
  return allMetrics.paymentMethodDistribution;
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
  await computeDashboardMetrics();

  const totalSalesEl = document.getElementById('dashboardTotalSales');
  const ordersTodayEl = document.getElementById('dashboardOrdersToday');
  const totalProductsEl = document.getElementById('dashboardTotalProducts');
  const lowStockEl = document.getElementById('dashboardLowStock');

  if (totalSalesEl) {
    totalSalesEl.textContent = formatCurrencyDashboard(dashboardMetrics.totalSales);
  }
  if (ordersTodayEl) {
    ordersTodayEl.textContent = dashboardMetrics.ordersToday.toString();
  }
  if (totalProductsEl) {
    totalProductsEl.textContent = dashboardMetrics.totalProducts.toString();
  }
  if (lowStockEl) {
    lowStockEl.textContent = dashboardMetrics.lowStockItems.toString();
  }
}

function updateCharts() {
  if (!barChart || !pieChart) return;

  // Get all updated metrics from filtered transactions
  const allMetrics = calculateAllMetrics();
  
  // Prepare bar chart data
  const barLabels = [
    'Total Sales (₱K)', 
    'Orders Today', 
    'Total Products', 
    'Low Stock Items',
    'Served',
    'Canceled',
    'Cash',
    'Credit or Debit Card'
  ];
  
  const barData = [
    allMetrics.totalSales / 1000, // Sales in thousands
    allMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems,
    allMetrics.statusDistribution.Served,
    allMetrics.statusDistribution.Canceled,
    allMetrics.paymentMethodDistribution.Cash,
    allMetrics.paymentMethodDistribution["Credit or Debit Card"]
  ];

  const barColors = [
    '#4CAF50',  // Total Sales - Green
    '#2196F3',  // Orders Today - Blue
    '#FF9800',  // Total Products - Orange
    '#F44336',  // Low Stock Items - Red
    '#4CAF50',  // Served - Green
    '#F44336',  // Canceled - Red
    '#4CAF50',  // Cash - Green
    '#2196F3'   // Credit or Debit Card - Blue
  ];

  // Prepare pie chart data
  const pieLabels = [
    'Total Sales',
    'Orders Today',
    'Total Products',
    'Low Stock Items',
    'Served',
    'Canceled',
    'Cash',
    'Credit or Debit Card'
  ];

  const pieData = [
    Math.min(allMetrics.totalSales / 100, 100), // Normalize sales
    allMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems,
    allMetrics.statusDistribution.Served,
    allMetrics.statusDistribution.Canceled,
    allMetrics.paymentMethodDistribution.Cash,
    allMetrics.paymentMethodDistribution["Credit or Debit Card"]
  ];

  const pieColors = [
    '#4CAF50',  // Total Sales - Green
    '#2196F3',  // Orders Today - Blue
    '#FF9800',  // Total Products - Orange
    '#F44336',  // Low Stock Items - Red
    '#4CAF50',  // Served - Green
    '#F44336',  // Canceled - Red
    '#4CAF50',  // Cash - Green
    '#2196F3'   // Credit or Debit Card - Blue
  ];

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
      `${item.name || item.product_name} (${item.quantity}x @ ₱${item.price})`
    ).join('; ');

    return [
      transaction.order_id || transaction.id || '',
      transaction.date || (transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : ''),
      transaction.cashier || transaction.staff_name || '',
      transaction.customer_name || 'Walk-in',
      transaction.status || 'Pending',
      transaction.paymentMethod || transaction.payment_method || 'Cash',
      transaction.total_amount || '0.00',
      itemsCount.toString(),
      `"${itemsDetails}"`
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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