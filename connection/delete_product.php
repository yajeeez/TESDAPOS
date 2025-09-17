<?php
// Prevent any output before JSON response
ob_start();

// Set JSON header immediately
header('Content-Type: application/json; charset=utf-8');

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Clear any previous output
ob_clean();

// Initialize response
$response = ['success' => false, 'error' => 'Unknown error'];

try {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method is allowed');
    }

    // Check if productId is provided
    if (!isset($_POST['productId']) || empty(trim($_POST['productId']))) {
        throw new Exception('Product ID is required');
    }

    $productId = trim($_POST['productId']);
    
    // Validate product ID format (should be a valid MongoDB ObjectId)
    if (strlen($productId) !== 24 || !ctype_xdigit($productId)) {
        throw new Exception('Invalid product ID format. Expected 24-character hexadecimal string.');
    }

    // Include the MongoInventory class
    require_once __DIR__ . '/MongoInventory.php';
    
    // Create MongoDB inventory instance
    $mongoInventory = new MongoInventory();
    
    // First check if the product exists
    $existingProduct = $mongoInventory->getProductById($productId);
    
    if (!$existingProduct['success']) {
        throw new Exception('Product with ID "' . htmlspecialchars($productId) . '" not found in database');
    }

    // Attempt to delete the product using the MongoInventory class
    $deleteResult = $mongoInventory->deleteProduct($productId);
    
    if ($deleteResult['success']) {
        $response = [
            'success' => true,
            'message' => 'Product deleted successfully',
            'deleted_id' => $productId,
            'product_name' => $existingProduct['product']['product_name'] ?? 'Unknown Product'
        ];
    } else {
        throw new Exception($deleteResult['message'] ?? 'Failed to delete product from database');
    }

} catch (Exception $error) {
    $response = [
        'success' => false,
        'error' => $error->getMessage(),
        'type' => 'error'
    ];
}

// Clear output buffer and send clean JSON response
ob_end_clean();
echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit();
?>