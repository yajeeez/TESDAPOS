<?php
// Start output buffering to catch any unwanted output
ob_start();

require_once '../connection/mongo/connection.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Only POST method allowed']);
    exit();
}

try {
    $client = MongoConnection::getClient();
    $database = 'tesdapos';
    $collection = 'product';
    
    // Get form data
    $product_id = $_POST['product_id'] ?? null;
    $product_name = $_POST['product_name'] ?? null;
    $category = $_POST['category'] ?? null;
    $price = floatval($_POST['price'] ?? 0);
    $stock_quantity = intval($_POST['stock_quantity'] ?? 0);
    
    error_log("Received product_id: " . $product_id . " (type: " . gettype($product_id) . ")");
    error_log("Received product_name: " . $product_name);
    
    if (!$product_id || !$product_name || !$category) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        ob_end_flush();
        exit();
    }
    
    // Handle photo upload
    $photo_path = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        error_log("Photo upload detected for product ID: " . $product_id);
        $upload_dir = '../img/product/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
            error_log("Created upload directory: " . $upload_dir);
        }
        
        $file_extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        error_log("File extension: " . $file_extension);
        error_log("File size: " . $_FILES['photo']['size']);
        
        if (in_array(strtolower($file_extension), $allowed_extensions)) {
            $new_filename = 'product_' . $product_id . '_' . time() . '.' . $file_extension;
            $photo_path = $upload_dir . $new_filename;
            
            error_log("Attempting to move file to: " . $photo_path);
            
            if (move_uploaded_file($_FILES['photo']['tmp_name'], $photo_path)) {
                // Convert to URL path for frontend access
                $photo_path = 'img/product/' . $new_filename;
                error_log("File uploaded successfully: " . $photo_path);
            } else {
                error_log("Failed to move uploaded file");
                ob_clean();
                echo json_encode(['success' => false, 'error' => 'Failed to upload photo']);
                ob_end_flush();
                exit();
            }
        } else {
            error_log("Invalid file extension: " . $file_extension);
            ob_clean();
            echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed']);
            ob_end_flush();
            exit();
        }
    } else {
        error_log("No photo upload or upload error: " . ($_FILES['photo']['error'] ?? 'No file'));
    }
    
    // Prepare update data (don't store photo path in database)
    $update_data = [
        'product_name' => $product_name,
        'category' => $category,
        'price' => $price,
        'stock_quantity' => $stock_quantity
    ];
    
    // Note: Photo is saved locally in img/product/ folder but not stored in database
    // The frontend will look for images based on product ID
    
    // Create filter to find the product by ID
    $filter = ['id' => intval($product_id)];
    
    error_log("Searching for product with filter: " . json_encode($filter));
    
    // First, let's check if the product exists
    $query = new MongoDB\Driver\Query($filter);
    $cursor = $client->executeQuery("$database.$collection", $query);
    $existing_products = iterator_to_array($cursor);
    error_log("Found " . count($existing_products) . " products matching the filter");
    
    if (count($existing_products) === 0) {
        // Let's see what products exist in the database
        $all_query = new MongoDB\Driver\Query([]);
        $all_cursor = $client->executeQuery("$database.$collection", $all_query);
        $all_products = iterator_to_array($all_cursor);
        error_log("All products in database: " . json_encode(array_map(function($p) { return ['id' => $p->id, 'name' => $p->product_name]; }, $all_products)));
    }
    
    // Create update command
    $update = new MongoDB\Driver\BulkWrite();
    $update->update(
        $filter,
        ['$set' => $update_data],
        ['multi' => false, 'upsert' => false]
    );
    
    // Execute update
    $result = $client->executeBulkWrite("$database.$collection", $update);
    
    if ($result->getModifiedCount() > 0) {
        // Clear any output buffer content
        ob_clean();
        
        $response = [
            'success' => true,
            'message' => 'Product updated successfully!',
            'modified_count' => $result->getModifiedCount(),
            'image_uploaded' => $photo_path ? true : false,
            'image_path' => $photo_path
        ];
        
        error_log("Response data: " . json_encode($response));
        
        echo json_encode($response);
    } else {
        // Clear any output buffer content
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'No product was updated. Product ID may not exist.'
        ]);
    }
    
} catch (Exception $e) {
    // Clear any output buffer content
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update product: ' . $e->getMessage()
    ]);
}

// Clean output buffer and send response
ob_end_flush();
?>
