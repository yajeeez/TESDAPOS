<?php
require_once __DIR__ . '/session.php';
?>

<nav class="main-navigation">
    <div class="nav-container">
        <div class="nav-logo">
            <img src="<?php echo APP_URL; ?>/img/TESDALOGO.png" alt="TESDA Logo">
            <span>TESDA POS System</span>
        </div>
        
        <div class="nav-menu">
            <?php if (SessionManager::isLoggedIn()): ?>
                <div class="nav-user">
                    <span>Welcome, <?php echo htmlspecialchars(SessionManager::getFullName()); ?></span>
                    <div class="user-dropdown">
                        <button class="user-dropdown-btn">
                            <i class="fas fa-user-circle"></i>
                            <span><?php echo htmlspecialchars(SessionManager::getUserRole()); ?></span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="user-dropdown-menu">
                            <a href="<?php echo APP_URL; ?>/profile.php">
                                <i class="fas fa-user"></i> Profile
                            </a>
                            <a href="<?php echo APP_URL; ?>/change-password.php">
                                <i class="fas fa-key"></i> Change Password
                            </a>
                            <a href="<?php echo APP_URL; ?>/logout.php">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-links">
                    <?php if (SessionManager::getUserRole() === 'admin'): ?>
                        <a href="<?php echo APP_URL; ?>/admin/dashboard.php">
                            <i class="fas fa-tachometer-alt"></i> Dashboard
                        </a>
                        <a href="<?php echo APP_URL; ?>/admin/users.php">
                            <i class="fas fa-users"></i> Users
                        </a>
                        <a href="<?php echo APP_URL; ?>/admin/reports.php">
                            <i class="fas fa-chart-bar"></i> Reports
                        </a>
                    <?php elseif (SessionManager::getUserRole() === 'manager'): ?>
                        <a href="<?php echo APP_URL; ?>/manager/dashboard.php">
                            <i class="fas fa-tachometer-alt"></i> Dashboard
                        </a>
                        <a href="<?php echo APP_URL; ?>/manager/sales.php">
                            <i class="fas fa-chart-line"></i> Sales
                        </a>
                    <?php elseif (SessionManager::getUserRole() === 'cashier'): ?>
                        <a href="<?php echo APP_URL; ?>/cashier/pos.php">
                            <i class="fas fa-cash-register"></i> POS
                        </a>
                        <a href="<?php echo APP_URL; ?>/cashier/orders.php">
                            <i class="fas fa-shopping-cart"></i> Orders
                        </a>
                        <a href="<?php echo APP_URL; ?>/admin/components/CashierSalesReport.php">
                            <i class="fas fa-chart-line"></i> Sales Report
                        </a>
                    <?php elseif (SessionManager::getUserRole() === 'inventory'): ?>
                        <a href="<?php echo APP_URL; ?>/inventory/dashboard.php">
                            <i class="fas fa-boxes"></i> Inventory
                        </a>
                        <a href="<?php echo APP_URL; ?>/inventory/stock.php">
                            <i class="fas fa-warehouse"></i> Stock
                        </a>
                    <?php endif; ?>
                    
                    <a href="<?php echo APP_URL; ?>/menu/menu.php">
                        <i class="fas fa-utensils"></i> Menu
                    </a>
                </div>
            <?php else: ?>
                <div class="nav-auth">
                    <a href="<?php echo APP_URL; ?>/LandingPage/LandingPage.php" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                </div>
            <?php endif; ?>
        </div>
        
        <div class="nav-toggle">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>
</nav>

<style>
.main-navigation {
    background: #2c3e50;
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
}

.nav-logo {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-logo img {
    width: 40px;
    height: 40px;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
}

.nav-links a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: background 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.nav-links a:hover {
    background: #34495e;
}

.nav-user {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-dropdown {
    position: relative;
}

.user-dropdown-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.user-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    color: #2c3e50;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    min-width: 200px;
    display: none;
    z-index: 1000;
}

.user-dropdown:hover .user-dropdown-menu {
    display: block;
}

.user-dropdown-menu a {
    color: #2c3e50;
    text-decoration: none;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.3s ease;
}

.user-dropdown-menu a:hover {
    background: #f8f9fa;
}

.nav-toggle {
    display: none;
    flex-direction: column;
    cursor: pointer;
}

.nav-toggle span {
    width: 25px;
    height: 3px;
    background: white;
    margin: 3px 0;
    transition: 0.3s;
}

.btn {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
}

@media (max-width: 768px) {
    .nav-links, .nav-user {
        display: none;
    }
    
    .nav-toggle {
        display: flex;
    }
    
    .nav-menu.active .nav-links,
    .nav-menu.active .nav-user {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #2c3e50;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
});
</script> 