<?php
// Enable error reporting for debugging
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Start output buffering
ob_start();

// Set JSON header
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/MongoInventory.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Clean output buffer
    ob_clean();
    
    // Test MongoDB connection
    $mongo = new MongoInventory();
    
    // Test basic connection
    $testResult = $mongo->getAllProducts();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection test successful',
        'mongodb_available' => extension_loaded('mongodb'),
        'php_version' => phpversion(),
        'products_count' => ($testResult['success'] && isset($testResult['products']) && is_array($testResult['products'])) ? count($testResult['products']) : 0,
        'database_status' => $testResult['success'] ? 'Connected' : 'Connection failed',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log("Database test error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database test failed: ' . $e->getMessage(),
        'mongodb_available' => extension_loaded('mongodb'),
        'php_version' => phpversion(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

ob_end_flush();
?>