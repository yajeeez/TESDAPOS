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
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

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
    // Clean output buffer
    ob_clean();
    
    // Add debugging
    error_log("UPDATE PRODUCT REQUEST: " . print_r($_POST, true));
    
    $mongo = new MongoInventory();
    
    // Get product ID
    $productId = $_POST['productId'] ?? '';
    if (empty($productId)) {
        error_log("Error: Product ID is missing");
        echo json_encode(['success' => false, 'message' => 'Product ID is required']);
        exit();
    }
    
    error_log("Updating product with ID: " . $productId);
    
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
            $productName = preg_replace('/[^a-zA-Z0-9]/', '_', $_POST['productName'] ?? 'product');
            $fileName = "product_{$timestamp}_{$productName}.{$fileExtension}";
            $filePath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['photo']['tmp_name'], $filePath)) {
                $imagePath = "img/product/{$fileName}";
            }
        }
    }
    
    // Prepare update data
    $updateData = [];
    
    if (!empty($_POST['productName'])) {
        $updateData['product_name'] = trim($_POST['productName']);
    }
    
    if (!empty($_POST['category'])) {
        $updateData['category'] = trim($_POST['category']);
    }
    
    if (isset($_POST['price']) && $_POST['price'] !== '') {
        $updateData['price'] = (float) $_POST['price'];
    }
    
    if (isset($_POST['stock']) && $_POST['stock'] !== '') {
        $updateData['stock_quantity'] = (int) $_POST['stock'];
    }
    
    // Alternative parameter name for backward compatibility
    if (isset($_POST['stock_quantity']) && $_POST['stock_quantity'] !== '') {
        $updateData['stock_quantity'] = (int) $_POST['stock_quantity'];
    }
    
    if (!empty($imagePath)) {
        $updateData['image_path'] = $imagePath;
    }
    
    // Validate that we have something to update
    if (empty($updateData)) {
        error_log("Error: No update data provided");
        echo json_encode(['success' => false, 'message' => 'No data provided for update']);
        exit();
    }
    
    error_log("Update data: " . print_r($updateData, true));
    
    // Update product in database
    $result = $mongo->updateProduct($productId, $updateData);
    
    error_log("Update result: " . print_r($result, true));
    
    if ($result['success']) {
        $response = [
            'success' => true, 
            'message' => 'Product updated successfully!',
            'product_id' => $productId
        ];
        
        if (!empty($imagePath)) {
            $response['image_path'] = $imagePath;
        }
        
        error_log("Sending success response: " . print_r($response, true));
        echo json_encode($response);
    } else {
        error_log("Update failed: " . print_r($result, true));
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    error_log("Critical error in update_product.php: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Server error occurred: ' . $e->getMessage()
    ]);
}

ob_end_flush();
?>