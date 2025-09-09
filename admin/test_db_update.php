<?php
require_once '../connection/mongo/connection.php';

header('Content-Type: application/json');

try {
    $client = MongoConnection::getClient();
    $database = 'tesdapos';
    $collection = 'product';
    
    // Test updating a product with a photo
    $product_id = 1; // Test with product ID 1
    $photo_path = 'img/product/test_photo.jpg';
    
    // Prepare update data
    $update_data = [
        'product_name' => 'Test Product Updated',
        'category' => 'Food',
        'price' => 99.99,
        'stock_quantity' => 50,
        'photo' => $photo_path
    ];
    
    // Create filter to find the product by ID
    $filter = ['id' => intval($product_id)];
    
    // Create update command
    $update = new MongoDB\Driver\BulkWrite();
    $update->update(
        $filter,
        ['$set' => $update_data],
        ['multi' => false, 'upsert' => false]
    );
    
    // Execute update
    $result = $client->executeBulkWrite("$database.$collection", $update);
    
    echo json_encode([
        'success' => true,
        'message' => 'Database update test completed',
        'modified_count' => $result->getModifiedCount(),
        'update_data' => $update_data
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database update test failed: ' . $e->getMessage()
    ]);
}
?>
