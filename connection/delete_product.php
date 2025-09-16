<?php
// Start output buffering to prevent headers already sent errors
ob_start();

// Set proper headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once '../config/database.php';

try {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method is allowed');
    }

    // Check if productId is provided
    if (!isset($_POST['productId']) || empty($_POST['productId'])) {
        throw new Exception('Product ID is required');
    }

    $productId = $_POST['productId'];

    // Connect to MongoDB
    $client = new MongoDB\Client($mongoUri);
    $database = $client->selectDatabase($databaseName);
    $collection = $database->selectCollection('products');

    // Convert productId to ObjectId if it's a valid ObjectId string
    if (preg_match('/^[a-f\d]{24}$/i', $productId)) {
        $objectId = new MongoDB\BSON\ObjectId($productId);
    } else {
        // If it's not a valid ObjectId, treat it as a string
        $objectId = $productId;
    }

    // Find the product first to get image info
    $product = $collection->findOne(['_id' => $objectId]);
    
    if (!$product) {
        throw new Exception('Product not found');
    }

    // Delete the product from database
    $deleteResult = $collection->deleteOne(['_id' => $objectId]);

    if ($deleteResult->getDeletedCount() === 0) {
        throw new Exception('Failed to delete product from database');
    }

    // If product had an image, try to delete it from file system
    if (isset($product['image_path']) && !empty($product['image_path'])) {
        $imagePath = '../' . $product['image_path'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }

    // Return success response
    $response = [
        'success' => true,
        'message' => 'Product deleted successfully',
        'deleted_id' => $productId
    ];

    // Clean output buffer and send JSON response
    ob_clean();
    echo json_encode($response);
    ob_end_flush();

} catch (Exception $e) {
    // Handle errors
    $response = [
        'success' => false,
        'error' => $e->getMessage()
    ];

    // Clean output buffer and send error response
    ob_clean();
    echo json_encode($response);
    ob_end_flush();
}
?>