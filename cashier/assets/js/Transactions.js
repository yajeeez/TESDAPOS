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
  const tbody = document.getElementById('transactionsList')
  if (!tbody) {
    console.warn('⚠️ transactionsList tbody not found');
    return;
  }
  
  tbody.innerHTML = ''
  const list = filteredTransactions.length ? filteredTransactions : transactionsData
  
  console.log('🎨 Rendering transactions:', list.length);
  
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:2rem; color:#666;">
      <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 1rem;"></i>
      No transactions found. Transactions will appear here after you serve orders.
    </td></tr>`
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
    // Get cashier name from various possible fields
    const cashierName = t.cashier_name || t.served_by || t.served_by_username || '<span style="color: #999;">Unknown</span>';
    
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td><strong>#${t.order_id || t.id}</strong></td>
      <td>${t.transaction_id || 'N/A'}</td>
      <td>${formatDisplayDate(t.created_at || t.date)}</td>
      <td>${cashierName}</td>
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
