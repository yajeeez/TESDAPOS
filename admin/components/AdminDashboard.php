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
  <title>TESDA POS Admin</title>
  <link rel="stylesheet" href="../assets/css/AdminDashboard.css">
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
        <li><a href="AdminDashboard.php" class="active"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
        <li><a href="Orders.php"><i class="fas fa-receipt"></i><span>Manage Orders</span></a></li>
        <li><a href="CreateProducts.php"><i class="fas fa-cart-plus"></i><span>Create Products</span></a></li>
        <li><a href="Inventory.php"><i class="fas fa-boxes"></i><span>Inventory</span></a></li>
        <li><a href="Transactions.php"><i class="fas fa-cash-register"></i><span>Transactions</span></a></li>
        <li><a href="Maintenance.php"><i class="fas fa-tools"></i><span>Maintenance</span></a></li>
        <li><a href="#" onclick="logout(event)"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
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
          <div class="filter-controls" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; align-items: end;">
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label for="filterStartDate" style="font-size: 0.85rem; font-weight: 600; color: #555;">Start Date</label>
              <input type="date" id="filterStartDate" class="filter-input" style="padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;" />
            </div>
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label for="filterEndDate" style="font-size: 0.85rem; font-weight: 600; color: #555;">End Date</label>
              <input type="date" id="filterEndDate" class="filter-input" style="padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;" />
            </div>
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label for="filterCashier" style="font-size: 0.85rem; font-weight: 600; color: #555;">Cashier</label>
              <select id="filterCashier" class="filter-input" style="padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;">
                <option value="">All Cashiers</option>
              </select>
            </div>
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label for="filterStatus" style="font-size: 0.85rem; font-weight: 600; color: #555;">Status</label>
              <select id="filterStatus" class="filter-input" style="padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;">
                <option value="">All Status</option>
                <option value="Served">Served</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label for="filterPaymentMethod" style="font-size: 0.85rem; font-weight: 600; color: #555;">Payment Method</label>
              <select id="filterPaymentMethod" class="filter-input" style="padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;">
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Cashless">Cashless</option>
              </select>
            </div>
           
          </div>
        </div>

        <!-- Charts Container -->
        <div class="charts-container">

          <!-- Bar Chart -->
          <div class="chart-box">
            <h3>Dashboard Metrics (Bar Chart)</h3>
            <canvas id="barChart"></canvas>
          </div>

          <!-- Pie Chart -->
          <div class="chart-box">
            <h3>Orders Status Distribution (Pie Chart)</h3>
            <canvas id="pieChart"></canvas>
          </div>

        </div>
      </section>





      

    </main>
  </div>



  <!-- JS -->
  <script src="../assets/js/AdminDashboard.js"></script>
  <script src="../assets/js/transactions.js"></script>
  <script>
    // Initialize sales report in dashboard
    document.addEventListener('DOMContentLoaded', async () => {
      // Initialize dashboard charts
      if (typeof initDashboard === 'function') {
        initDashboard();
      }
      
      // Initialize sales report
      if (typeof fetchTransactionsFromDB === 'function') {
        await fetchTransactionsFromDB();
        updateSummaryCards();
      }
    });
  </script>
</body>
</html>
