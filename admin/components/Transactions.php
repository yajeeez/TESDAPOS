<!DOCTYPE html>
<?php
// Start session and check authentication
session_start();

// Add any necessary PHP logic here

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TESDA POS - Transactions</title>
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
        <li><a href="#" onclick="logout(event)"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="main">

      <!-- Topbar -->
      <div class="topbar">
        <div class="topbar-left">
          <h2>Sales Report & Transactions</h2>
        </div>
        <div class="topbar-right">
          <button class="btn-export" onclick="exportToCSV()" title="Export to CSV">
            <i class="fas fa-file-csv"></i> Export CSV
          </button>
          <button class="btn-print" onclick="printSalesReport()" title="Print Report">
            <i class="fas fa-print"></i> Print Report
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="cards">
        <div class="card">
          <h3>Total Sales</h3>
          <p id="summaryTotalSales">₱0.00</p>
        </div>
        <div class="card">
          <h3>Transactions</h3>
          <p id="summaryTransactionsCount">0</p>
        </div>
        <div class="card">
          <h3>Items Sold</h3>
          <p id="summaryItemsSold">0</p>
        </div>
        <div class="card">
          <h3>Average Order</h3>
          <p id="summaryAverageOrder">₱0.00</p>
        </div>
      </div>

      <!-- Filter Section -->
      <section class="page-section filter-section">
        <h3 style="color: var(--tesda-blue); margin-bottom: 1rem;">
          <i class="fas fa-filter"></i> Filter Sales Report
        </h3>
        <div class="filter-controls">
          <div class="filter-group">
            <label for="filterStartDate">Start Date</label>
            <input type="date" id="filterStartDate" class="filter-input" />
          </div>
          <div class="filter-group">
            <label for="filterEndDate">End Date</label>
            <input type="date" id="filterEndDate" class="filter-input" />
          </div>
          <div class="filter-group">
            <label for="filterCashier">Cashier</label>
            <select id="filterCashier" class="filter-input">
              <option value="">All Cashiers</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filterStatus">Status</label>
            <select id="filterStatus" class="filter-input">
              <option value="">All Status</option>
              <option value="Served">Served</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filterPaymentMethod">Payment Method</label>
            <select id="filterPaymentMethod" class="filter-input">
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Cashless">Cashless</option>
            </select>
          </div>
          <div class="filter-actions">
            <button class="btn-filter" onclick="applyFilters()">
              <i class="fas fa-search"></i> Apply Filters
            </button>
            <button class="btn-reset" onclick="resetFilters()">
              <i class="fas fa-redo"></i> Reset
            </button>
          </div>
        </div>
      </section>

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

  <!-- JS -->
  <script src="../assets/js/AdminDashboard.js"></script>
  <script src="../assets/js/transactions.js"></script>
</body>
</html>