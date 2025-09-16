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
  <title>TESDA POS - Create Products</title>
  <link rel="stylesheet" href="../assets/css/CreateProducts.css">
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
        <li><a href="CreateProducts.php" class="active"><i class="fas fa-cart-plus"></i><span>Create Products</span></a></li>
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
          <h2>Create Products</h2>
        </div>
        <div class="topbar-right">
          <input type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>

      <!-- Create Products Section -->
      <section id="products" class="page-section">
        <form id="createProductForm">
          <div class="form-grid">
            <label>
              Product Name:
              <input type="text" name="productName" required pattern="[A-Za-z ]+">
            </label>
            <label>
              Category:
              <select name="category" required>
                <option value="">-- Select Category --</option>
                <option value="food">Food</option>
                <option value="beverage">Beverage</option>
                <option value="snacks">Snacks</option>
                <option value="others">Others</option>
              </select>
            </label>
            <label>
              Price:
              <input type="number" name="price" min="0" required>
            </label>
            <label>
              Stock Quantity:
              <input type="number" name="stock" min="0" required>
            </label>
            <label>
              Upload Photo:
              <input type="file" name="photo" accept="image/*">
            </label>
          </div>
          <button type="submit" class="btn-submit">
            <i class="fas fa-plus-circle"></i> Add Product
          </button>
        </form>
      </section>

    </main>
  </div>

  <!-- Confirmation Modal -->
  <div id="confirmationModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modalTitle">Confirm Action</h3>
        <span class="close" onclick="closeModal()">&times;</span>
      </div>
      <div class="modal-body">
        <p id="modalMessage">Are you sure you want to proceed?</p>
      </div>
      <div class="modal-footer">
        <button id="modalConfirm" class="btn-confirm">Yes</button>
        <button id="modalCancel" class="btn-cancel" onclick="closeModal()">No</button>
      </div>
    </div>
  </div>

  <!-- Edit Product Modal -->
  <div id="editModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Edit Product</h3>
        <span class="close" onclick="closeEditModal()">&times;</span>
      </div>
      <div class="modal-body">
        <form id="editProductForm">
          <input type="hidden" id="editProductId">
          <div class="form-grid">
            <label>
              Product Name:
              <input type="text" id="editProductName" required pattern="[A-Za-z ]+">
            </label>
            <label>
              Category:
              <select id="editCategory" required>
                <option value="">-- Select Category --</option>
                <option value="food">Food</option>
                <option value="beverage">Beverage</option>
                <option value="snacks">Snacks</option>
                <option value="others">Others</option>
              </select>
            </label>
            <label>
              Price:
              <input type="number" id="editPrice" min="0" required>
            </label>
            <label>
              Stock Quantity:
              <input type="number" id="editStock" min="0" required>
            </label>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button id="saveEdit" class="btn-confirm">Save</button>
        <button class="btn-cancel" onclick="closeEditModal()">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Notification Toast -->
  <div id="toast" class="toast">
    <div class="toast-content">
      <i id="toastIcon" class="fas fa-check-circle"></i>
      <span id="toastMessage">Message</span>
    </div>
  </div>

  <!-- JS -->
  <script src="../assets/js/CreateProducts.js"></script>
</body>
</html>