let transactionsData = []
let filteredTransactions = []

function formatCurrency(v) {
  return `₱${Number(v || 0).toFixed(2)}`
}

function formatDisplayDate(s) {
  if (!s) return 'N/A'
  const d = new Date(s)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function transactionTotal(t) {
  return parseFloat(t.total_amount) || 0
}

function transactionItemCount(t) {
  return parseInt(t.total_item_count) || 0
}

async function fetchTransactionsFromDB() {
  try {
    const res = await fetch('/TESDAPOS/admin/fetch_filtered_orders.php', { method: 'GET', headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.success && data.orders) {
      transactionsData = data.orders
      filteredTransactions = [...transactionsData]
      renderTransactions()
      return true
    }
    throw new Error(data.message || 'Failed to fetch orders')
  } catch (e) {
    transactionsData = []
    filteredTransactions = []
    renderTransactions()
    return false
  }
}

function renderTransactions() {
  const tbody = document.getElementById('transactionsList')
  if (!tbody) return
  tbody.innerHTML = ''
  const list = filteredTransactions.length ? filteredTransactions : transactionsData
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:#666;">No transactions found.</td></tr>`
    return
  }
  list.forEach(t => {
    const total = transactionTotal(t)
    const itemCount = transactionItemCount(t)
    let itemsLabel = 'No Items'
    if (t.product_names && t.product_names.length > 0) {
      const firstName = t.product_names[0]
      itemsLabel = t.product_names.length > 1 ? `${firstName} +${t.product_names.length - 1} more` : firstName
    }
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td><strong>#${t.order_id || t.id}</strong></td>
      <td>${t.transaction_id || 'N/A'}</td>
      <td>${formatDisplayDate(t.created_at || t.date)}</td>
      <td>${t.cashier_name || 'N/A'}</td>
      <td>${itemsLabel}</td>
      <td>${itemCount}</td>
      <td>${t.payment_method || 'N/A'}</td>
      <td><strong>${formatCurrency(total)}</strong></td>
      <td><span class="status ${String(t.status || 'Pending').toLowerCase()}">${t.status || 'Pending'}</span></td>
      <td>
        <button class="action-btn" onclick="generateReport()"><i class="fas fa-file-export"></i></button>
      </td>
    `
    tbody.appendChild(tr)
  })
}

function generateReport() {
  alert('Report generation is not implemented for cashier.')
}

document.addEventListener('DOMContentLoaded', async () => {
  await fetchTransactionsFromDB()
  renderTransactions()
})
