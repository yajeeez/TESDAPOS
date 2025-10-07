<?php
// Disable output buffering and error display to prevent HTML in JSON response
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Start output buffering to catch any unwanted output
ob_start();

// Handle preflight OPTIONS request first
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
    http_response_code(200);
    exit();
}

// Set headers for actual request
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ob_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    ob_end_flush();
    exit();
}

try {
    // Check if vendor autoload exists
    if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
        throw new Exception('Composer dependencies not installed. Run: composer install');
    }
    
    require_once __DIR__ . '/../vendor/autoload.php';
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../connection/MongoInventory.php';
    
    // Check if MongoDB extension is loaded
    if (!extension_loaded('mongodb')) {
        throw new Exception('MongoDB PHP extension is not installed. Please install the mongodb extension.');
    }
    
    $mongo = new MongoInventory();
    $result = $mongo->getAllProducts();
    
    if ($result['success']) {
        // Add full URL to image paths for frontend consumption
        $products = $result['products'];
        foreach ($products as &$product) {
            if (!empty($product['image_path'])) {
                // Ensure the image path is properly formatted
                $product['image_path'] = str_replace('\\', '/', $product['image_path']);
            }
        }
        
        // Clean the output buffer before sending JSON
        ob_clean();
        echo json_encode([
            'success' => true,
            'products' => $products,
            'count' => count($products)
        ], JSON_UNESCAPED_SLASHES);
    } else {
        ob_clean();
        echo json_encode($result, JSON_UNESCAPED_SLASHES);
    }
    
} catch (Exception $e) {
    error_log("Error in fetch_products.php: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false, 
        'message' => 'Server error occurred: ' . $e->getMessage(),
        'error_type' => get_class($e)
    ], JSON_UNESCAPED_SLASHES);
}

ob_end_flush();
?>