<!DOCTYPE html>
<?php
// Get cashier information from database
require_once __DIR__ . '/cashier_auth.php';

$cashierInfo = getCurrentCashierInfo();
$userName = $cashierInfo['name'];
$userEmail = $cashierInfo['email'];
$userUsername = $cashierInfo['username'];

// Log page access
require_once __DIR__ . '/../../includes/audit_logger.php';
AuditLogger::log('page_access', 'Accessed Cashier Transactions page');
?>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TESDA POS - Transactions (Cashier)</title>
  <link rel="icon" type="image/x-icon" href="../../favicon.ico">
  <link rel="stylesheet" href="../assets/css/Transactions.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="dashboard">

    <nav class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <img src="../../img/TESDAG.png" alt="TESDA Logo" class="tesda-logo" />
      </div>
      <h2>TESDA POS</h2>
      <ul>
        <li><a href="CashierDashboard.php"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
        <li><a href="Orders.php"><i class="fas fa-receipt"></i><span>Manage Orders</span></a></li>
        <li><a href="Transactions.php" class="active"><i class="fas fa-cash-register"></i><span>Transactions</span></a></li>
        <li><a href="change_password.php"><i class="fas fa-key"></i><span>Change Password</span></a></li>
        <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
      </ul>
    </nav>

    <main class="main">
      <div class="topbar">
        <div class="topbar-left">
          <h2>Transactions</h2>
        </div>
        <div class="topbar-right">
          <div class="user-info" style="display: flex; align-items: center; gap: 1rem; margin-right: 1rem;">
            <span style="color: #666;">Welcome, <strong><?php echo htmlspecialchars($userName); ?></strong></span>
          </div>
          <input type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>

      <section id="transactions" class="page-section">
        <div class="section-header">
          <h3 style="color: var(--tesda-blue); margin-bottom: 1rem;">
            <i class="fas fa-cash-register"></i> Transaction Details
          </h3>
        </div>
        <div class="orders-table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Cashier</th>
                <th>Items</th>
                <th>Quantity</th>
                <th>Payment Method</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="transactionsList">
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>

  <button class="generate-report-btn" onclick="generateReport()">
    <i class="fas fa-file-export"></i> Generate Report
  </button>

  <script src="../assets/js/Transactions.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      if (typeof fetchTransactionsFromDB === 'function') {
        await fetchTransactionsFromDB();
      }
      if (typeof renderTransactions === 'function') {
        renderTransactions();
      }
    });
  </script>
</body>
</html>
