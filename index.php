<?php
session_start();

// Check if user is already logged in
if (isset($_SESSION['user_role']) && isset($_SESSION['user_id'])) {
    // Redirect based on role
    switch ($_SESSION['user_role']) {
        case 'admin':
            header('Location: admin/dashboard.php');
            break;
        case 'manager':
            header('Location: manager/dashboard.php');
            break;
        case 'cashier':
            header('Location: cashier/dashboard.php');
            break;
        case 'inventory':
            header('Location: inventory/dashboard.php');
            break;
        case 'customer':
            header('Location: menu/menu.html');
            break;
        default:
            header('Location: LandingPage/index.html');
    }
    exit();
}

// If not logged in, redirect to landing page
header('Location: LandingPage/index.html');
exit();
?> 