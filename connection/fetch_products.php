<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../connection/MongoInventory.php';

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
    $mongo = new MongoInventory();
    $result = $mongo->getAllProducts();
    
    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'products' => $result['products'],
            'count' => count($result['products'])
        ]);
    } else {
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    error_log("Error in fetch_products.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
}
?>