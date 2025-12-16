let barChart, pieChart
let chartsInitialized = false
let dashboardMetrics = { totalSales: 0, ordersToday: 0, totalProducts: 0, lowStockItems: 0 }

// Fetch dashboard metrics from database
async function fetchDashboardMetrics() {
  try {
    console.log('Fetching dashboard metrics...');
    
    // Fetch products metrics only (sales will be computed from transactionsData)
    const productsResponse = await fetch('/TESDAPOS/connection/fetch_products.php');
    if (!productsResponse.ok) {
      throw new Error(`HTTP error! status: ${productsResponse.status}`);
    }
    const productsResult = await productsResponse.json();
    
    if (productsResult.success && productsResult.products) {
      dashboardMetrics.totalProducts = productsResult.products.length;
      // Count low stock items (stock < 10)
      dashboardMetrics.lowStockItems = productsResult.products.filter(p => (p.stock || 0) < 10).length;
      console.log('Products metrics fetched:', productsResult.products.length, 'products');
    }
    
    // Sales metrics will be computed from transactionsData in computeDashboardMetrics()
    // This ensures we use the cashier-specific orders that are already filtered
    
    return true;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return false;
  }
}

function formatCurrencyDashboard(v) {
  return `₱${Number(v || 0).toFixed(2)}`
}

function currentDateKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getTransactionsForMetrics() {
  let transactions = [];
  if (typeof filteredTransactions !== 'undefined' && Array.isArray(filteredTransactions) && filteredTransactions.length > 0) {
    transactions = filteredTransactions;
    console.log('📊 Using filtered transactions:', filteredTransactions.length);
  } else if (typeof transactionsData !== 'undefined' && Array.isArray(transactionsData)) {
    transactions = transactionsData;
    console.log('📊 Using all transactions:', transactionsData.length);
  } else {
    console.warn('⚠️ No transactions data available');
  }
  
  // Only include Served orders for metrics (exclude Pending, Approved, and Canceled)
  const servedOrders = transactions.filter(t => t.status === 'Served');
  console.log('✅ Served orders for metrics:', servedOrders.length, 'out of', transactions.length);
  console.log('💰 Total sales from served orders:', servedOrders.reduce((s, t) => s + (parseFloat(t.total_amount) || 0), 0));
  
  return servedOrders;
}

function computeDashboardMetrics() {
  const tx = getTransactionsForMetrics()
  
  // Calculate total sales from SERVED orders only
  const totalSales = tx.reduce((s, t) => {
    const amount = parseFloat(t.total_amount) || 0;
    console.log(`Order ${t.order_id || t.id}: Status=${t.status}, Amount=₱${amount.toFixed(2)}`);
    return s + amount;
  }, 0);
  
  const key = currentDateKey()
  const ordersToday = tx.filter(t => (t.date === key) || (t.created_at && String(t.created_at).startsWith(key))).length
  
  // Update metrics with computed values
  dashboardMetrics.totalSales = totalSales
  dashboardMetrics.ordersToday = ordersToday
  
  console.log('💵 Computed metrics:', {
    totalSales: `₱${totalSales.toFixed(2)}`,
    ordersToday,
    servedOrdersCount: tx.length,
    allTransactionsCount: typeof transactionsData !== 'undefined' ? transactionsData.length : 0
  })
}

function updateDashboardCards() {
  computeDashboardMetrics()
  const totalSalesEl = document.getElementById('dashboardTotalSales')
  const ordersTodayEl = document.getElementById('dashboardOrdersToday')
  const totalProductsEl = document.getElementById('dashboardTotalProducts')
  const lowStockEl = document.getElementById('dashboardLowStock')
  
  if (totalSalesEl) {
    totalSalesEl.textContent = formatCurrencyDashboard(dashboardMetrics.totalSales)
    console.log('💰 Total Sales updated:', formatCurrencyDashboard(dashboardMetrics.totalSales))
  }
  if (ordersTodayEl) {
    ordersTodayEl.textContent = String(dashboardMetrics.ordersToday)
    console.log('📦 Orders Today updated:', dashboardMetrics.ordersToday)
  }
  if (totalProductsEl) totalProductsEl.textContent = String(dashboardMetrics.totalProducts)
  if (lowStockEl) lowStockEl.textContent = String(dashboardMetrics.lowStockItems)
}

