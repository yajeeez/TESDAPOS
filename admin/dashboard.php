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
                <form id="inventoryForm">
                    <div class="form-group">
                        <label for="itemName">Item Name:</label>
                        <input type="text" id="itemName" name="itemName" required>
                    </div>
                    <div class="form-group">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" name="quantity" required>
                    </div>
                    <div class="form-group">
                        <label for="price">Price:</label>
                        <input type="number" id="price" name="price" step="0.01" required>
                    </div>
                    <button type="submit" class="btn">Add Item</button>
                </form>
                
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

    <script src="assets/css/js/AdminDashboard.js"></script>
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