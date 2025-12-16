<!DOCTYPE html>
<?php
// Require cashier authentication
require_once __DIR__ . '/cashier_auth.php';

// Prevent caching to avoid back navigation after logout
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');

// Get cashier information from session
$cashierInfo = getCurrentCashierInfo();
$userName = $cashierInfo['name'];
$userEmail = $cashierInfo['email'];
$userUsername = $cashierInfo['username'];
$loginTime = time();

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TESDA POS Cashier</title>
  <link rel="icon" href="../../img/TESDAG.png" type="image/png">
  <link rel="stylesheet" href="../assets/css/CashierDashboard.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="dashboard">

    <!-- Sidebar -->
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <img src="../../img/TESDAG.png" alt="TESDA Logo" class="tesda-logo" />
      </div>
      <h2>TESDA POS</h2>
      <ul>
        <li><a href="CashierDashboard.php" class="active"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
        <li><a href="Orders.php"><i class="fas fa-receipt"></i><span>Manage Orders</span></a></li>
        <li><a href="Transactions.php"><i class="fas fa-cash-register"></i><span>Transactions</span></a></li>
        <li><a href="change_password.php"><i class="fas fa-key"></i><span>Change Password</span></a></li>
        <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="main">

      <!-- Topbar -->
      <div class="topbar">
        <div class="topbar-left">
          <h2>Dashboard</h2>
        </div>
        <div class="topbar-right">
          <div class="user-info" style="display: flex; align-items: center; gap: 1rem; margin-right: 1rem;">
            <span style="color: #666;">Welcome, <strong><?php echo htmlspecialchars($userName); ?></strong></span>
          </div>
          <input type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>

      <!-- Dashboard Section -->
      <section id="dashboard" class="page-section">

        <!-- Summary Cards -->
        <div class="cards">
          <div class="card">
            <h3>Total Sales</h3>
            <p id="dashboardTotalSales">₱0.00</p>
          </div>
          <div class="card">
            <h3>Orders Today</h3>
            <p id="dashboardOrdersToday">0</p>
          </div>
          <div class="card">
            <h3>Total Products</h3>
            <p id="dashboardTotalProducts">0</p>
          </div>
          <div class="card">
            <h3>Low Stock Items</h3>
            <p id="dashboardLowStock">0</p>
          </div>
        </div>

        <!-- Filter Section -->
        <div class="filter-section" style="background: var(--white); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h3 style="color: var(--tesda-blue); margin-bottom: 1rem;">
            <i class="fas fa-filter"></i> Filter Sales Report
          </h3>
          <div class="filter-controls" style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: flex-end; justify-content: flex-start;">
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label for="filterStartDate" style="font-size: 0.85rem; font-weight: 600; color: #555;">Date</label>
              <input type="date" id="filterStartDate" class="filter-input" style="padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;" />
            </div>

            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <!-- Cashier filter removed -->
            </div>
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label for="filterStatus" style="font-size: 0.85rem; font-weight: 600; color: #555;">Status</label>
              <select id="filterStatus" class="filter-input" style="padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;">
                <option value="">All Status</option>
                <option value="Served">Served</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label for="filterPaymentMethod" style="font-size: 0.85rem; font-weight: 600; color: #555;">Payment Method</label>
              <select id="filterPaymentMethod" class="filter-input" style="padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;">
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Cashless">Credit or Debit Card</option>
              </select>
            </div>
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <button id="exportCsvBtn" class="export-btn" style="padding: 0.69rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; background: var(--tesda-blue); color: #ddd; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onmouseover="this.style.background='linear-gradient(135deg, var(--tesda-dark), var(--tesda-blue))'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.2)'; this.style.border='1px solid var(--tesda-dark)'; this.style.color='#0f2940'" onmouseout="this.style.background='var(--tesda-blue)'; this.style.transform='translateY(0px)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'; this.style.border='1px solid #ddd'; this.style.color='#ddd'">
                <i class="fas fa-file-csv"></i> Export CSV
              </button>
            </div>
          </div>
        </div>

        <!-- Charts Container -->
        <div class="charts-container">

          <!-- Bar Chart -->
          <div class="chart-box">
            <h3>Dashboard Metrics Overview (Bar Chart)</h3>
            <canvas id="barChart"></canvas>
          </div>

          <!-- Pie Chart -->
          <div class="chart-box">
            <h3>All Metrics Distribution (Pie Chart)</h3>
            <canvas id="pieChart"></canvas>
          </div>

        </div>
      </section>

    </main>
  </div>

  <!-- JS -->
  <script src="../assets/js/CashierDashboard.js"></script>
  <script>
    // Cashier-specific transaction fetching
    let transactionsData = [];
    let filteredTransactions = [];
    
    async function fetchTransactionsFromDB() {
      try {
        console.log('Fetching cashier-specific transactions...');
        
        // Use cashier-specific endpoint that filters by logged-in cashier
        const response = await fetch('/TESDAPOS/cashier/fetch_cashier_orders.php', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.orders) {
          transactionsData = data.orders;
          filteredTransactions = [...transactionsData];
          console.log(`Loaded ${transactionsData.length} transactions for cashier: ${data.cashier_username || 'unknown'}`);
          return true;
        } else {
          throw new Error(data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching cashier transactions:', error);
        transactionsData = [];
        filteredTransactions = [];
        return false;
      }
    }
    
    function applyFilters() {
      const startInput = document.getElementById('filterStartDate');
      const statusSelect = document.getElementById('filterStatus');
      const paymentSelect = document.getElementById('filterPaymentMethod');

      const startDate = startInput?.value ? new Date(startInput.value + 'T00:00:00') : null;
      const status = statusSelect?.value || '';
      const paymentMethod = paymentSelect?.value || '';

      filteredTransactions = transactionsData.filter((txn) => {
        const txnDateString = txn.created_at || txn.date;
        if (!txnDateString) return false;
        
        const txnDate = new Date(txnDateString);
        if (isNaN(txnDate.getTime())) return false;
        
        // Date filter
        if (startDate && txnDate < startDate) return false;
        
        // Status filter
        if (status && txn.status !== status) return false;
        
        // Payment method filter
        if (paymentMethod && txn.payment_method !== paymentMethod) return false;
        
        return true;
      });
      
      console.log(`Filtered to ${filteredTransactions.length} transactions`);
    }
    
    function exportToCSV() {
      const transactionsToExport = filteredTransactions.length > 0 ? filteredTransactions : transactionsData;
      
      if (!transactionsToExport.length) {
        alert('No transactions to export');
        return;
      }

      const headers = ['Order ID', 'Date', 'Cashier', 'Payment Method', 'Status', 'Items', 'Quantity', 'Total Amount'];
      
      const csvRows = transactionsToExport.map(transaction => {
        const items = transaction.items || [];
        const itemsCount = transaction.total_item_count || items.length;
        const itemsDetails = items.map(item => 
          `${item.name || item.product_name} (${item.quantity}x @ ₱${item.price})`
        ).join('; ');

        const paymentMethod = transaction.payment_method || 'Cash';

        return [
          transaction.order_id || transaction.id || '',
          transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : (transaction.date || ''),
          transaction.cashier_name || '',
          paymentMethod,
          transaction.status || 'Pending',
          `"${itemsDetails}"`,
          itemsCount.toString(),
          transaction.total_amount || '0.00'
        ];
      });

      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const startDate = document.getElementById('filterStartDate')?.value || 'all';
      const filename = `cashier_sales_report_${startDate}.csv`;
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Exported ${transactionsToExport.length} transaction(s) to CSV`);
    }
    
    document.addEventListener('DOMContentLoaded', async () => {
      console.log('🚀 Initializing Cashier Dashboard...');
      
      // First, fetch the cashier-specific transactions
      const fetchSuccess = await fetchTransactionsFromDB();
      console.log('📊 Transactions fetched:', fetchSuccess, 'Count:', transactionsData.length);
      
      // Then initialize the dashboard with the fetched data
      if (typeof initDashboard === 'function') {
        await initDashboard();
        console.log('✅ Dashboard initialized');
      }
      
      const filterInputs = [
        'filterStartDate',
        'filterStatus',
        'filterPaymentMethod'
      ];

      filterInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
          input.addEventListener('change', async () => {
            applyFilters();
            
            setTimeout(() => {
              if (typeof refreshCharts === 'function') {
                refreshCharts();
              }
            }, 150);
          });
        }
      });
      
      // Attach CSV export button
      const exportBtn = document.getElementById('exportCsvBtn');
      if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
      }
    });
  </script>
</body>
</html>
