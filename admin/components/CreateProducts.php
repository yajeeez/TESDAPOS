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
AuditLogger::log('page_access', 'Accessed Create Products page');

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
        <li><a href="change_password.php"><i class="fas fa-key"></i><span>Change Password</span></a></li>
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
        <div class="section-header">
          <div class="header-content">
          </div>
        </div>
        
        <div class="form-container">
          <form id="createProductForm">
            <div class="form-grid">
              <div class="form-group">
                <label for="productName">
                  <i class="fas fa-tag"></i>
                  Product Name
                </label>
                <input type="text" id="productName" name="productName" required pattern="[A-Za-z ]+" placeholder="Enter product name">
              </div>
              
              <div class="form-group">
                <label for="category">
                  <i class="fas fa-list"></i>
                  Category
                </label>
                <select id="category" name="category" required>
                  <option value="">-- Select Category --</option>
                  <option value="food">Food</option>
                  <option value="beverage">Beverage</option>
                  <option value="snack">Snack</option>
                  <option value="others">Others</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="price">
                  <i class="fas fa-peso-sign"></i>
                  Price
                </label>
                <input type="number" id="price" name="price" min="0" step="0.01" required placeholder="0.00">
              </div>
              
              <div class="form-group">
                <label for="stock">
                  <i class="fas fa-boxes"></i>
                  Stock Quantity
                </label>
                <input type="number" id="stock" name="stock" min="0" required placeholder="0">
              </div>
              
              <div class="form-group photo-upload-group">
                <label for="photo">
                  <i class="fas fa-camera"></i>
                  Product Photo
                </label>
                <div class="file-upload-container">
                  <input type="file" id="photo" name="photo" accept="image/*">
                  <div class="file-upload-display">
                    <div class="upload-icon">
                      <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="upload-text">
                      <span class="upload-main">Click to upload photo</span>
                      <span class="upload-sub">or drag and drop</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-group preview-group">
                <label>
                  <i class="fas fa-eye"></i>
                  Photo Preview
                </label>
                <div id="photoPreview" class="photo-preview">
                  <div class="preview-placeholder">
                    <i class="fas fa-image"></i>
                    <span>No image selected</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="reset" class="btn btn-secondary">
                <div class="btn-content">
                  <i class="fas fa-undo"></i>
                  <span>Reset Form</span>
                </div>
                <div class="btn-ripple"></div>
              </button>
              
              <button type="submit" class="btn btn-primary">
                <div class="btn-content">
                  <i class="fas fa-plus-circle"></i>
                  <span>Add Product</span>
                </div>
                <div class="btn-ripple"></div>
              </button>
            </div>
          </form>
        </div>
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