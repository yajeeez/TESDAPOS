<?php
require_once '../includes/session.php';
SessionManager::requireRole('admin');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - TESDA POS</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
        }

        .dashboard-container {
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar */
        #sidebar {
            width: 250px;
            background: #2c3e50;
            color: white;
            transition: width 0.3s ease;
            overflow: hidden;
        }

        #sidebar.collapsed {
            width: 60px;
        }

        .sidebar-header {
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #34495e;
        }

        .sidebar-header img {
            width: 40px;
            height: 40px;
            margin-bottom: 10px;
        }

        .sidebar-header h3 {
            font-size: 18px;
            margin-bottom: 5px;
        }

        .sidebar-header p {
            font-size: 12px;
            opacity: 0.8;
        }

        .sidebar-nav {
            padding: 20px 0;
        }

        .nav-item {
            padding: 15px 20px;
            cursor: pointer;
            transition: background 0.3s ease;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .nav-item:hover {
            background: #34495e;
        }

        .nav-item.active {
            background: #3498db;
        }

        .nav-item i {
            width: 20px;
            text-align: center;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            padding: 20px;
            background: #f8f9fa;
        }

        .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .toggle-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            background: #3498db;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }

        .logout-btn {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
        }

        /* Page Sections */
        .page-section {
            display: none;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }

        .page-section.active {
            display: block;
        }

        .page-section h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 24px;
        }

        /* Forms */
        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #2c3e50;
        }

        .form-group input, .form-group select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }

        .btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 10px;
        }

        .btn:hover {
            background: #2980b9;
        }

        .btn-danger {
            background: #e74c3c;
        }

        .btn-danger:hover {
            background: #c0392b;
        }

        /* Inventory Items */
        .inventory-item {
            background: #f8f9fa;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }

        .inventory-item button {
            margin-left: 10px;
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }

        .inventory-item button:first-of-type {
            background: #f39c12;
            color: white;
        }

        .inventory-item button:last-of-type {
            background: #e74c3c;
            color: white;
        }

        /* Filter Bar */
        .filter-bar {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .filter-bar label {
            font-weight: 600;
            color: #333;
        }

        .filter-bar select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            font-size: 14px;
        }

        /* Loading and Error Messages */
        .loading-message,
        .empty-message,
        .error-message {
            text-align: center;
            padding: 2rem;
            color: #666;
            font-size: 1.1rem;
            background: #f8f9fa;
            border-radius: 12px;
            margin: 1rem 0;
        }

        .loading-message {
            color: #3498db;
        }

        .error-message {
            color: #e74c3c;
            background: #ffe6e6;
            border: 1px solid #ffcccc;
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.3s ease;
        }

        .modal-content {
            background-color: #fff;
            margin: 5% auto;
            padding: 0;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
        }

        .modal-header {
            background: linear-gradient(135deg, #004aad, #002b80);
            color: #fff;
            padding: 1.5rem;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }

        .close {
            color: #fff;
            font-size: 2rem;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.2s ease;
        }

        .close:hover {
            color: #ffc107;
        }

        #updateProductForm {
            padding: 2rem;
        }

        #updateProductForm .form-group {
            margin-bottom: 1.5rem;
        }

        #updateProductForm label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
        }

        #updateProductForm input,
        #updateProductForm select {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.2s ease;
        }

        #updateProductForm input:focus,
        #updateProductForm select:focus {
            outline: none;
            border-color: #004aad;
            box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1);
        }

        .photo-preview {
            margin-top: 1rem;
            text-align: center;
        }

        .photo-preview img {
            max-width: 200px;
            max-height: 150px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e1e5e9;
        }

        .btn-cancel,
        .btn-update {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-cancel {
            background: #6c757d;
            color: #fff;
        }

        .btn-cancel:hover {
            background: #5a6268;
        }

        .btn-update {
            background: #004aad;
            color: #fff;
        }

        .btn-update:hover {
            background: #002b80;
            transform: translateY(-1px);
        }

        /* Toast Notification */
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: #fff;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        }

        .toast.show {
            transform: translateX(0);
        }

        .toast-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .toast-content i {
            font-size: 1.2rem;
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
            from { 
                opacity: 0;
                transform: translateY(-50px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            #sidebar {
                position: fixed;
                left: -250px;
                height: 100vh;
                z-index: 1000;
            }

            #sidebar.active {
                left: 0;
            }

            .main-content {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <div id="sidebar">
            <div class="sidebar-header">
                <img src="../img/TESDALOGO.png" alt="TESDA Logo">
                <h3>TESDA POS</h3>
                <p>Admin Panel</p>
            </div>
            
            <div class="sidebar-nav">
                <div class="nav-item active" onclick="showSection('dashboard')">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </div>
                <div class="nav-item" onclick="showSection('inventory')">
                    <i class="fas fa-boxes"></i>
                    <span>Inventory</span>
                </div>
                <div class="nav-item" onclick="showSection('orders')">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Orders</span>
                </div>
                <div class="nav-item" onclick="showSection('menu')">
                    <i class="fas fa-utensils"></i>
                    <span>Menu</span>
                </div>
                <div class="nav-item" onclick="showSection('reports')">
                    <i class="fas fa-chart-bar"></i>
                    <span>Reports</span>
                </div>
                <div class="nav-item" onclick="showSection('trainees')">
                    <i class="fas fa-users"></i>
                    <span>Trainees</span>
                </div>
                <div class="nav-item" onclick="showSection('maintenance')">
                    <i class="fas fa-tools"></i>
                    <span>Maintenance</span>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="top-bar">
                <button class="toggle-btn" onclick="toggleSidebar()">
                    <i class="fas fa-bars"></i>
                </button>
                
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <h4><?php echo htmlspecialchars($_SESSION['username'] ?? 'Admin'); ?></h4>
                        <p>Administrator</p>
                    </div>
                    <a href="assets/logout.php" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>

            <!-- Dashboard Section -->
            <div id="dashboard" class="page-section active">
                <h2>Welcome to Admin Dashboard</h2>
                <p>Manage your TESDA POS system from here. Use the sidebar to navigate between different modules.</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
                    <div style="background: #3498db; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                        <i class="fas fa-boxes" style="font-size: 40px; margin-bottom: 10px;"></i>
                        <h3>Inventory</h3>
                        <p>Manage stock and items</p>
                    </div>
                    <div style="background: #e74c3c; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                        <i class="fas fa-shopping-cart" style="font-size: 40px; margin-bottom: 10px;"></i>
                        <h3>Orders</h3>
                        <p>Track and manage orders</p>
                    </div>
                    <div style="background: #f39c12; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                        <i class="fas fa-chart-bar" style="font-size: 40px; margin-bottom: 10px;"></i>
                        <h3>Reports</h3>
                        <p>View sales analytics</p>
                    </div>
                    <div style="background: #27ae60; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                        <i class="fas fa-users" style="font-size: 40px; margin-bottom: 10px;"></i>
                        <h3>Trainees</h3>
                        <p>Manage user access</p>
                    </div>
                </div>
            </div>

            <!-- Inventory Section -->
            <div id="inventory" class="page-section">
                <h2>Inventory Management</h2>
                <!-- Products from database will be shown here -->
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
                <div id="inventoryList" style="margin-top: 30px;">
                    <!-- Inventory items will be displayed here -->
                </div>
            </div>

            <!-- Orders Section -->
            <div id="orders" class="page-section">
                <h2>Order Management</h2>
                <div id="ordersContent">
                    <!-- Orders will be displayed here -->
                </div>
            </div>

            <!-- Menu Section -->
            <div id="menu" class="page-section">
                <h2>Menu Management</h2>
                <div id="menuContent">
                    <!-- Menu items will be displayed here -->
                </div>
            </div>

            <!-- Reports Section -->
            <div id="reports" class="page-section">
                <h2>Reports & Analytics</h2>
                <div id="reportsContent">
                    <!-- Reports will be displayed here -->
                </div>
            </div>

            <!-- Trainees Section -->
            <div id="trainees" class="page-section">
                <h2>Trainee Access Management</h2>
                <div id="traineesContent">
                    <!-- Trainees will be displayed here -->
                </div>
            </div>

            <!-- Maintenance Section -->
            <div id="maintenance" class="page-section">
                <h2>System Maintenance</h2>
                <div id="maintenanceContent">
                    <!-- Maintenance options will be displayed here -->
                </div>
            </div>
        </div>
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

    <script src="assets/js/AdminDashboard.js"></script>
    <script>
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            // Show dashboard by default
            showSection('dashboard');
            
            // Initialize all sections
            showOrders();
            showMenu();
            showReports();
            showTrainees();
            showMaintenance();
        });
    </script>
</body>
</html> 