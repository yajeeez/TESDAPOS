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
  // Use filtered transactions if available, otherwise use all transactions
  let allTransactions = [];
  if (typeof filteredTransactions !== 'undefined' && Array.isArray(filteredTransactions) && filteredTransactions.length > 0) {
    allTransactions = filteredTransactions;
    console.log('📊 Using filtered transactions for chart:', filteredTransactions.length);
  } else if (typeof transactionsData !== 'undefined' && Array.isArray(transactionsData)) {
    allTransactions = transactionsData;
    console.log('📊 Using all transactions for chart:', transactionsData.length);
  }
  
  // Get active filters
  const statusFilter = document.getElementById('filterStatus')?.value || '';
  const paymentFilter = document.getElementById('filterPaymentMethod')?.value || '';
  
  // Count orders by status
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
    totalSales,
    statusFilter,
    paymentFilter
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
    // Build dynamic labels and data based on filters
    let barLabels = ['Total Sales (₱K)'];
    let barData = [dashboardMetrics.totalSales / 1000];
    let barColors = ['#9b59b6'];
    
    // Add status data based on filter
    if (pieData.statusFilter === '') {
      // Show all statuses
      barLabels.push('Served Orders', 'Canceled Orders');
      barData.push(pieData.served, pieData.canceled);
      barColors.push('#3498db', '#e74c3c');
    } else if (pieData.statusFilter === 'Served') {
      barLabels.push('Served Orders');
      barData.push(pieData.served);
      barColors.push('#3498db');
    } else if (pieData.statusFilter === 'Canceled') {
      barLabels.push('Canceled Orders');
      barData.push(pieData.canceled);
      barColors.push('#e74c3c');
    }
    
    // Add payment method data based on filter
    if (pieData.paymentFilter === '') {
      // Show all payment methods
      barLabels.push('Cash Payments', 'Card Payments');
      barData.push(pieData.cash, pieData.card);
      barColors.push('#27ae60', '#f39c12');
    } else if (pieData.paymentFilter === 'Cash') {
      barLabels.push('Cash Payments');
      barData.push(pieData.cash);
      barColors.push('#27ae60');
    } else if (pieData.paymentFilter === 'Cashless') {
      barLabels.push('Card Payments');
      barData.push(pieData.card);
      barColors.push('#f39c12');
    }
    
    barChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [{
          label: 'Metrics',
          data: barData,
          backgroundColor: barColors
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
                
                // Format Total Sales with currency (multiply back by 1000)
                if (label.includes('Total Sales')) {
                  return 'Total Sales: ₱' + (value * 1000).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
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
    // Build dynamic labels and data based on filters
    let pieLabels = ['Total Sales'];
    let pieData_values = [pieData.totalSales / 100]; // Normalize sales for display
    let pieColors = ['#9b59b6'];
    
    // Add status data based on filter
    if (pieData.statusFilter === '') {
      // Show all statuses
      pieLabels.push('Served Orders', 'Canceled Orders');
      pieData_values.push(pieData.served, pieData.canceled);
      pieColors.push('#3498db', '#e74c3c');
    } else if (pieData.statusFilter === 'Served') {
      pieLabels.push('Served Orders');
      pieData_values.push(pieData.served);
      pieColors.push('#3498db');
    } else if (pieData.statusFilter === 'Canceled') {
      pieLabels.push('Canceled Orders');
      pieData_values.push(pieData.canceled);
      pieColors.push('#e74c3c');
    }
    
    // Add payment method data based on filter
    if (pieData.paymentFilter === '') {
      // Show all payment methods
      pieLabels.push('Cash Payments', 'Card Payments');
      pieData_values.push(pieData.cash, pieData.card);
      pieColors.push('#27ae60', '#f39c12');
    } else if (pieData.paymentFilter === 'Cash') {
      pieLabels.push('Cash Payments');
      pieData_values.push(pieData.cash);
      pieColors.push('#27ae60');
    } else if (pieData.paymentFilter === 'Cashless') {
      pieLabels.push('Card Payments');
      pieData_values.push(pieData.card);
      pieColors.push('#f39c12');
    }
    
    pieChart = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: pieLabels,
        datasets: [{
          data: pieData_values,
          backgroundColor: pieColors
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
    // Build dynamic labels and data based on filters
    let barLabels = ['Total Sales (₱K)'];
    let barData = [dashboardMetrics.totalSales / 1000];
    let barColors = ['#9b59b6'];
    
    // Add status data based on filter
    if (pieData.statusFilter === '') {
      // Show all statuses
      barLabels.push('Served Orders', 'Canceled Orders');
      barData.push(pieData.served, pieData.canceled);
      barColors.push('#3498db', '#e74c3c');
    } else if (pieData.statusFilter === 'Served') {
      barLabels.push('Served Orders');
      barData.push(pieData.served);
      barColors.push('#3498db');
    } else if (pieData.statusFilter === 'Canceled') {
      barLabels.push('Canceled Orders');
      barData.push(pieData.canceled);
      barColors.push('#e74c3c');
    }
    
    // Add payment method data based on filter
    if (pieData.paymentFilter === '') {
      // Show all payment methods
      barLabels.push('Cash Payments', 'Card Payments');
      barData.push(pieData.cash, pieData.card);
      barColors.push('#27ae60', '#f39c12');
    } else if (pieData.paymentFilter === 'Cash') {
      barLabels.push('Cash Payments');
      barData.push(pieData.cash);
      barColors.push('#27ae60');
    } else if (pieData.paymentFilter === 'Cashless') {
      barLabels.push('Card Payments');
      barData.push(pieData.card);
      barColors.push('#f39c12');
    }
    
    barChart.data.labels = barLabels;
    barChart.data.datasets[0].data = barData;
    barChart.data.datasets[0].backgroundColor = barColors;
    barChart.update();
  }
  
  if (pieChart) {
    // Build dynamic labels and data based on filters
    let pieLabels = ['Total Sales'];
    let pieData_values = [pieData.totalSales / 100]; // Normalize sales for display
    let pieColors = ['#9b59b6'];
    
    // Add status data based on filter
    if (pieData.statusFilter === '') {
      // Show all statuses
      pieLabels.push('Served Orders', 'Canceled Orders');
      pieData_values.push(pieData.served, pieData.canceled);
      pieColors.push('#3498db', '#e74c3c');
    } else if (pieData.statusFilter === 'Served') {
      pieLabels.push('Served Orders');
      pieData_values.push(pieData.served);
      pieColors.push('#3498db');
    } else if (pieData.statusFilter === 'Canceled') {
      pieLabels.push('Canceled Orders');
      pieData_values.push(pieData.canceled);
      pieColors.push('#e74c3c');
    }
    
    // Add payment method data based on filter
    if (pieData.paymentFilter === '') {
      // Show all payment methods
      pieLabels.push('Cash Payments', 'Card Payments');
      pieData_values.push(pieData.cash, pieData.card);
      pieColors.push('#27ae60', '#f39c12');
    } else if (pieData.paymentFilter === 'Cash') {
      pieLabels.push('Cash Payments');
      pieData_values.push(pieData.cash);
      pieColors.push('#27ae60');
    } else if (pieData.paymentFilter === 'Cashless') {
      pieLabels.push('Card Payments');
      pieData_values.push(pieData.card);
      pieColors.push('#f39c12');
    }
    
    pieChart.data.labels = pieLabels;
    pieChart.data.datasets[0].data = pieData_values;
    pieChart.data.datasets[0].backgroundColor = pieColors;
    pieChart.update();
  }
}
