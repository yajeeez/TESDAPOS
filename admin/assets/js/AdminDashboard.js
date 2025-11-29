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
let dashboardMetrics = {
  totalSales: 0,
  ordersToday: 0,
  totalProducts: 0,
  lowStockItems: 0
};

function initCharts() {
  const barCtx = document.getElementById('barChart')?.getContext('2d');
  const pieCtx = document.getElementById('pieChart')?.getContext('2d');

  if (!barCtx || !pieCtx) {
    console.log('Chart canvases not found, skipping chart initialization');
    return;
  }

  const initialData = [
    dashboardMetrics.totalSales,
    dashboardMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems
  ];

  // Bar Chart
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Total Sales', 'Orders Today', 'Total Products', 'Low Stock Items'],
      datasets: [{
        label: 'Dashboard Metrics',
        data: initialData,
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // Pie Chart
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: ['Total Sales', 'Orders Today', 'Total Products', 'Low Stock Items'],
      datasets: [{
        data: initialData,
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
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
    if (barChart && pieChart) {
      updateCharts();
    }
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
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

  const chartData = [
    dashboardMetrics.totalSales,
    dashboardMetrics.ordersToday,
    dashboardMetrics.totalProducts,
    dashboardMetrics.lowStockItems
  ];

  barChart.data.datasets[0].data = chartData;
  pieChart.data.datasets[0].data = chartData;
  barChart.update();
  pieChart.update();
}

// ==========================
// Initialize Dashboard
// ==========================
function initDashboard() {
  console.log('Initializing Admin Dashboard...');
  initCharts();
  refreshDashboardData();
  
  // Auto-refresh every 5 minutes
  setInterval(refreshDashboardData, 5 * 60 * 1000);
}

// Note: The actual initialization of initDashboard is handled
// inside AdminDashboard.php after transactions.js has loaded.