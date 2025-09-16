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
  <title>TESDA POS - Inventory</title>
  <link rel="stylesheet" href="../assets/css/Inventory.css">
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
        <li><a href="AdminDashboard.php"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
        <li><a href="Orders.php"><i class="fas fa-receipt"></i><span>Manage Orders</span></a></li>
        <li><a href="CreateProducts.php"><i class="fas fa-cart-plus"></i><span>Create Products</span></a></li>
        <li><a href="Inventory.php" class="active"><i class="fas fa-boxes"></i><span>Inventory</span></a></li>
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
          <h2>Inventory</h2>
        </div>
        <div class="topbar-right">
          <input type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>

      <!-- Inventory Section -->
      <section id="inventory" class="page-section">
        <div class="filter-bar">
          <label for="categoryFilter">Filter by Category:</label>
          <select id="categoryFilter" onchange="renderInventory()">
            <option value="all">All Categories</option>
            <option value="food">Food</option>
            <option value="beverage">Beverage</option>
            <option value="snack">Snack</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div id="inventoryList"></div>
      </section>

    </main>
  </div>

  <!-- Update Product Modal -->
  <div id="updateProductModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Update Product</h2>
        <span class="close" onclick="closeUpdateModal()">&times;</span>
      </div>
      <form id="updateProductForm" enctype="multipart/form-data">
        <input type="hidden" id="updateProductId" name="product_id">
        
        <div class="form-group">
          <label for="updateProductName">Product Name:</label>
          <input type="text" id="updateProductName" name="product_name" required>
        </div>
        
        <div class="form-group">
          <label for="updateCategory">Category:</label>
          <select id="updateCategory" name="category" required>
            <option value="">-- Select Category --</option>
            <option value="Food">Food</option>
            <option value="Beverage">Beverage</option>
            <option value="Snack">Snack</option>
            <option value="Others">Others</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="updatePrice">Price:</label>
          <input type="number" id="updatePrice" name="price" min="0" step="0.01" required>
        </div>
        
        <div class="form-group">
          <label for="updateStockQuantity">Stock Quantity:</label>
          <input type="number" id="updateStockQuantity" name="stock_quantity" min="0" required>
        </div>
        
        <div class="form-group">
          <label for="updatePhoto">Product Photo:</label>
          <input type="file" id="updatePhoto" name="photo" accept="image/*">
          <div id="currentPhotoPreview" class="photo-preview"></div>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn-cancel" onclick="closeUpdateModal()">Cancel</button>
          <button type="submit" class="btn-update">Update Product</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Notification Toast -->
  <div id="notificationToast" class="toast">
    <div class="toast-content">
      <i class="fas fa-check-circle"></i>
      <span id="toastMessage">Product updated successfully!</span>
    </div>
  </div>

  <!-- JS -->
  <script src="../assets/js/Inventory.js"></script>
</body>
</html>