// ==========================
// Sales Report Data (Sample)
// ==========================
// Replace with API data fetch when backend is ready
const salesData = [
  {
    id: 'TXN-2025-0001',
    date: '2025-01-05',
    cashier: 'Maria Santos',
    paymentMethod: 'Cash',
    items: [
      { name: 'Pork Sinigang', quantity: 2, price: 150.0 },
      { name: 'Iced Tea', quantity: 2, price: 35.0 }
    ]
  },
  {
    id: 'TXN-2025-0002',
    date: '2025-01-07',
    cashier: 'John Cruz',
    paymentMethod: 'Cashless',
    items: [
      { name: 'Chicken Adobo', quantity: 3, price: 120.0 }
    ]
  },
  {
    id: 'TXN-2025-0003',
    date: '2025-01-09',
    cashier: 'Maria Santos',
    paymentMethod: 'Cash',
    items: [
      { name: 'Burger Steak', quantity: 4, price: 95.0 },
      { name: 'Fries', quantity: 2, price: 45.0 }
    ]
  },
  {
    id: 'TXN-2025-0004',
    date: '2025-01-11',
    cashier: 'Anna Reyes',
    paymentMethod: 'Cashless',
    items: [
      { name: 'Milk Tea', quantity: 5, price: 55.0 }
    ]
  },
  {
    id: 'TXN-2025-0005',
    date: '2025-01-12',
    cashier: 'John Cruz',
    paymentMethod: 'Cash',
    items: [
      { name: 'BBQ Skewers', quantity: 10, price: 35.0 },
      { name: 'Rice', quantity: 10, price: 20.0 }
    ]
  }
];

let filteredData = [...salesData];

// ==========================
// Utility Functions
// ==========================
const formatCurrency = (value) => `₱${Number(value || 0).toFixed(2)}`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const calculateLineTotal = (item) => item.quantity * item.price;

const flattenTransactions = (data) => {
  const rows = [];
  data.forEach((txn) => {
    txn.items.forEach((item) => {
      rows.push({
        date: txn.date,
        id: txn.id,
        cashier: txn.cashier,
        item: item.name,
        quantity: item.quantity,
        price: item.price,
        lineTotal: calculateLineTotal(item)
      });
    });
  });
  return rows;
};

// ==========================
// Rendering Functions
// ==========================
function renderSummary() {
  const totalRevenue = filteredData.reduce((acc, txn) => {
    const txnTotal = txn.items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    return acc + txnTotal;
  }, 0);

  const totalItems = filteredData.reduce((acc, txn) => {
    const txnItems = txn.items.reduce((sum, item) => sum + item.quantity, 0);
    return acc + txnItems;
  }, 0);

  const transactionsCount = filteredData.length;
  const averageOrder = transactionsCount ? totalRevenue / transactionsCount : 0;

  document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('totalTransactions').textContent = transactionsCount.toString();
  document.getElementById('totalItems').textContent = totalItems.toString();
  document.getElementById('averageOrderValue').textContent = formatCurrency(averageOrder);
}

function renderTable() {
  const tbody = document.getElementById('reportTableBody');
  const noDataMessage = document.getElementById('noDataMessage');
  tbody.innerHTML = '';

  const rows = flattenTransactions(filteredData);

  if (!rows.length) {
    noDataMessage.hidden = false;
    return;
  }

  noDataMessage.hidden = true;

  rows
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(row.date)}</td>
        <td>${row.id}</td>
        <td>${row.item}</td>
        <td>${row.quantity}</td>
        <td>${formatCurrency(row.price)}</td>
        <td>${formatCurrency(row.lineTotal)}</td>
      `;
      tbody.appendChild(tr);
    });
}

// ==========================
// Filtering & Actions
// ==========================
function applyFilters() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  filteredData = salesData.filter((txn) => {
    const txnDate = new Date(txn.date);
    if (startDate && txnDate < new Date(startDate)) return false;
    if (endDate && txnDate > new Date(endDate)) return false;
    return true;
  });

  updateDateRangeLabel(startDate, endDate);
  renderSummary();
  renderTable();
}

function resetFilters() {
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  filteredData = [...salesData];
  updateDateRangeLabel();
  renderSummary();
  renderTable();
}

function updateDateRangeLabel(startDate, endDate) {
  const label = document.getElementById('dateRangeLabel');
  if (!startDate && !endDate) {
    label.textContent = 'All Dates';
    return;
  }

  const start = startDate ? formatDate(startDate) : 'Start';
  const end = endDate ? formatDate(endDate) : 'Today';
  label.textContent = `${start} - ${end}`;
}

function exportToCsv() {
  const rows = flattenTransactions(filteredData);
  if (!rows.length) {
    alert('No transactions to export.');
    return;
  }

  const header = ['Date', 'Transaction ID', 'Item', 'Quantity', 'Price', 'Line Total'];
  const csvRows = [header.join(',')];

  rows.forEach((row) => {
    const csvRow = [
      row.date,
      row.id,
      `"${row.item}"`,
      row.quantity,
      row.price.toFixed(2),
      row.lineTotal.toFixed(2)
    ];
    csvRows.push(csvRow.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function printReport() {
  const rows = flattenTransactions(filteredData);
  if (!rows.length) {
    alert('No transactions to print.');
    return;
  }

  const printWindow = window.open('', '_blank');
  const totalRevenue = document.getElementById('totalRevenue').textContent;
  const totalTransactions = document.getElementById('totalTransactions').textContent;
  const totalItems = document.getElementById('totalItems').textContent;
  const avgOrder = document.getElementById('averageOrderValue').textContent;

  const tableRows = rows
    .map((row) => `
      <tr>
        <td>${formatDate(row.date)}</td>
        <td>${row.id}</td>
        <td>${row.item}</td>
        <td style="text-align:right;">${row.quantity}</td>
        <td style="text-align:right;">${formatCurrency(row.price)}</td>
        <td style="text-align:right;">${formatCurrency(row.lineTotal)}</td>
      </tr>
    `)
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Sales Report</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 24px; }
          h1 { text-align: center; margin-bottom: 24px; }
          .summary { display: flex; gap: 1.5rem; margin-bottom: 24px; }
          .summary div { flex: 1; background: #f1f5f9; padding: 1rem; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 0.65rem; border: 1px solid #cbd5f5; }
          th { background: #1d4ed8; color: white; }
        </style>
      </head>
      <body>
        <h1>Sales Report</h1>
        <div class="summary">
          <div><strong>Total Revenue</strong><br>${totalRevenue}</div>
          <div><strong>Transactions</strong><br>${totalTransactions}</div>
          <div><strong>Items Sold</strong><br>${totalItems}</div>
          <div><strong>Average Order</strong><br>${avgOrder}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction ID</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <script>window.print(); window.onafterprint = () => window.close();<\/script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

// ==========================
// Logout Handler (shared behavior)
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    window.location.href = '/TESDAPOS/LandingPage/LandingPage.html';
  }
}

// ==========================
// Initialization
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  renderSummary();
  renderTable();
  updateDateRangeLabel();

  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('exportCsv').addEventListener('click', exportToCsv);
  document.getElementById('printReport').addEventListener('click', printReport);
});

