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
        <li><a href="SalesReport.php"><i class="fas fa-chart-line"></i><span>Sales Report</span></a></li>
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
    <div class="modal-content modern-modal">
      <div class="modal-header">
        <div class="header-content">
          <div class="icon-container">
            <i class="fas fa-edit"></i>
          </div>
          <div class="header-text">
            <h2>Edit Product</h2>
            <p class="subtitle">Update product information</p>
          </div>
        </div>
        <button class="close-btn" onclick="closeUpdateModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form id="updateProductForm" enctype="multipart/form-data">
          <input type="hidden" id="updateProductId" name="productId">
          
          <div class="form-row">
            <div class="form-group full-width">
              <label for="updateProductName">
                <i class="fas fa-tag"></i>
                Product Name
              </label>
              <input type="text" id="updateProductName" name="productName" required placeholder="Enter product name">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="updateCategory">
                <i class="fas fa-list"></i>
                Category
              </label>
              <select id="updateCategory" name="category" required>
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Beverage">Beverage</option>
                <option value="Snack">Snack</option>
                <option value="Others">Others</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="updatePrice">
                <i class="fas fa-peso-sign"></i>
                Price
              </label>
              <input type="number" id="updatePrice" name="price" min="0" step="0.01" required placeholder="0.00">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="updateStockQuantity">
                <i class="fas fa-boxes"></i>
                Stock Quantity
              </label>
              <input type="number" id="updateStockQuantity" name="stock" min="0" required placeholder="0">
            </div>
            
            <div class="form-group">
              <label for="updatePhoto">
                <i class="fas fa-camera"></i>
                Product Photo
              </label>
              <input type="file" id="updatePhoto" name="photo" accept="image/*">
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-bottom-section">
        <div class="photo-section">
          <div class="photo-preview-container">
            <div id="currentPhotoPreview" class="photo-preview"></div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-modern-secondary" onclick="closeUpdateModal()">
            <div class="btn-content">
              <i class="fas fa-times"></i>
              <span>Cancel</span>
            </div>
            <div class="btn-ripple"></div>
          </button>
          <button type="submit" form="updateProductForm" class="btn btn-modern-primary">
            <div class="btn-content">
              <i class="fas fa-save"></i>
              <span>Update Product</span>
            </div>
            <div class="btn-ripple"></div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirmation Modal -->
  <div id="confirmationModal" class="modal">
    <div class="modal-content modern-modal delete-modal">
      <div class="modal-body delete-confirmation-body">
        <div class="delete-icon-container">
          <i class="fas fa-trash-alt"></i>
        </div>
        <h3 class="delete-title">Delete Product?</h3>
        <p id="modalMessage" class="delete-message">This action cannot be undone.</p>
      </div>
      
      <div class="modal-footer delete-footer">
        <button id="modalCancel" class="btn btn-cancel" onclick="closeConfirmationModal()">
          Cancel
        </button>
        <button id="modalConfirm" class="btn btn-delete">
          Delete
        </button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="notificationToast" class="toast">
    <i class="fas fa-check-circle"></i>
    <span id="toastMessage">Product updated successfully!</span>
  </div>

  <!-- JS -->
  <script src="../assets/js/Inventory.js"></script>
</body>
</html>