function buildPieChartData() {
  // Get all transactions for the cashier
  let allTransactions = [];
  if (typeof transactionsData !== 'undefined' && Array.isArray(transactionsData)) {
    allTransactions = transactionsData;
  }
  
  // Count Served and Canceled orders only
  const served = allTransactions.filter(t => t.status === 'Served').length;
  const canceled = allTransactions.filter(t => t.status === 'Canceled').length;
  
  // Count payment methods (only from Served orders)
  const servedOrders = allTransactions.filter(t => t.status === 'Served');
  const cash = servedOrders.filter(t => t.payment_method === 'Cash').length;
  const card = servedOrders.filter(t => t.payment_method === 'Credit or Debit Card' || t.payment_method === 'card' || t.payment_method === 'Card').length;
  
  // Get total sales from Served orders
  const totalSales = servedOrders.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0);
  
  return {
    served,
    canceled,
    cash,
    card,
    totalSales
  };
}

function buildPaymentDistribution(tx) {
  const dist = { Cash: 0, 'Credit or Debit Card': 0 }
  tx.forEach(t => {
    const p = t.payment_method || 'Cash'
    if (p === 'Cash') dist.Cash += 1
    else dist['Credit or Debit Card'] += 1
  })
  return dist
}

async function initDashboard() {
  // Fetch products metrics from database
  await fetchDashboardMetrics();
  
  const barCanvas = document.getElementById('barChart')
  const pieCanvas = document.getElementById('pieChart')
  
  // Compute sales metrics from transactionsData (cashier-specific orders)
  computeDashboardMetrics()
  updateDashboardCards()
  
  const pieData = buildPieChartData()
  
  if (barCanvas) {
    barChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: ['Total Sales (₱)', 'Served Orders', 'Canceled Orders', 'Cash Payments', 'Card Payments'],
        datasets: [{
          label: 'Metrics',
          data: [
            dashboardMetrics.totalSales,
            pieData.served,
            pieData.canceled,
            pieData.cash,
            pieData.card
          ],
          backgroundColor: ['#9b59b6', '#3498db', '#e74c3c', '#27ae60', '#f39c12']
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed.y;
                
                // Format Total Sales with currency
                if (label.includes('Total Sales')) {
                  return 'Total Sales: ₱' + value.toFixed(2);
                }
                
                return label + ': ' + value;
              }
            }
          }
        }
      }
    })
  }
  
  if (pieCanvas) {
    pieChart = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: ['Served Orders', 'Canceled Orders', 'Cash Payments', 'Card Payments', 'Total Sales (₱100s)'],
        datasets: [{
          data: [
            pieData.served,
            pieData.canceled,
            pieData.cash,
            pieData.card,
            pieData.totalSales / 100 // Normalize sales for display
          ],
          backgroundColor: ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                
                // Format Total Sales differently
                if (label.includes('Total Sales')) {
                  return label + ': ₱' + (value * 100).toFixed(2);
                }
                
                return label + ': ' + value;
              }
            }
          }
        }
      }
    })
  }
  chartsInitialized = true
}

async function refreshCharts() {
  if (!barChart && !pieChart) return
  
  // Refresh products metrics from database
  await fetchDashboardMetrics();
  
  // Compute sales metrics from transactionsData (cashier-specific orders)
  computeDashboardMetrics()
  updateDashboardCards()
  
  const pieData = buildPieChartData()
  
  if (barChart) {
    barChart.data.datasets[0].data = [
      dashboardMetrics.totalSales,
      pieData.served,
      pieData.canceled,
      pieData.cash,
      pieData.card
    ]
    barChart.update()
  }
  
  if (pieChart) {
    pieChart.data.datasets[0].data = [
      pieData.served,
      pieData.canceled,
      pieData.cash,
      pieData.card,
      pieData.totalSales / 100 // Normalize sales for display
    ]
    pieChart.update()
  }
}
