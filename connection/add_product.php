<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Log the request for debugging
error_log('add_product.php called with method: ' . $_SERVER['REQUEST_METHOD']);
error_log('POST data: ' . print_r($_POST, true));
error_log('FILES data: ' . print_r($_FILES, true));

require_once __DIR__ . '/MongoInventory.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Test MongoDB connection first
    error_log('Attempting to create MongoInventory instance...');
    $mongo = new MongoInventory();
    error_log('MongoInventory instance created successfully');
    
    // Handle file upload if image is provided
    $imagePath = '';
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../img/product/';
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $fileExtension = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (in_array($fileExtension, $allowedTypes)) {
            // Generate unique filename with timestamp
            $timestamp = time();
            $productName = preg_replace('/[^a-zA-Z0-9]/', '_', $_POST['productName']);
            $fileName = "product_{$timestamp}_{$productName}.{$fileExtension}";
            $filePath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['photo']['tmp_name'], $filePath)) {
                $imagePath = "img/product/{$fileName}";
            }
        }
    }
    
    // Prepare product data
    $productData = [
        'product_name' => trim($_POST['productName']),
        'category' => trim($_POST['category']),
        'price' => (float) $_POST['price'],
        'stock_quantity' => (int) $_POST['stock'],
        'image_path' => $imagePath
    ];
    
    // Validate required fields
    if (empty($productData['product_name']) || empty($productData['category']) || $productData['price'] <= 0) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields or invalid data']);
        exit();
    }
    
    // Add product to database
    $result = $mongo->addProduct($productData);
    
    if ($result['success']) {
        echo json_encode([
            'success' => true, 
            'message' => 'Product added successfully!',
            'product_id' => $result['product_id'],
            'image_path' => $imagePath
        ]);
    } else {
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    error_log("Critical error in add_product.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    echo json_encode([
        'success' => false, 
        'message' => 'Server error occurred: ' . $e->getMessage(),
        'debug' => $e->getMessage() // Always show error message for debugging
    ]);
}
?>