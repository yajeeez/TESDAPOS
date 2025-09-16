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
      <p>₱25,000</p>
    </div>
    <div class="card">
      <h3>Orders Today</h3>
      <p>45</p>
    </div>
    <div class="card">
      <h3>Active Trainees</h3>
      <p>120</p>
    </div>
    <div class="card">
      <h3>Low Stock Items</h3>
      <p>8</p>
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
</body>
</html>
