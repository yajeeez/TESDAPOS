const CURRENT_CASHIER = (window.CURRENT_CASHIER || '').trim();

const sampleSalesData = [
  {
    id: 'TXN-2025-0001',
    date: '2025-01-05',
    cashier: 'Maria Santos',
    items: [
      { name: 'Pork Sinigang', quantity: 2, price: 150.0 },
      { name: 'Iced Tea', quantity: 2, price: 35.0 }
    ]
  },
  {
    id: 'TXN-2025-0002',
    date: '2025-01-07',
    cashier: 'John Cruz',
    items: [
      { name: 'Chicken Adobo', quantity: 3, price: 120.0 }
    ]
  },
  {
    id: 'TXN-2025-0003',
    date: '2025-01-09',
    cashier: 'Maria Santos',
    items: [
      { name: 'Burger Steak', quantity: 4, price: 95.0 },
      { name: 'Fries', quantity: 2, price: 45.0 }
    ]
  },
  {
    id: 'TXN-2025-0004',
    date: '2025-01-11',
    cashier: 'Anna Reyes',
    items: [
      { name: 'Milk Tea', quantity: 5, price: 55.0 }
    ]
  },
  {
    id: 'TXN-2025-0005',
    date: '2025-01-12',
    cashier: 'John Cruz',
    items: [
      { name: 'BBQ Skewers', quantity: 10, price: 35.0 },
      { name: 'Rice', quantity: 10, price: 20.0 }
    ]
  }
];

const toastEl = document.getElementById('notificationToast');
const toastMessageEl = document.getElementById('toastMessage');

let cashierTransactions = [];
let salesRows = [];
let filteredRows = [];

const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const tableBody = document.getElementById('reportTableBody');
const emptyStateEl = document.getElementById('emptyState');
const revenueEl = document.getElementById('summaryRevenue');
const transactionsEl = document.getElementById('summaryTransactions');
const itemsEl = document.getElementById('summaryItems');
const averageEl = document.getElementById('summaryAverage');

function showToast(message, type = 'success') {
  if (!toastEl || !toastMessageEl) return;
  toastMessageEl.textContent = message;
  toastEl.style.background = type === 'error' ? '#dc2626' : '#22c55e';
  toastEl.hidden = false;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2400);
}

function flattenTransactions(transactions) {
  return transactions.flatMap((txn) =>
    txn.items.map((item) => ({
      date: txn.date,
      orderId: txn.id,
      item: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    }))
  );
}

function formatCurrency(value) {
  return `₱${Number(value || 0).toFixed(2)}`;
}

function formatDisplayDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-PH', {
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

function setDefaultDates() {
  if (!cashierTransactions.length || !startInput || !endInput) return;
  const timestamps = cashierTransactions.map((txn) => new Date(txn.date).getTime());
  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));
  startInput.value = formatInputDate(minDate);
  endInput.value = formatInputDate(maxDate);
}

function applyFilters() {
  const startDate = startInput?.value ? new Date(startInput.value) : null;
  const endDate = endInput?.value ? new Date(endInput.value) : null;

  filteredRows = salesRows.filter((row) => {
    const rowDate = new Date(row.date);
    if (startDate && rowDate < startDate) return false;
    if (endDate && rowDate > endDate) return false;
    return true;
  });

  renderTable();
  renderSummary();
}

function resetFilters() {
  setDefaultDates();
  filteredRows = [...salesRows];
  renderTable();
  renderSummary();
}

function renderTable() {
  if (!tableBody || !emptyStateEl) return;

  tableBody.innerHTML = '';

  if (!filteredRows.length) {
    emptyStateEl.hidden = false;
    return;
  }

  emptyStateEl.hidden = true;

  filteredRows
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDisplayDate(row.date)}</td>
        <td>${row.orderId}</td>
        <td>${row.item}</td>
        <td>${row.quantity}</td>
        <td>${formatCurrency(row.price)}</td>
        <td>${formatCurrency(row.total)}</td>
      `;
      tableBody.appendChild(tr);
    });
}

function renderSummary() {
  const totalRevenue = filteredRows.reduce((sum, row) => sum + row.total, 0);
  const totalItems = filteredRows.reduce((sum, row) => sum + row.quantity, 0);
  const distinctOrders = new Set(filteredRows.map((row) => row.orderId)).size;
  const averageOrder = distinctOrders ? totalRevenue / distinctOrders : 0;

  if (revenueEl) revenueEl.textContent = formatCurrency(totalRevenue);
  if (transactionsEl) transactionsEl.textContent = distinctOrders.toString();
  if (itemsEl) itemsEl.textContent = totalItems.toString();
  if (averageEl) averageEl.textContent = formatCurrency(averageOrder);
}

function exportCsv() {
  if (!filteredRows.length) {
    showToast('Nothing to export. Adjust your filters.', 'error');
    return;
  }

  const header = ['Date', 'Order ID', 'Item', 'Quantity', 'Price', 'Total'];
  const rows = filteredRows.map((row) => [
    row.date,
    row.orderId,
    row.item,
    row.quantity,
    row.price.toFixed(2),
    row.total.toFixed(2)
  ]);

  const csvContent = [header, ...rows].map((line) => line.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function printReport() {
  if (!filteredRows.length) {
    showToast('Nothing to print. Adjust your filters.', 'error');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=820,height=900');
  if (!printWindow) {
    showToast('Pop-up blocked. Please allow pop-ups.', 'error');
    return;
  }

  const rowsHtml = filteredRows
    .map(
      (row) => `
        <tr>
          <td>${formatDisplayDate(row.date)}</td>
          <td>${row.orderId}</td>
          <td>${row.item}</td>
          <td style="text-align:right;">${row.quantity}</td>
          <td style="text-align:right;">${formatCurrency(row.price)}</td>
          <td style="text-align:right;">${formatCurrency(row.total)}</td>
        </tr>
      `
    )
    .join('');

  const totalRevenue = filteredRows.reduce((sum, row) => sum + row.total, 0);
  const totalItems = filteredRows.reduce((sum, row) => sum + row.quantity, 0);
  const distinctOrders = new Set(filteredRows.map((row) => row.orderId)).size;

  printWindow.document.write(`
    <html>
      <head>
        <title>Sales Report</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 24px; color: #1f2937; }
          h1 { text-align: center; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { padding: 8px 10px; border: 1px solid #cbd5f5; }
          th { background: #1d4ed8; color: #fff; }
          .summary { margin-top: 16px; }
          .summary div { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <h1>Sales Report for ${CURRENT_CASHIER}</h1>
        <div class="summary">
          <div><strong>Total Revenue:</strong> ${formatCurrency(totalRevenue)}</div>
          <div><strong>Total Transactions:</strong> ${distinctOrders}</div>
          <div><strong>Total Items:</strong> ${totalItems}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>window.print(); window.onafterprint = () => window.close();<\/script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

function init() {
  if (!CURRENT_CASHIER) {
    showToast('Unable to identify cashier.', 'error');
    return;
  }

  cashierTransactions = sampleSalesData.filter((txn) => txn.cashier === CURRENT_CASHIER);
  salesRows = flattenTransactions(cashierTransactions);
  filteredRows = [...salesRows];

  setDefaultDates();
  renderTable();
  renderSummary();

  document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
  document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
  document.getElementById('exportCsv')?.addEventListener('click', exportCsv);
  document.getElementById('printReport')?.addEventListener('click', printReport);
}

document.addEventListener('DOMContentLoaded', init);


