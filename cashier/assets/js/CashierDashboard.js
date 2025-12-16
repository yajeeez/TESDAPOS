let barChart, pieChart
let chartsInitialized = false
let dashboardMetrics = { totalSales: 0, ordersToday: 0, totalProducts: 0, lowStockItems: 0 }

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
  if (typeof filteredTransactions !== 'undefined' && Array.isArray(filteredTransactions) && filteredTransactions.length > 0) {
    return filteredTransactions
  }
  if (typeof transactionsData !== 'undefined' && Array.isArray(transactionsData)) {
    return transactionsData
  }
  return []
}

function computeDashboardMetrics() {
  const tx = getTransactionsForMetrics()
  const totalSales = tx.reduce((s, t) => s + (parseFloat(t.total_amount) || 0), 0)
  const key = currentDateKey()
  const ordersToday = tx.filter(t => (t.date === key) || (t.created_at && String(t.created_at).startsWith(key))).length
  dashboardMetrics.totalSales = totalSales
  dashboardMetrics.ordersToday = ordersToday
  dashboardMetrics.totalProducts = 0
  dashboardMetrics.lowStockItems = 0
}

function updateDashboardCards() {
  computeDashboardMetrics()
  const totalSalesEl = document.getElementById('dashboardTotalSales')
  const ordersTodayEl = document.getElementById('dashboardOrdersToday')
  const totalProductsEl = document.getElementById('dashboardTotalProducts')
  const lowStockEl = document.getElementById('dashboardLowStock')
  if (totalSalesEl) totalSalesEl.textContent = formatCurrencyDashboard(dashboardMetrics.totalSales)
  if (ordersTodayEl) ordersTodayEl.textContent = String(dashboardMetrics.ordersToday)
  if (totalProductsEl) totalProductsEl.textContent = String(dashboardMetrics.totalProducts)
  if (lowStockEl) lowStockEl.textContent = String(dashboardMetrics.lowStockItems)
}

function buildStatusDistribution(tx) {
  const dist = { Pending: 0, Approved: 0, Served: 0, Canceled: 0 }
  tx.forEach(t => {
    const s = t.status || 'Pending'
    if (dist[s] !== undefined) dist[s] += 1
  })
  return dist
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

function initDashboard() {
  const barCanvas = document.getElementById('barChart')
  const pieCanvas = document.getElementById('pieChart')
  computeDashboardMetrics()
  if (barCanvas) {
    barChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: ['Total Sales', 'Orders Today'],
        datasets: [{
          label: 'Metrics',
          data: [dashboardMetrics.totalSales, dashboardMetrics.ordersToday],
          backgroundColor: ['#004aad', '#ffc107']
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    })
  }
  const tx = getTransactionsForMetrics()
  const status = buildStatusDistribution(tx)
  if (pieCanvas) {
    pieChart = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: ['Pending', 'Approved', 'Served', 'Canceled'],
        datasets: [{
          data: [status.Pending, status.Approved, status.Served, status.Canceled],
          backgroundColor: ['#f39c12', '#27ae60', '#3498db', '#e74c3c']
        }]
      },
      options: { responsive: true }
    })
  }
  chartsInitialized = true
}

function refreshCharts() {
  if (!barChart && !pieChart) return
  computeDashboardMetrics()
  if (barChart) {
    barChart.data.datasets[0].data = [dashboardMetrics.totalSales, dashboardMetrics.ordersToday]
    barChart.update()
  }
  const tx = getTransactionsForMetrics()
  const status = buildStatusDistribution(tx)
  if (pieChart) {
    pieChart.data.datasets[0].data = [status.Pending, status.Approved, status.Served, status.Canceled]
    pieChart.update()
  }
}
