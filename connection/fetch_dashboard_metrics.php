<?php
header('Content-Type: application/json');
ob_start();

// Check if vendor autoload exists
if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Composer dependencies not installed. Run: composer install'
    ], JSON_UNESCAPED_SLASHES);
    ob_end_flush();
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/MongoOrders.php';

// Check if MongoDB extension is loaded
if (!extension_loaded('mongodb')) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'MongoDB PHP extension is not installed. Please install the mongodb extension.'
    ], JSON_UNESCAPED_SLASHES);
    ob_end_flush();
    exit();
}

try {
    $mongoOrders = new MongoOrders();
    $result = $mongoOrders->getDashboardMetrics();
    
    ob_clean();
    echo json_encode($result, JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    error_log("Error in fetch_dashboard_metrics.php: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Server error occurred: ' . $e->getMessage(),
        'totalSales' => 0.0,
        'ordersToday' => 0
    ], JSON_UNESCAPED_SLASHES);
}

ob_end_flush();
?>

