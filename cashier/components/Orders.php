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

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TESDA POS - Orders</title>
  <link rel="icon" href="../../img/TESDAG.png" type="image/png">
  <link rel="stylesheet" href="../assets/css/Orders.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
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
        <li><a href="CashierDashboard.php"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
        <li><a href="Orders.php" class="active"><i class="fas fa-receipt"></i><span>Manage Orders</span></a></li>
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
          <h2>Orders</h2>
        </div>
        <div class="topbar-right">
          <div class="user-info" style="display: flex; align-items: center; gap: 1rem; margin-right: 1rem;">
            <span style="color: #666;">Welcome, <strong><?php echo htmlspecialchars($userName); ?></strong></span>
          </div>
          <input type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>

      <!-- Orders Section -->
      <section id="orders" class="page-section">
        <div class="orders-table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Served By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="ordersList">
              <!-- Orders dynamically loaded via JS -->
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>

  <!-- JS -->
  <script>
    // Pass cashier info to JavaScript
    window.cashierInfo = {
      name: '<?php echo htmlspecialchars($userName); ?>',
      email: '<?php echo htmlspecialchars($userEmail); ?>',
      username: '<?php echo htmlspecialchars($userUsername); ?>'
    };
  </script>
  <script src="../assets/js/orders.js"></script>
</body>
</html>