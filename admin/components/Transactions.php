<!DOCTYPE html>
<?php
// Start session and check authentication
require_once __DIR__ . '/../../includes/session.php';

// Prevent caching to avoid back navigation after logout
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');

// Require admin login
SessionManager::requireLogin();

// Check if user is admin
if (SessionManager::getUserRole() !== 'admin') {
    SessionManager::setFlashMessage('error', 'Access denied. Admin privileges required.');
    header('Location: ../../public/components/login.html');
    exit();
}

// Log page access
require_once __DIR__ . '/../../includes/audit_logger.php';
AuditLogger::log('page_access', 'Accessed Transactions page');

// Add any necessary PHP logic here

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TESDA POS - Transactions</title>
  <link rel="icon" type="image/x-icon" href="../../favicon.ico">
  <link rel="stylesheet" href="../assets/css/Transactions.css">
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
        <li><a href="AdminDashboard.php"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
        <li><a href="Orders.php"><i class="fas fa-receipt"></i><span>Manage Orders</span></a></li>
        <li><a href="CreateProducts.php"><i class="fas fa-cart-plus"></i><span>Create Products</span></a></li>
        <li><a href="Inventory.php"><i class="fas fa-boxes"></i><span>Inventory</span></a></li>
        <li><a href="Transactions.php" class="active"><i class="fas fa-cash-register"></i><span>Transactions</span></a></li>
        <li><a href="Maintenance.php"><i class="fas fa-tools"></i><span>Maintenance</span></a></li>
        <li><a href="change_password.php"><i class="fas fa-key"></i><span>Change Password</span></a></li>
        <li><a href="#" onclick="logout(event)"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="main">

      <!-- Topbar -->
      <div class="topbar">
        <div class="topbar-left">
          <h2>Transactions</h2>
        </div>
        <div class="topbar-right">
          <input type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>

      <!-- Transactions Section -->
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
              <!-- Transactions dynamically loaded via JS -->
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>

  <!-- Generate Report Button -->
  <button class="generate-report-btn" onclick="generateReport()">
    <i class="fas fa-file-export"></i> Generate Report
  </button>

  <!-- JS -->
  <script src="../assets/js/AdminDashboard.js"></script>
  <script src="../assets/js/transactions.js"></script>
  <script>
    // Initialize transactions without sales report features
    document.addEventListener('DOMContentLoaded', async () => {
      await fetchTransactionsFromDB();
      renderTransactions();
    });
  </script>
</body>
</html>